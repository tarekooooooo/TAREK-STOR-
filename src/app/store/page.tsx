"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback } from "react";
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
  salesCount: number;
  avgRating: number;
  reviewCount: number;
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
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
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

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const q = query.toLowerCase();
    const results = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
    setSearchResults(results.slice(0, 8));
    setShowSearch(true);
  }, [products]);

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

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">المتجر</h1>
        <CurrencySelector
          currentCurrency={currency}
          onCurrencyChange={setCurrency}
          locale="ar"
        />
      </div>

      {/* Instant Search */}
      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => search && setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            placeholder="ابحث عن منتج..."
            className="w-full px-5 py-4 border border-gray-200 rounded-2xl text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {showSearch && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border rounded-2xl shadow-xl overflow-hidden">
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setShowSearch(false);
                  setSearch("");
                  handlePurchase(p.id);
                }}
                className="w-full text-right px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 border-b last:border-0"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-lg">
                  {p.type === "service" ? "🔧" : "📦"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
                <span className="font-bold text-indigo-600">{formatPrice(p.price, currency)}</span>
              </button>
            ))}
          </div>
        )}
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
          <p className="text-5xl mb-4">🏪</p>
          <p className="text-gray-500 text-lg">لا توجد منتجات حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group"
            >
              {/* Product Image/Icon */}
              <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-6xl group-hover:scale-105 transition">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  product.type === "service" ? "🔧" : "📦"
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${
                    product.type === "service" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {product.type === "service" ? "خدمة" : "منتج"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>

                {/* Rating and Sales */}
                <div className="flex items-center justify-between mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    {renderStars(product.avgRating)}
                    <span className="text-xs text-gray-400 mr-1">({product.reviewCount})</span>
                  </div>
                  {product.salesCount > 0 && (
                    <span className="text-xs text-gray-400">
                      تم بيع {product.salesCount} مرة
                    </span>
                  )}
                </div>

                {/* Stock indicator */}
                {product.stock !== -1 && product.stock <= 5 && product.stock > 0 && (
                  <p className="text-xs text-orange-500 mb-2">
                    باقي {product.stock} فقط!
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-indigo-600">
                      {formatPrice(product.price, currency)}
                    </p>
                    {currency !== "USD" && (
                      <p className="text-xs text-gray-400">${product.price}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handlePurchase(product.id)}
                    disabled={product.stock === 0}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {product.stock === 0 ? "نفد" : "شراء"}
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
