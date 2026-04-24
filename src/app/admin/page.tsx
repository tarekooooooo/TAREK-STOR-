"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  totalUsers: number;
  totalOrders: number;
  totalVisits: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string | null; uniqueId: string };
    items: Array<{ product: { name: string }; quantity: number }>;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="إجمالي المستخدمين" value={data?.totalUsers || 0} icon="👥" color="blue" />
        <StatCard title="إجمالي الطلبات" value={data?.totalOrders || 0} icon="🛒" color="green" />
        <StatCard title="إجمالي الإيرادات" value={`$${(data?.totalRevenue || 0).toFixed(2)}`} icon="💰" color="purple" />
        <StatCard title="إجمالي الزيارات" value={data?.totalVisits || 0} icon="👁️" color="orange" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">أحدث الطلبات</h2>
        {data?.recentOrders?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا توجد طلبات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-right py-3 px-2">رقم الطلب</th>
                  <th className="text-right py-3 px-2">المستخدم</th>
                  <th className="text-right py-3 px-2">المنتجات</th>
                  <th className="text-right py-3 px-2">المبلغ</th>
                  <th className="text-right py-3 px-2">الحالة</th>
                  <th className="text-right py-3 px-2">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders?.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-mono text-xs">#{order.id.slice(-8)}</td>
                    <td className="py-3 px-2">
                      {order.user?.name || "—"}
                      <br />
                      <span className="text-xs text-gray-400">#{order.user?.uniqueId}</span>
                    </td>
                    <td className="py-3 px-2">
                      {order.items.map((item) => `${item.product.name} ×${item.quantity}`).join(", ")}
                    </td>
                    <td className="py-3 px-2 font-bold">${order.total}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status === "completed" ? "مكتمل" : "معلق"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("ar")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-white/80 text-sm mt-1">{title}</p>
    </div>
  );
}
