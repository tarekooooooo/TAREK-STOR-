import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { apiRequest } from "../lib/api";
import { Product } from "../types";
import { StoreStackParamList } from "../navigation/types";
import { colors } from "../theme";

type Props = NativeStackScreenProps<StoreStackParamList, "Products">;

export default function StoreScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (query: string) => {
    setError(null);
    try {
      const data = await apiRequest<Product[]>(
        `/api/products${query ? `?search=${encodeURIComponent(query)}` : ""}`
      );
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(search);
  }, [load, search]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="ابحث عن منتج..."
        placeholderTextColor={colors.muted}
        value={search}
        onChangeText={setSearch}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => load(search)} tintColor={colors.primary} />
        }
        ListEmptyComponent={<Text style={styles.empty}>لا توجد منتجات</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ProductDetail", { product: item })}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.placeholder]} />
            )}
            <View style={styles.cardBody}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  search: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    textAlign: "right",
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  image: { width: 92, height: 92 },
  placeholder: { backgroundColor: colors.border },
  cardBody: { flex: 1, padding: 12, justifyContent: "center" },
  name: { color: colors.text, fontSize: 16, fontWeight: "bold" },
  category: { color: colors.muted, fontSize: 12, marginTop: 2 },
  price: { color: colors.primary, fontSize: 16, fontWeight: "bold", marginTop: 6 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40 },
  error: { color: colors.danger, textAlign: "center", marginBottom: 8 },
});
