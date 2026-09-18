import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Order } from "../types";
import { colors } from "../theme";
import { API_URL } from "../lib/api";

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiRequest<Order[]>("/api/orders", { token });
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name || user?.email}</Text>
        <Text style={styles.meta}>{user?.email}</Text>
        <Text style={styles.meta}>المعرّف: #{user?.uniqueId}</Text>
        <Text style={styles.meta}>الدور: {user?.role}</Text>
        <Text style={styles.api}>{API_URL}</Text>
      </View>

      <Text style={styles.sectionTitle}>طلباتي</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>لا توجد طلبات</Text>}
          renderItem={({ item }) => (
            <View style={styles.orderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderTitle}>
                  {item.items.map((i) => i.product.name).join("، ")}
                </Text>
                <Text style={styles.meta}>
                  {new Date(item.createdAt).toLocaleString("ar")}
                </Text>
              </View>
              <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 18 },
  name: { color: colors.text, fontSize: 20, fontWeight: "bold" },
  meta: { color: colors.muted, marginTop: 4 },
  api: { color: colors.border, fontSize: 11, marginTop: 10 },
  sectionTitle: { color: colors.text, fontWeight: "bold", fontSize: 16, marginVertical: 16 },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  orderTitle: { color: colors.text },
  orderTotal: { color: colors.primary, fontWeight: "bold" },
  empty: { color: colors.muted, textAlign: "center", marginTop: 20 },
  logout: {
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: { color: colors.danger, fontWeight: "bold" },
});
