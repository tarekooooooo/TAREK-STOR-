"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  totalUsers: number;
  totalOrders: number;
  totalVisits: number;
  totalRevenue: number;
  topCountries: Array<{ country: string; count: number }>;
  userGrowth: Array<{ month: string; count: number }>;
  walletLogs: Array<{
    id: string;
    type: string;
    amount: number;
    description: string | null;
    createdAt: string;
    wallet: { user: { name: string | null; uniqueId: string } };
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "countries" | "growth" | "wallet">("overview");

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">الإحصائيات</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="المستخدمون" value={data?.totalUsers || 0} color="bg-blue-500" />
        <StatCard title="الطلبات" value={data?.totalOrders || 0} color="bg-green-500" />
        <StatCard title="الإيرادات" value={`$${(data?.totalRevenue || 0).toFixed(2)}`} color="bg-purple-500" />
        <StatCard title="الزيارات" value={data?.totalVisits || 0} color="bg-orange-500" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {(["overview", "countries", "growth", "wallet"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "overview" ? "نظرة عامة" : tab === "countries" ? "الدول" : tab === "growth" ? "نمو المستخدمين" : "سجلات المحفظة"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">أكثر الدول زيارة</h3>
                {data?.topCountries?.length === 0 ? (
                  <p className="text-gray-500">لا توجد بيانات</p>
                ) : (
                  <div className="space-y-3">
                    {data?.topCountries?.slice(0, 5).map((c, i) => (
                      <div key={c.country} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{c.country}</span>
                            <span className="text-sm text-gray-500">{c.count} زيارة</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div
                              className="h-2 bg-indigo-500 rounded-full"
                              style={{
                                width: `${(c.count / (data?.topCountries?.[0]?.count || 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">نمو المستخدمين</h3>
                {data?.userGrowth?.length === 0 ? (
                  <p className="text-gray-500">لا توجد بيانات</p>
                ) : (
                  <div className="space-y-2">
                    {data?.userGrowth?.map((g) => (
                      <div key={g.month} className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm font-medium">{g.month}</span>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                          +{g.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "countries" && (
            <div>
              <h3 className="text-lg font-bold mb-4">الزيارات حسب الدولة</h3>
              {data?.topCountries?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد بيانات زيارات بعد</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-right py-3 px-4">#</th>
                        <th className="text-right py-3 px-4">الدولة</th>
                        <th className="text-right py-3 px-4">عدد الزيارات</th>
                        <th className="text-right py-3 px-4">النسبة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.topCountries?.map((c, i) => (
                        <tr key={c.country} className="border-b">
                          <td className="py-3 px-4">{i + 1}</td>
                          <td className="py-3 px-4 font-medium">{c.country}</td>
                          <td className="py-3 px-4">{c.count}</td>
                          <td className="py-3 px-4">
                            {((c.count / (data?.totalVisits || 1)) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "growth" && (
            <div>
              <h3 className="text-lg font-bold mb-4">نمو قاعدة المستخدمين الشهري</h3>
              {data?.userGrowth?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد بيانات بعد</p>
              ) : (
                <div className="space-y-4">
                  {data?.userGrowth?.map((g) => {
                    const maxCount = Math.max(...(data?.userGrowth?.map((x) => x.count) || [1]));
                    return (
                      <div key={g.month} className="flex items-center gap-4">
                        <span className="text-sm font-mono w-20">{g.month}</span>
                        <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-end px-3"
                            style={{ width: `${Math.max((g.count / maxCount) * 100, 10)}%` }}
                          >
                            <span className="text-white text-xs font-bold">{g.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "wallet" && (
            <div>
              <h3 className="text-lg font-bold mb-4">سجلات عمليات المحفظة</h3>
              {data?.walletLogs?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد عمليات بعد</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-right py-3 px-4">المستخدم</th>
                        <th className="text-right py-3 px-4">رقم التعريف</th>
                        <th className="text-right py-3 px-4">النوع</th>
                        <th className="text-right py-3 px-4">المبلغ</th>
                        <th className="text-right py-3 px-4">الوصف</th>
                        <th className="text-right py-3 px-4">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.walletLogs?.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{log.wallet?.user?.name || "—"}</td>
                          <td className="py-3 px-4 font-mono">{log.wallet?.user?.uniqueId}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              log.type === "recharge"
                                ? "bg-green-100 text-green-700"
                                : log.type === "purchase"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {log.type === "recharge" ? "شحن" : log.type === "purchase" ? "شراء" : "استرداد"}
                            </span>
                          </td>
                          <td className={`py-3 px-4 font-bold ${log.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                            {log.amount > 0 ? "+" : ""}${Math.abs(log.amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-xs">{log.description || "—"}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {new Date(log.createdAt).toLocaleDateString("ar")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-6 text-white`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-white/80 text-sm mt-1">{title}</p>
    </div>
  );
}
