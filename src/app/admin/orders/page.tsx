"use client";

import { useState, useEffect } from "react";

interface OrderData {
  id: string;
  userUid: string;
  total: number;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string; uniqueId: string };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { name: string };
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        setOrders(Array.isArray(d) ? d : []);
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
      <h1 className="text-3xl font-bold mb-8">الطلبات</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-12">لا توجد طلبات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-right py-3 px-4">رقم الطلب</th>
                  <th className="text-right py-3 px-4">المستخدم</th>
                  <th className="text-right py-3 px-4">رقم التعريف</th>
                  <th className="text-right py-3 px-4">المنتجات</th>
                  <th className="text-right py-3 px-4">المبلغ</th>
                  <th className="text-right py-3 px-4">الحالة</th>
                  <th className="text-right py-3 px-4">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">#{order.id.slice(-8)}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{order.user?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 font-mono">{order.userUid}</td>
                    <td className="py-3 px-4">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-xs">
                          {item.product.name} ×{item.quantity}
                        </p>
                      ))}
                    </td>
                    <td className="py-3 px-4 font-bold">${order.total}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status === "completed" ? "مكتمل" : "معلق"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
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
