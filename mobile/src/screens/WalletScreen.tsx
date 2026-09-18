import React, { useCallback, useEffect, useState } from "react";
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
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Wallet } from "../types";
import { colors } from "../theme";

export default function WalletScreen() {
  const { token } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiRequest<Wallet>("/api/wallet", { token });
      setWallet(data);
    } catch (e) {
      Alert.alert("خطأ", e instanceof Error ? e.message : "تعذّر تحميل المحفظة");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const redeem = async () => {
    if (!code.trim()) return;
    setRedeeming(true);
    try {
      await apiRequest("/api/redeem", {
        method: "POST",
        body: { code: code.trim() },
        token,
      });
      setCode("");
      await load();
      Alert.alert("تم الشحن", "تمت إضافة الرصيد إلى محفظتك");
    } catch (e) {
      Alert.alert("تعذّر الشحن", e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setRedeeming(false);
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
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>الرصيد الحالي</Text>
        <Text style={styles.balance}>${(wallet?.balance ?? 0).toFixed(2)}</Text>
      </View>

      <View style={styles.redeemRow}>
        <TextInput
          style={styles.input}
          placeholder="كود الشحن"
          placeholderTextColor={colors.muted}
          autoCapitalize="characters"
          value={code}
          onChangeText={setCode}
        />
        <TouchableOpacity style={styles.button} onPress={redeem} disabled={redeeming}>
          <Text style={styles.buttonText}>{redeeming ? "..." : "شحن"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>آخر العمليات</Text>
      <FlatList
        data={wallet?.transactions ?? []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد عمليات</Text>}
        renderItem={({ item }) => (
          <View style={styles.txRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.txTitle}>{item.description || item.type}</Text>
              <Text style={styles.txDate}>
                {new Date(item.createdAt).toLocaleString("ar")}
              </Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                { color: item.amount >= 0 ? colors.success : colors.danger },
              ]}
            >
              {item.amount >= 0 ? "+" : ""}
              {item.amount.toFixed(2)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
  },
  balanceLabel: { color: "#e0e7ff" },
  balance: { color: "#fff", fontSize: 34, fontWeight: "bold", marginTop: 6 },
  redeemRow: { flexDirection: "row", gap: 8, marginTop: 18 },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 22,
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: { color: colors.text, fontWeight: "bold", fontSize: 16, marginVertical: 16 },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  txTitle: { color: colors.text },
  txDate: { color: colors.muted, fontSize: 12, marginTop: 4 },
  txAmount: { fontWeight: "bold" },
  empty: { color: colors.muted, textAlign: "center", marginTop: 20 },
});
