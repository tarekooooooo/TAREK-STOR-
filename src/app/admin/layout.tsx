"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const adminLinks = [
  { href: "/admin", label: "لوحة التحكم", icon: "📊" },
  { href: "/admin/products", label: "المنتجات", icon: "📦" },
  { href: "/admin/orders", label: "الطلبات", icon: "🛒" },
  { href: "/admin/users", label: "المستخدمون", icon: "👥" },
  { href: "/admin/wallets", label: "المحافظ", icon: "💰" },
  { href: "/admin/redeem-codes", label: "أكواد الشحن", icon: "🎫" },
  { href: "/admin/tournaments", label: "البطولات", icon: "🏆" },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙️" },
  { href: "/admin/smtp", label: "البريد/SMTP", icon: "📧" },
  { href: "/admin/support", label: "خدمة العملاء", icon: "💬" },
  { href: "/admin/sub-admins", label: "المساعدون", icon: "🔑" },
  { href: "/admin/analytics", label: "الإحصائيات", icon: "📈" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin" && session?.user?.role !== "superadmin") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className={`w-64 bg-gray-900 text-white p-4 hidden md:block overflow-y-auto`}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-bold">T</div>
          <div>
            <h2 className="text-sm font-bold text-indigo-400">لوحة التحكم</h2>
            <p className="text-xs text-gray-500">
              {session.user.role === "superadmin" ? "المسؤول الرئيسي" : "مساعد"}
            </p>
          </div>
        </div>
        <nav className="space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${
                pathname === link.href
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 z-50">
        <div className="flex overflow-x-auto">
          {adminLinks.slice(0, 6).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 min-w-[60px] text-xs ${
                pathname === link.href ? "text-indigo-400" : "text-gray-400"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="truncate">{link.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex flex-col items-center gap-1 px-3 py-2 min-w-[60px] text-xs text-gray-400"
          >
            <span className="text-lg">☰</span>
            <span>المزيد</span>
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div className="w-64 bg-gray-900 h-full p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 text-indigo-400">القائمة</h2>
            <nav className="space-y-1">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${
                    pathname === link.href ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">{children}</div>
    </div>
  );
}
