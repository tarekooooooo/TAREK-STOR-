import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { StoreStackParamList } from "../navigation/types";
import { Order } from "../types";
import { colors } from "../theme";

type Props = NativeStackScreenProps<StoreStackParamList, "ProductDetail">;

export default function ProductDetailScreen({ route }: Props) {
  const { product } = route.params;
  const { token } = useAuth();
  const { add } = useCart();
  const [buying, setBuying] = useState(false);

  const buyNow = async () => {
    setBuying(true);
    try {
      const result = await apiRequest<{ order: Order; deliveryContent: string | null }>(
        "/api/orders",
        { method: "POST", body: { productId: product.id, quantity: 1 }, token }
      );
      Alert.alert(
        "تم الشراء",
        result.deliveryContent
          ? `تم تنفيذ الطلب.\n\nالمحتوى: ${result.deliveryContent}`
          : "تم تنفيذ الطلب بنجاح"
      );
    } catch (e) {
      Alert.alert("تعذّر الشراء", e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setBuying(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.category}>{product.category}</Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.stock}>
        {product.stock === -1 ? "متوفر" : `المتبقي: ${product.stock}`}
      </Text>

      <TouchableOpacity style={styles.buyButton} onPress={buyNow} disabled={buying}>
        <Text style={styles.buyText}>{buying ? "جارٍ الشراء..." : "شراء الآن"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => {
          add(product);
          Alert.alert("السلة", "تمت إضافة المنتج إلى السلة");
        }}
      >
        <Text style={styles.cartText}>إضافة إلى السلة</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  image: { width: "100%", height: 220, borderRadius: 16 },
  placeholder: { backgroundColor: colors.card },
  name: { color: colors.text, fontSize: 22, fontWeight: "bold", marginTop: 16 },
  category: { color: colors.muted, marginTop: 4 },
  price: { color: colors.primary, fontSize: 22, fontWeight: "bold", marginTop: 12 },
  description: { color: colors.text, marginTop: 12, lineHeight: 22 },
  stock: { color: colors.muted, marginTop: 12 },
  buyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buyText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cartButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  cartText: { color: colors.primary, fontWeight: "bold", fontSize: 16 },
});
