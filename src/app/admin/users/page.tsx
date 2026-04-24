"use client";

import { useState, useEffect } from "react";

interface UserData {
  id: string;
  uniqueId: string;
  name: string | null;
  email: string;
  role: string;
  country: string | null;
  createdAt: string;
  wallet: { balance: number } | null;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        setUsers(Array.isArray(d) ? d : []);
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
      <h1 className="text-3xl font-bold mb-8">المستخدمون ({users.length})</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-12">لا يوجد مستخدمون بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-right py-3 px-4">رقم التعريف</th>
                  <th className="text-right py-3 px-4">الاسم</th>
                  <th className="text-right py-3 px-4">البريد</th>
                  <th className="text-right py-3 px-4">الدور</th>
                  <th className="text-right py-3 px-4">الرصيد</th>
                  <th className="text-right py-3 px-4">الطلبات</th>
                  <th className="text-right py-3 px-4">الدولة</th>
                  <th className="text-right py-3 px-4">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono font-bold">{user.uniqueId}</td>
                    <td className="py-3 px-4">{user.name || "—"}</td>
                    <td className="py-3 px-4 text-xs">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {user.role === "admin" ? "مدير" : "مستخدم"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">${user.wallet?.balance?.toFixed(2) || "0.00"}</td>
                    <td className="py-3 px-4">{user._count.orders}</td>
                    <td className="py-3 px-4">{user.country || "—"}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("ar")}
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
