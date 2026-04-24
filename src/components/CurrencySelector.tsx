"use client";

import { useState, useEffect } from "react";
import { CURRENCIES } from "@/lib/currencies";

interface CurrencySelectorProps {
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
  locale: string;
}

export default function CurrencySelector({
  currentCurrency,
  onCurrencyChange,
  locale,
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
      >
        <span>{CURRENCIES[currentCurrency]?.symbol || "$"}</span>
        <span>{currentCurrency}</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto min-w-[200px]">
          {Object.entries(CURRENCIES).map(([code, info]) => (
            <button
              key={code}
              onClick={() => {
                onCurrencyChange(code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm flex justify-between ${
                currentCurrency === code ? "bg-indigo-50 font-bold text-indigo-600" : ""
              }`}
            >
              <span>
                {info.symbol} {code}
              </span>
              <span className="text-gray-500">
                {locale === "ar" ? info.nameAr : locale === "fr" ? info.nameFr : info.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function useExchangeRates() {
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then(setRates)
      .catch(console.error);
  }, []);

  const convert = (usdAmount: number, currency: string): number => {
    const rate = rates[currency] || 1;
    return Math.round(usdAmount * rate * 100) / 100;
  };

  const formatPrice = (usdAmount: number, currency: string): string => {
    const converted = convert(usdAmount, currency);
    const symbol = CURRENCIES[currency]?.symbol || currency;
    return `${symbol} ${converted.toLocaleString()}`;
  };

  return { rates, convert, formatPrice };
}
