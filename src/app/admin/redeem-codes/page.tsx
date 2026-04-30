"use client";

import { useState, useEffect } from "react";

interface RedeemCode {
  id: string;
  code: string;
  value: number;
  isUsed: boolean;
  usedBy: string | null;
  usedAt: string | null;
  createdAt: string;
}

export default function AdminRedeemCodesPage() {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genValue, setGenValue] = useState(5);
  const [genCount, setGenCount] = useState(1);
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [showGen, setShowGen] = useState(false);

  const fetchCodes = () => {
    fetch("/api/admin/redeem-codes")
      .then((r) => r.json())
      .then((data) => {
        setCodes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setNewCodes([]);

    const res = await fetch("/api/redeem", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: genValue, count: genCount }),
    });

    if (res.ok) {
      const data = await res.json();
      setNewCodes(data.codes || []);
      fetchCodes();
    }
    setGenerating(false);
  };

  const usedCount = codes.filter((c) => c.isUsed).length;
  const totalValue = codes.filter((c) => !c.isUsed).reduce((s, c) => s + c.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">أكواد الشحن</h1>
        <button
          onClick={() => setShowGen(!showGen)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
        >
          {showGen ? "إلغاء" : "توليد أكواد +"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{codes.length}</p>
          <p className="text-sm text-gray-500">إجمالي الأكواد</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{codes.length - usedCount}</p>
          <p className="text-sm text-gray-500">غير مستخدمة</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">${totalValue}</p>
          <p className="text-sm text-gray-500">القيمة المتبقية</p>
        </div>
      </div>

      {/* Generator */}
      {showGen && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-4">
          <h2 className="text-xl font-bold">توليد أكواد جديدة</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">القيمة بالدولار ($)</label>
              <input
                type="number"
                value={genValue}
                onChange={(e) => setGenValue(Number(e.target.value))}
                min={1}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العدد (الحد الأقصى 100)</label>
              <input
                type="number"
                value={genCount}
                onChange={(e) => setGenCount(Math.min(100, Number(e.target.value)))}
                min={1}
                max={100}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {generating ? "جاري التوليد..." : `توليد ${genCount} كود`}
              </button>
            </div>
          </div>

          {newCodes.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-bold text-green-700 mb-2">تم توليد الأكواد بنجاح!</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {newCodes.map((code) => (
                  <div
                    key={code}
                    className="bg-white px-3 py-2 rounded-lg font-mono text-sm text-center border cursor-pointer hover:bg-indigo-50"
                    onClick={() => navigator.clipboard.writeText(code)}
                    title="انقر للنسخ"
                  >
                    {code}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">انقر على أي كود لنسخه</p>
            </div>
          )}
        </div>
      )}

      {/* Codes List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-right py-3 px-4">الكود</th>
                <th className="text-right py-3 px-4">القيمة</th>
                <th className="text-right py-3 px-4">الحالة</th>
                <th className="text-right py-3 px-4">مستخدم بواسطة</th>
                <th className="text-right py-3 px-4">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{code.code}</td>
                  <td className="py-3 px-4 font-bold">${code.value}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      code.isUsed ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {code.isUsed ? "مستخدم" : "متاح"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {code.usedBy ? `#${code.usedBy}` : "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">
                    {new Date(code.createdAt).toLocaleDateString("ar")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {codes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">لا توجد أكواد بعد. قم بتوليد أكواد جديدة.</p>
        </div>
      )}
    </div>
  );
}
