"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  status: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; nameEn: string | null };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  recharge: { label: "شحن", color: "text-green-600", icon: "+" },
  purchase: { label: "شراء", color: "text-red-600", icon: "-" },
  refund: { label: "استرداد", color: "text-blue-600", icon: "+" },
  reward: { label: "مكافأة", color: "text-yellow-600", icon: "+" },
  cashback: { label: "كاش باك", color: "text-purple-600", icon: "+" },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  completed: { label: "مكتمل", color: "bg-green-100 text-green-700" },
  pending: { label: "معلق", color: "bg-yellow-100 text-yellow-700" },
  failed: { label: "فشل", color: "bg-red-100 text-red-700" },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemMsg, setRedeemMsg] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [activeTab, setActiveTab] = useState<"wallet" | "orders" | "transactions">("wallet");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/wallet").then((r) => r.json()).then(setWallet);
      fetch("/api/orders").then((r) => r.json()).then(setOrders);
    }
  }, [session]);

  const handleRedeem = async () => {
    setRedeemMsg("");
    setRedeemError("");
    if (!redeemCode.trim()) return;

    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: redeemCode }),
    });

    const data = await res.json();
    if (res.ok) {
      setRedeemMsg(`تم شحن $${data.value} بنجاح! الرصيد الجديد: $${data.newBalance}`);
      setRedeemCode("");
      fetch("/api/wallet").then((r) => r.json()).then(setWallet);
    } else {
      setRedeemError(data.error || "الكود غير صالح");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* User Info Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {session.user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{session.user.name}</h1>
            <p className="text-indigo-200">{session.user.email}</p>
            <p className="text-indigo-200 mt-1">
              رقم التعريف: <span className="font-mono bg-white/20 px-2 py-1 rounded">{session.user.uniqueId}</span>
            </p>
            {(session.user.role === "admin" || session.user.role === "superadmin") && (
              <span className="inline-block mt-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                {session.user.role === "superadmin" ? "المسؤول الرئيسي" : "مساعد إداري"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          💰 المحفظة
        </h2>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-4">
          <p className="text-sm text-gray-500">الرصيد الحالي</p>
          <p className="text-4xl font-bold text-green-600">
            ${wallet?.balance?.toFixed(2) || "0.00"}
          </p>
        </div>

        {/* Redeem Code Section */}
        <div className="flex gap-3">
          <input
            type="text"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value)}
            placeholder="أدخل كود الشحن"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleRedeem}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            شحن
          </button>
        </div>
        {redeemMsg && (
          <p className="text-green-600 mt-2 text-sm">{redeemMsg}</p>
        )}
        {redeemError && (
          <p className="text-red-600 mt-2 text-sm">{redeemError}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          {(["wallet", "orders", "transactions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-center font-medium transition ${
                activeTab === tab
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "wallet" ? "💰 المحفظة" : tab === "orders" ? "🛒 الطلبات" : "📋 سجل المعاملات"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "wallet" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${wallet?.transactions?.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0).toFixed(2) || "0.00"}
                  </p>
                  <p className="text-sm text-gray-500">إجمالي الشحن</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    ${Math.abs(wallet?.transactions?.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0) || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">إجمالي المشتريات</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد طلبات بعد</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-gray-400">#{order.id.slice(-8)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status === "completed" ? "مكتمل" : "معلق"}
                      </span>
                    </div>
                    {order.items.map((item) => (
                      <p key={item.id} className="text-sm">
                        {item.product.name} × {item.quantity} — <span className="font-bold">${item.price}</span>
                      </p>
                    ))}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t">
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("ar")}
                      </span>
                      <span className="font-bold text-indigo-600">${order.total}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-2">
              {!wallet?.transactions?.length ? (
                <p className="text-gray-500 text-center py-8">لا توجد معاملات بعد</p>
              ) : (
                wallet.transactions.map((tx) => {
                  const info = typeLabels[tx.type] || { label: tx.type, color: "text-gray-600", icon: "" };
                  const statusInfo = statusLabels[tx.status] || statusLabels.completed;

                  return (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                          tx.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {info.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{info.label}</p>
                          <p className="text-xs text-gray-400">{tx.description || "—"}</p>
                          <p className="text-xs text-gray-300">
                            {new Date(tx.createdAt).toLocaleString("ar")}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${info.color}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount.toFixed(2)}$
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
