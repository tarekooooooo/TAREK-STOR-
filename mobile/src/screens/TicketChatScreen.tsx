import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { SupportStackParamList } from "../navigation/types";
import { SupportMessage } from "../types";
import { colors } from "../theme";

type Props = NativeStackScreenProps<SupportStackParamList, "TicketChat">;

export default function TicketChatScreen({ route, navigation }: Props) {
  const { ticketId, subject } = route.params;
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiRequest<SupportMessage[]>(
        `/api/support/tickets/${ticketId}/messages`,
        { token }
      );
      setMessages(data);
    } catch (e) {
      Alert.alert("خطأ", e instanceof Error ? e.message : "تعذّر تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  }, [ticketId, token]);

  useEffect(() => {
    navigation.setOptions({ title: subject });
    load();
  }, [load, navigation, subject]);

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      const message = await apiRequest<SupportMessage>(
        `/api/support/tickets/${ticketId}/messages`,
        { method: "POST", body: { body: body.trim() }, token }
      );
      setMessages((prev) => [...prev, message]);
      setBody("");
    } catch (e) {
      Alert.alert("تعذّر الإرسال", e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setSending(false);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>ابدأ المحادثة</Text>}
        renderItem={({ item }) => {
          const mine = item.senderId === user?.id;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>
                {mine ? "أنت" : item.sender?.name || "الدعم"} •{" "}
                {new Date(item.createdAt).toLocaleString("ar")}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="اكتب رسالتك..."
          placeholderTextColor={colors.muted}
          value={body}
          onChangeText={setBody}
        />
        <TouchableOpacity style={styles.button} onPress={send} disabled={sending}>
          <Text style={styles.buttonText}>{sending ? "..." : "إرسال"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "85%", borderRadius: 16, padding: 12, marginBottom: 10 },
  mine: { backgroundColor: colors.primary, alignSelf: "flex-end" },
  theirs: { backgroundColor: colors.card, alignSelf: "flex-start" },
  body: { color: "#fff" },
  time: { color: "#e2e8f0", fontSize: 10, marginTop: 6 },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  empty: { color: colors.muted, textAlign: "center", marginTop: 30 },
});
