"use client";

import { useState, useEffect } from "react";

interface RedeemCodeData {
  id: string;
  code: string;
  value: number;
  isUsed: boolean;
  usedBy: string | null;
  usedAt: string | null;
  createdAt: string;
}

export default function AdminRedeemCodesPage() {
  const [codes, setCodes] = useState<RedeemCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [value, setValue] = useState(10);
  const [count, setCount] = useState(5);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchCodes = () => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setCodes(d.redeemCodes || []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedCodes([]);

    const res = await fetch("/api/redeem", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, count }),
    });

    const data = await res.json();
    if (res.ok) {
      setGeneratedCodes(data.codes);
      fetchCodes();
    }
    setGenerating(false);
  };

  const copyAllCodes = () => {
    const text = generatedCodes.join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">أكواد الشحن</h1>

      {/* Generate Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">توليد أكواد جديدة</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الكود ($)</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              min={1}
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عدد الأكواد</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={1}
              max={100}
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {generating ? "جاري التوليد..." : "توليد"}
          </button>
        </div>

        {/* Generated Codes Display */}
        {generatedCodes.length > 0 && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-green-700">
                تم توليد {generatedCodes.length} كود بقيمة ${value} لكل كود
              </h3>
              <button
                onClick={copyAllCodes}
                className="text-sm bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
              >
                {copied ? "تم النسخ!" : "نسخ الكل"}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {generatedCodes.map((code) => (
                <code key={code} className="bg-white px-3 py-2 rounded border text-sm font-mono text-center">
                  {code}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Codes Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-right py-3 px-4">الكود</th>
                <th className="text-right py-3 px-4">القيمة</th>
                <th className="text-right py-3 px-4">الحالة</th>
                <th className="text-right py-3 px-4">مستخدم بواسطة</th>
                <th className="text-right py-3 px-4">تاريخ الإنشاء</th>
                <th className="text-right py-3 px-4">تاريخ الاستخدام</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-bold">{code.code}</td>
                  <td className="py-3 px-4">${code.value}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      code.isUsed ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {code.isUsed ? "مستخدم" : "متاح"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{code.usedBy || "—"}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {new Date(code.createdAt).toLocaleDateString("ar")}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {code.usedAt ? new Date(code.usedAt).toLocaleDateString("ar") : "—"}
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
