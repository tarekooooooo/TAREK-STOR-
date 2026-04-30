"use client";

import { useState, useEffect } from "react";

interface WalletData {
  id: string;
  balance: number;
  user: { name: string | null; email: string; uniqueId: string };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string | null;
    createdAt: string;
  }>;
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<"recharge" | "purchase">("recharge");
  const [description, setDescription] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const fetchWallets = () => {
    fetch("/api/admin/wallets")
      .then((r) => r.json())
      .then((data) => {
        setWallets(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchWallets(); }, []);

  const handleAction = async () => {
    if (!selectedWallet || !amount) return;
    setActionMsg("");

    const numAmount = type === "purchase" ? -Math.abs(amount) : Math.abs(amount);

    const res = await fetch("/api/admin/wallets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletId: selectedWallet, amount: numAmount, type, description }),
    });

    if (res.ok) {
      setActionMsg("تمت العملية بنجاح");
      setSelectedWallet(null);
      setAmount(0);
      setDescription("");
      fetchWallets();
    } else {
      setActionMsg("حدث خطأ");
    }
  };

  const filteredWallets = wallets.filter((w) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      w.user.name?.toLowerCase().includes(q) ||
      w.user.email.toLowerCase().includes(q) ||
      w.user.uniqueId.includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">إدارة المحافظ</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد أو الـ ID..."
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Action Modal */}
      {selectedWallet && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-indigo-200">
          <h3 className="text-lg font-bold mb-4">عملية على المحفظة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">النوع</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "recharge" | "purchase")}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="recharge">شحن (إضافة)</option>
                <option value="purchase">خصم</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المبلغ ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الوصف</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="سبب العملية"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAction}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              تنفيذ
            </button>
            <button
              onClick={() => setSelectedWallet(null)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              إلغاء
            </button>
          </div>
          {actionMsg && (
            <p className={`mt-2 text-sm ${actionMsg.includes("خطأ") ? "text-red-600" : "text-green-600"}`}>
              {actionMsg}
            </p>
          )}
        </div>
      )}

      {/* Wallets List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-right py-3 px-4">المستخدم</th>
                <th className="text-right py-3 px-4">الـ ID</th>
                <th className="text-right py-3 px-4">الرصيد</th>
                <th className="text-right py-3 px-4">آخر معاملة</th>
                <th className="text-right py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filteredWallets.map((w) => (
                <tr key={w.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium">{w.user.name || "—"}</p>
                    <p className="text-xs text-gray-400">{w.user.email}</p>
                  </td>
                  <td className="py-3 px-4 font-mono">#{w.user.uniqueId}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${w.balance > 0 ? "text-green-600" : "text-gray-500"}`}>
                      ${w.balance.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {w.transactions[0] ? (
                      <>
                        {w.transactions[0].type === "recharge" ? "شحن" : "خصم"}{" "}
                        ${Math.abs(w.transactions[0].amount).toFixed(2)}
                        <br />
                        {new Date(w.transactions[0].createdAt).toLocaleDateString("ar")}
                      </>
                    ) : "لا يوجد"}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedWallet(w.id)}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs hover:bg-indigo-200 transition"
                    >
                      إدارة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
