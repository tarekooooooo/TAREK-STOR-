"use client";

import { useState, useEffect } from "react";

interface Tournament {
  id: string;
  name: string;
  type: string;
  participationType: string;
  maxPlayers: number;
  entryFee: number;
  prize: number;
  hasReward: boolean;
  status: string;
  startDate: string | null;
  city: string | null;
  _count: { participants: number };
}

const emptyTournament = {
  name: "", nameEn: "", nameFr: "",
  description: "", descriptionEn: "", descriptionFr: "",
  type: "classic",
  participationType: "solo",
  maxPlayers: 100,
  entryFee: 0,
  prize: 0,
  hasReward: false,
  rewardDescription: "",
  rules: "1. يمنع استخدام أي تطبيقات خارجية أو برامج غش\n2. يمنع التعاون مع لاعبين خارج الفريق\n3. يجب الالتزام بموعد البطولة\n4. القرارات النهائية تعود للإدارة",
  startDate: "",
  endDate: "",
  image: "",
  city: "",
  country: "",
};

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyTournament);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchTournaments = () => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((data) => {
        setTournaments(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchTournaments(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        maxPlayers: form.type === "classic" ? 100 : 8,
        entryFee: Number(form.entryFee),
        prize: Number(form.prize),
      }),
    });

    if (res.ok) {
      setShowForm(false);
      setForm(emptyTournament);
      fetchTournaments();
    } else {
      setError("حدث خطأ أثناء إنشاء البطولة");
    }
    setSaving(false);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    open: { label: "مفتوحة", color: "bg-green-100 text-green-700" },
    full: { label: "ممتلئة", color: "bg-yellow-100 text-yellow-700" },
    in_progress: { label: "جارية", color: "bg-blue-100 text-blue-700" },
    completed: { label: "مكتملة", color: "bg-gray-100 text-gray-700" },
    cancelled: { label: "ملغاة", color: "bg-red-100 text-red-700" },
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">البطولات</h1>
        <button
          onClick={() => { setForm(emptyTournament); setShowForm(!showForm); }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
        >
          {showForm ? "إلغاء" : "إنشاء بطولة +"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-8 space-y-4">
          <h2 className="text-xl font-bold">إنشاء بطولة جديدة</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم البطولة</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="classic">كلاسيك (100 لاعب)</option>
                <option value="warehouse">مستودع (8 لاعبين)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع المشاركة</label>
              <select
                value={form.participationType}
                onChange={(e) => setForm({ ...form, participationType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="solo">سولو (فردي)</option>
                <option value="duo">ثنائي (Duo)</option>
                <option value="squad">رباعي (Squad)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رسوم التسجيل ($)</label>
              <input
                type="number"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: Number(e.target.value) })}
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-400 mt-1">0 = مجاني</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الجائزة ($)</label>
              <input
                type="number"
                value={form.prize}
                onChange={(e) => setForm({ ...form, prize: Number(e.target.value) })}
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={form.hasReward}
                onChange={(e) => setForm({ ...form, hasReward: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm">بطولة بمكافأة</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">القوانين</label>
            <textarea
              value={form.rules}
              onChange={(e) => setForm({ ...form, rules: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {saving ? "جاري الإنشاء..." : "إنشاء البطولة"}
          </button>
        </form>
      )}

      {/* Tournaments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tournaments.map((t) => {
          const statusInfo = statusLabels[t.status] || statusLabels.open;
          return (
            <div key={t.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold">{t.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">النوع:</span>{" "}
                  {t.type === "classic" ? "كلاسيك" : "مستودع"}
                </p>
                <p>
                  <span className="font-medium">المشاركة:</span>{" "}
                  {t.participationType === "solo" ? "سولو" : t.participationType === "duo" ? "ثنائي" : "رباعي"}
                </p>
                <p>
                  <span className="font-medium">اللاعبين:</span>{" "}
                  {t._count.participants}/{t.maxPlayers}
                </p>
                <p>
                  <span className="font-medium">الرسوم:</span>{" "}
                  {t.entryFee === 0 ? "مجاني" : `$${t.entryFee}`}
                </p>
                {t.prize > 0 && (
                  <p>
                    <span className="font-medium">الجائزة:</span> ${t.prize}
                  </p>
                )}
                {t.startDate && (
                  <p>
                    <span className="font-medium">التاريخ:</span>{" "}
                    {new Date(t.startDate).toLocaleDateString("ar")}
                  </p>
                )}
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${(t._count.participants / t.maxPlayers) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">لا توجد بطولات بعد</p>
        </div>
      )}
    </div>
  );
}
