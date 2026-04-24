import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";

const messagesMap: Record<string, Record<string, Record<string, string>>> = {
  ar: arMessages,
  en: enMessages,
  fr: frMessages,
};

export const metadata: Metadata = {
  title: "متجر طارق - Tarek Store",
  description: "متجر إلكتروني لبيع المنتجات والخدمات الرقمية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "ar";
  const validLocale = ["ar", "en", "fr"].includes(locale) ? locale : "ar";
  const isRtl = validLocale === "ar";
  const messages = messagesMap[validLocale] || arMessages;

  return (
    <html lang={validLocale} dir={isRtl ? "rtl" : "ltr"}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <SessionProvider>
          <Navbar locale={validLocale} messages={messages} />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="bg-gray-900 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-gray-400">
                © {new Date().getFullYear()} {messages.common.appName}.{" "}
                {validLocale === "ar"
                  ? "جميع الحقوق محفوظة"
                  : validLocale === "fr"
                  ? "Tous droits réservés"
                  : "All rights reserved"}
              </p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
