"use client";

import { useState, useCallback } from "react";
import { CURRENCIES } from "@/lib/currencies";

interface CurrencySelectorProps {
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
  locale: string;
}

const exchangeRates: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79,
  SAR: 3.75, AED: 3.67, EGP: 48.5, DZD: 135.5, MAD: 10.0,
  TND: 3.12, QAR: 3.64, KWD: 0.31, BHD: 0.38, OMR: 0.39,
  JOD: 0.71, IQD: 1310, LBP: 89500, LYD: 4.85, SYP: 13000,
  YER: 250, SDG: 601, MRU: 39.5, SOS: 571, DJF: 178,
  KMF: 453, PSE: 3.65,
  TRY: 32.5, INR: 83.5, PKR: 278, NGN: 1550,
  CAD: 1.37, AUD: 1.53, JPY: 157, CNY: 7.24,
};

export function useExchangeRates() {
  const formatPrice = useCallback((priceUsd: number, targetCurrency: string) => {
    const rate = exchangeRates[targetCurrency] || 1;
    const converted = priceUsd * rate;
    const currencyInfo = CURRENCIES[targetCurrency];
    const symbol = currencyInfo?.symbol || targetCurrency;

    if (converted >= 1000) {
      return `${symbol} ${converted.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${symbol} ${converted.toFixed(2)}`;
  }, []);

  return { formatPrice, exchangeRates };
}

export default function CurrencySelector({ currentCurrency, onCurrencyChange, locale }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);

  const getCurrencyName = (code: string) => {
    const info = CURRENCIES[code];
    if (!info) return code;
    if (locale === "ar") return info.nameAr;
    if (locale === "fr") return info.nameFr;
    return info.name;
  };

  const currentInfo = CURRENCIES[currentCurrency];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition shadow-sm"
      >
        <span className="font-medium">{currentInfo?.symbol || "$"}</span>
        <span className="text-gray-600">{getCurrencyName(currentCurrency)}</span>
        <svg className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 bg-white border rounded-xl shadow-xl max-h-64 overflow-y-auto min-w-[200px] left-0">
          {Object.entries(CURRENCIES).map(([code, info]) => (
            <button
              key={code}
              onClick={() => {
                onCurrencyChange(code);
                setOpen(false);
              }}
              className={`w-full text-right px-4 py-2 text-sm hover:bg-indigo-50 transition flex items-center justify-between ${
                currentCurrency === code ? "bg-indigo-50 text-indigo-600 font-medium" : ""
              }`}
            >
              <span>{info.symbol} {locale === "ar" ? info.nameAr : info.name}</span>
              <span className="text-xs text-gray-400 font-mono">{code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
