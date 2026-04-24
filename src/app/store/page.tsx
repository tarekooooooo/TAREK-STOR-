"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useExchangeRates } from "@/components/CurrencySelector";
import CurrencySelector from "@/components/CurrencySelector";


interface Product {
  id: string;
  name: string;
  nameEn: string | null;
  nameFr: string | null;
  description: string;
  descriptionEn: string | null;
  descriptionFr: string | null;
  price: number;
  image: string | null;
  category: string;
  type: string;
  stock: number;
  isActive: boolean;
}

export default function StorePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "product" | "service">("all");
  const [category, setCategory] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [purchaseMsg, setPurchaseMsg] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [deliveryContent, setDeliveryContent] = useState("");
  const { formatPrice } = useExchangeRates();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    if (filter !== "all" && p.type !== filter) return false;
    if (category && p.category !== category) return false;
    return true;
  });

  const handlePurchase = async (productId: string) => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setPurchaseMsg("");
    setPurchaseError("");
    setDeliveryContent("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    const data = await res.json();
    if (res.ok) {
      setPurchaseMsg("تم الشراء بنجاح!");
      if (data.deliveryContent) {
        setDeliveryContent(data.deliveryContent);
      }
    } else {
      setPurchaseError(
        data.error === "Insufficient balance"
          ? "رصيد غير كافي. يرجى شحن محفظتك أولاً"
          : data.error === "Out of stock"
          ? "المنتج غير متوفر حالياً"
          : data.error || "حدث خطأ"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">المتجر</h1>
        <CurrencySelector
          currentCurrency={currency}
          onCurrencyChange={setCurrency}
          locale="ar"
        />
      </div>

      {/* Notification Messages */}
      {purchaseMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {purchaseMsg}
          {deliveryContent && (
            <div className="mt-2 bg-white p-3 rounded border">
              <p className="font-bold text-sm mb-1">المحتوى الرقمي:</p>
              <p className="font-mono text-sm break-all">{deliveryContent}</p>
            </div>
          )}
        </div>
      )}
      {purchaseError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {purchaseError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(["all", "product", "service"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === f ? "bg-white shadow text-indigo-600" : "text-gray-600"
              }`}
            >
              {f === "all" ? "الكل" : f === "product" ? "منتجات" : "خدمات"}
            </button>
          ))}
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">جميع التصنيفات</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">لا توجد منتجات حالياً</p>
          <p className="text-gray-400 mt-2">يمكن للمدير إضافة منتجات من لوحة التحكم</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group"
            >
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">
                    {product.type === "service" ? "🛠️" : "📦"}
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.type === "service"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {product.type === "service" ? "خدمة" : "منتج"}
                  </span>
                  <span className="text-xs text-gray-500">{product.category}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-indigo-600">
                    {formatPrice(product.price, currency)}
                  </span>
                  <button
                    onClick={() => handlePurchase(product.id)}
                    disabled={product.stock === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                      product.stock === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {product.stock === 0 ? "نفذ" : "شراء"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
