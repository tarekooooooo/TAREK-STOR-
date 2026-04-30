"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Tournament {
  id: string;
  name: string;
  nameEn: string | null;
  nameFr: string | null;
  description: string | null;
  type: string;
  participationType: string;
  maxPlayers: number;
  entryFee: number;
  prize: number;
  hasReward: boolean;
  rewardDescription: string | null;
  status: string;
  rules: string | null;
  startDate: string | null;
  city: string | null;
  image: string | null;
  _count: { participants: number };
}

export default function TournamentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterParticipation, setFilterParticipation] = useState("");
  const [filterFee, setFilterFee] = useState("");
  const [joining, setJoining] = useState<string | null>(null);
  const [joinMsg, setJoinMsg] = useState("");
  const [joinError, setJoinError] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [gameId, setGameId] = useState("");
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterType) params.set("type", filterType);
    if (filterParticipation) params.set("participationType", filterParticipation);
    if (filterFee) params.set("fee", filterFee);

    fetch(`/api/tournaments?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setTournaments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterType, filterParticipation, filterFee]);

  const handleJoin = async (tournamentId: string) => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setJoining(tournamentId);
    setJoinMsg("");
    setJoinError("");

    const res = await fetch("/api/tournaments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournamentId,
        teamCode: teamCode || undefined,
        gameId: gameId || undefined,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setJoinMsg(data.teamCode ? `تم التسجيل! كود الفريق: ${data.teamCode}` : "تم التسجيل بنجاح!");
      setSelectedTournament(null);
      setTeamCode("");
      setGameId("");
    } else {
      setJoinError(
        data.error === "Already registered" ? "أنت مسجل بالفعل" :
        data.error === "Insufficient balance" ? "رصيد غير كافي" :
        data.error === "Tournament is full" ? "البطولة ممتلئة" :
        data.error === "Team is full" ? "الفريق ممتلئ" :
        data.error || "حدث خطأ"
      );
    }
    setJoining(null);
  };

  const typeLabels: Record<string, string> = { classic: "كلاسيك", warehouse: "مستودع" };
  const partLabels: Record<string, string> = { solo: "سولو", duo: "ثنائي", squad: "رباعي" };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          بطولات PUBG
        </h1>
        <p className="text-gray-500 mt-2">سجل في البطولات وتنافس مع اللاعبين</p>
      </div>

      {/* Notifications */}
      {joinMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {joinMsg}
        </div>
      )}
      {joinError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {joinError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 bg-white rounded-xl p-4 shadow">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">جميع الأنواع</option>
          <option value="classic">كلاسيك</option>
          <option value="warehouse">مستودع</option>
        </select>
        <select
          value={filterParticipation}
          onChange={(e) => setFilterParticipation(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">جميع أنواع المشاركة</option>
          <option value="solo">سولو</option>
          <option value="duo">ثنائي</option>
          <option value="squad">رباعي</option>
        </select>
        <select
          value={filterFee}
          onChange={(e) => setFilterFee(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">جميع الرسوم</option>
          <option value="free">مجاني</option>
          <option value="paid">مدفوع</option>
        </select>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((t) => {
          const progress = (t._count.participants / t.maxPlayers) * 100;
          const isFull = t._count.participants >= t.maxPlayers;

          return (
            <div key={t.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    t.status === "open" ? "bg-green-400/30" : "bg-white/20"
                  }`}>
                    {t.status === "open" ? "مفتوحة" : t.status === "completed" ? "مكتملة" : t.status}
                  </span>
                  {t.prize > 0 && (
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      جائزة ${t.prize}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold">{t.name}</h3>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                    {typeLabels[t.type] || t.type}
                  </span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">
                    {partLabels[t.participationType] || t.participationType}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    t.entryFee === 0 ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                  }`}>
                    {t.entryFee === 0 ? "مجاني" : `$${t.entryFee}`}
                  </span>
                </div>

                {t.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{t.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{t._count.participants}/{t.maxPlayers} لاعب</span>
                  {t.startDate && (
                    <span>{new Date(t.startDate).toLocaleDateString("ar")}</span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isFull ? "bg-red-500" : "bg-indigo-500"}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                {/* Join section */}
                {t.status === "open" && !isFull ? (
                  selectedTournament === t.id ? (
                    <div className="space-y-2 pt-2">
                      <input
                        type="text"
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        placeholder="معرف اللعبة (PUBG ID)"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      {t.participationType !== "solo" && (
                        <input
                          type="text"
                          value={teamCode}
                          onChange={(e) => setTeamCode(e.target.value)}
                          placeholder="كود الفريق (اتركه فارغاً لإنشاء فريق جديد)"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleJoin(t.id)}
                          disabled={joining === t.id}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {joining === t.id ? "جاري التسجيل..." : "تأكيد التسجيل"}
                        </button>
                        <button
                          onClick={() => setSelectedTournament(null)}
                          className="px-4 py-2 bg-gray-100 rounded-lg text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTournament(t.id)}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                      سجل الآن
                    </button>
                  )
                ) : (
                  <div className="text-center py-2 text-gray-400 text-sm">
                    {isFull ? "البطولة ممتلئة" : "التسجيل مغلق"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🏆</p>
          <p className="text-gray-500 text-lg">لا توجد بطولات حالياً</p>
        </div>
      )}
    </div>
  );
}
