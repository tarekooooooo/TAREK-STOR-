import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Order } from "../types";
import { colors } from "../theme";

export default function CartScreen() {
  const { items, total, remove, clear } = useCart();
  const { token } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);

  const checkout = async () => {
    setCheckingOut(true);
    try {
      for (const item of items) {
        await apiRequest<{ order: Order }>("/api/orders", {
          method: "POST",
          body: { productId: item.product.id, quantity: item.quantity },
          token,
        });
      }
      clear();
      Alert.alert("تم الشراء", "تم تنفيذ جميع الطلبات بنجاح");
    } catch (e) {
      Alert.alert("تعذّر إتمام الشراء", e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        ListEmptyComponent={<Text style={styles.empty}>السلة فارغة</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.product.name}</Text>
              <Text style={styles.meta}>
                {item.quantity} × ${item.product.price.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => remove(item.product.id)}>
              <Text style={styles.remove}>حذف</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>الإجمالي: ${total.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={checkout}
            disabled={checkingOut}
          >
            <Text style={styles.buttonText}>
              {checkingOut ? "جارٍ الدفع..." : "إتمام الشراء"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  name: { color: colors.text, fontWeight: "bold" },
  meta: { color: colors.muted, marginTop: 4 },
  remove: { color: colors.danger },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40 },
  footer: { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 14 },
  total: { color: colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
