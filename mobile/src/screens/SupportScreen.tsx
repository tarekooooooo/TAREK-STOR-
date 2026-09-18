import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { SupportStackParamList } from "../navigation/types";
import { SupportTicket } from "../types";
import { colors } from "../theme";

type Props = NativeStackScreenProps<SupportStackParamList, "Tickets">;

export default function SupportScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiRequest<SupportTicket[]>("/api/support/tickets", { token });
      setTickets(data);
    } catch (e) {
      Alert.alert("خطأ", e instanceof Error ? e.message : "تعذّر تحميل التذاكر");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const createTicket = async () => {
    if (!subject.trim()) return;
    setCreating(true);
    try {
      const ticket = await apiRequest<SupportTicket>("/api/support/tickets", {
        method: "POST",
        body: { subject: subject.trim(), message: message.trim() },
        token,
      });
      setSubject("");
      setMessage("");
      await load();
      navigation.navigate("TicketChat", { ticketId: ticket.id, subject: ticket.subject });
    } catch (e) {
      Alert.alert("تعذّر إنشاء التذكرة", e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>تذكرة جديدة</Text>
        <TextInput
          style={styles.input}
          placeholder="الموضوع"
          placeholderTextColor={colors.muted}
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="اشرح مشكلتك..."
          placeholderTextColor={colors.muted}
          multiline
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.button} onPress={createTicket} disabled={creating}>
          <Text style={styles.buttonText}>
            {creating ? "جارٍ الإرسال..." : "إرسال إلى خدمة العملاء"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>تذاكري</Text>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد تذاكر</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ticket}
            onPress={() =>
              navigation.navigate("TicketChat", { ticketId: item.id, subject: item.subject })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.ticketSubject}>{item.subject}</Text>
              <Text style={styles.meta}>
                {new Date(item.createdAt).toLocaleDateString("ar")}
              </Text>
            </View>
            <Text
              style={[
                styles.status,
                { color: item.status === "open" ? colors.success : colors.muted },
              ]}
            >
              {item.status === "open" ? "مفتوحة" : "مغلقة"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  form: { backgroundColor: colors.card, borderRadius: 18, padding: 16 },
  formTitle: { color: colors.text, fontWeight: "bold", marginBottom: 10 },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    textAlign: "right",
  },
  multiline: { height: 90, textAlignVertical: "top" },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: { color: colors.text, fontWeight: "bold", fontSize: 16, marginVertical: 16 },
  ticket: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  ticketSubject: { color: colors.text, fontWeight: "bold" },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  status: { fontSize: 12, fontWeight: "bold" },
  empty: { color: colors.muted, textAlign: "center", marginTop: 20 },
});
