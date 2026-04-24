"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const localeNames: Record<string, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
};

export default function Navbar({
  locale,
  messages,
}: {
  locale: string;
  messages: Record<string, Record<string, string>>;
}) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const t = messages.common;
  const isRtl = locale === "ar";

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {t.appName}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-indigo-200 transition">
              {t.home}
            </Link>
            <Link href="/store" className="hover:text-indigo-200 transition">
              {t.store}
            </Link>

            {session ? (
              <>
                <Link href="/profile" className="hover:text-indigo-200 transition">
                  {t.profile}
                </Link>
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition"
                  >
                    {t.admin}
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="hover:text-indigo-200 transition"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-indigo-200 transition">
                  {t.login}
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-full font-medium hover:bg-indigo-50 transition"
                >
                  {t.register}
                </Link>
              </>
            )}

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 hover:text-indigo-200 transition"
              >
                🌐 {localeNames[locale]}
              </button>
              {langOpen && (
                <div className={`absolute top-full mt-2 bg-white text-gray-800 rounded-lg shadow-xl py-2 min-w-[140px] ${isRtl ? "left-0" : "right-0"}`}>
                  {Object.entries(localeNames).map(([code, name]) => (
                    <button
                      key={code}
                      className={`block w-full text-left px-4 py-2 hover:bg-indigo-50 transition ${locale === code ? "font-bold text-indigo-600" : ""}`}
                      onClick={async () => {
                        await fetch("/api/locale", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ locale: code }),
                        });
                        setLangOpen(false);
                        window.location.reload();
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 hover:text-indigo-200" onClick={() => setMenuOpen(false)}>
              {t.home}
            </Link>
            <Link href="/store" className="block py-2 hover:text-indigo-200" onClick={() => setMenuOpen(false)}>
              {t.store}
            </Link>
            {session ? (
              <>
                <Link href="/profile" className="block py-2 hover:text-indigo-200" onClick={() => setMenuOpen(false)}>
                  {t.profile}
                </Link>
                {session.user.role === "admin" && (
                  <Link href="/admin" className="block py-2 hover:text-indigo-200" onClick={() => setMenuOpen(false)}>
                    {t.admin}
                  </Link>
                )}
                <button onClick={() => signOut()} className="block py-2 hover:text-indigo-200">
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block py-2 hover:text-indigo-200" onClick={() => setMenuOpen(false)}>
                  {t.login}
                </Link>
                <Link href="/auth/register" className="block py-2 hover:text-indigo-200" onClick={() => setMenuOpen(false)}>
                  {t.register}
                </Link>
              </>
            )}
            <div className="flex gap-2 pt-2">
              {Object.entries(localeNames).map(([code, name]) => (
                <button
                  key={code}
                  className={`px-3 py-1 rounded-full text-sm ${locale === code ? "bg-white text-indigo-600" : "bg-white/20"}`}
                  onClick={async () => {
                    await fetch("/api/locale", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ locale: code }),
                    });
                    setMenuOpen(false);
                    window.location.reload();
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
