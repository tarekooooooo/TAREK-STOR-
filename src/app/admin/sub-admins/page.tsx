"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface SubAdmin {
  id: string;
  uniqueId: string;
  name: string | null;
  email: string;
  role: string;
  subAdminPermissions: {
    manageProducts: boolean;
    manageOrders: boolean;
    manageUsers: boolean;
    manageRedeemCodes: boolean;
    manageAnalytics: boolean;
    manageTournaments: boolean;
    manageSettings: boolean;
    viewRevenue: boolean;
    manageWallets: boolean;
    manageSupport: boolean;
  } | null;
}

const permissionLabels: Record<string, string> = {
  manageProducts: "إدارة المنتجات",
  manageOrders: "إدارة الطلبات",
  manageUsers: "إدارة المستخدمين",
  manageRedeemCodes: "إدارة أكواد الشحن",
  manageAnalytics: "عرض الإحصائيات",
  manageTournaments: "إدارة البطولات",
  manageSettings: "إدارة الإعدادات",
  viewRevenue: "عرض الإيرادات",
  manageWallets: "إدارة المحافظ",
  manageSupport: "خدمة العملاء",
};

export default function AdminSubAdminsPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; email: string; uniqueId: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    manageProducts: false,
    manageOrders: false,
    manageUsers: false,
    manageRedeemCodes: false,
    manageAnalytics: false,
    manageTournaments: false,
    manageSettings: false,
    viewRevenue: false,
    manageWallets: false,
    manageSupport: false,
  });
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = session?.user?.email === "tarekai042@gmail.com";

  const fetchAdmins = () => {
    fetch("/api/admin/sub-admins")
      .then((r) => r.json())
      .then((data) => {
        setAdmins(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchAdmins(); }, []);

  const searchUsers = async () => {
    if (!userSearch) return;
    const res = await fetch(`/api/users?search=${encodeURIComponent(userSearch)}`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  const handleAdd = async () => {
    if (!selectedUser) return;
    setSaving(true);

    await fetch("/api/admin/sub-admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser, permissions }),
    });

    setShowAdd(false);
    setSelectedUser(null);
    setUserSearch("");
    setUsers([]);
    setSaving(false);
    fetchAdmins();
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("هل أنت متأكد من إزالة صلاحيات هذا المساعد؟")) return;

    await fetch("/api/admin/sub-admins", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    fetchAdmins();
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-lg">هذه الصفحة متاحة فقط للمسؤول الرئيسي</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold">المساعدون</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
        >
          {showAdd ? "إلغاء" : "إضافة مساعد +"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 space-y-4">
          <h2 className="text-xl font-bold">إضافة مساعد جديد</h2>

          <div className="flex gap-3">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="بحث بالبريد أو الاسم أو الـ ID..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={searchUsers}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              بحث
            </button>
          </div>

          {users.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  className={`w-full text-right px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${
                    selectedUser === u.id ? "bg-indigo-50 border-r-4 border-indigo-500" : ""
                  }`}
                >
                  <span>{u.name || u.email}</span>
                  <span className="text-xs text-gray-400">#{u.uniqueId}</span>
                </button>
              ))}
            </div>
          )}

          {selectedUser && (
            <>
              <h3 className="font-bold mt-4">الصلاحيات:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(permissionLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={permissions[key] || false}
                      onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleAdd}
                disabled={saving}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? "جاري الإضافة..." : "تعيين كمساعد"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Admins List */}
      <div className="space-y-4">
        {admins.map((admin) => (
          <div key={admin.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{admin.name || admin.email}</h3>
                <p className="text-sm text-gray-500">
                  {admin.email} • #{admin.uniqueId}
                </p>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                  admin.role === "superadmin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {admin.role === "superadmin" ? "المسؤول الرئيسي" : "مساعد"}
                </span>
              </div>
              {admin.role !== "superadmin" && (
                <button
                  onClick={() => handleRemove(admin.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  إزالة
                </button>
              )}
            </div>
            {admin.subAdminPermissions && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(admin.subAdminPermissions).map(([key, value]) => {
                  if (key === "id" || key === "userId") return null;
                  if (!value) return null;
                  return (
                    <span key={key} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">
                      {permissionLabels[key] || key}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {admins.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">لا يوجد مساعدون بعد</p>
        </div>
      )}
    </div>
  );
}
