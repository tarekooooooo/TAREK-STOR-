"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const adminLinks = [
  { href: "/admin", label: "لوحة التحكم", icon: "📊" },
  { href: "/admin/products", label: "المنتجات", icon: "📦" },
  { href: "/admin/orders", label: "الطلبات", icon: "🛒" },
  { href: "/admin/users", label: "المستخدمون", icon: "👥" },
  { href: "/admin/redeem-codes", label: "أكواد الشحن", icon: "🎫" },
  { href: "/admin/analytics", label: "الإحصائيات", icon: "📈" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
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

  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 hidden md:block">
        <h2 className="text-lg font-bold mb-6 text-indigo-400">لوحة التحكم</h2>
        <nav className="space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
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
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[80px] text-xs ${
                pathname === link.href ? "text-indigo-400" : "text-gray-400"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 md:p-8 pb-24 md:pb-8">{children}</div>
    </div>
  );
}
