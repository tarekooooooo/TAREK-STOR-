import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, SAR: 3.75, AED: 3.67,
  EGP: 30.9, DZD: 134.5, MAD: 10.1, TND: 3.1, QAR: 3.64,
  KWD: 0.31, BHD: 0.376, OMR: 0.385, JOD: 0.709, IQD: 1310,
  LBP: 89500, TRY: 27.2, INR: 83.1, PKR: 278, NGN: 770,
  CAD: 1.36, AUD: 1.53, JPY: 149.5, CNY: 7.24,
};

export async function GET() {
  try {
    const rates = await prisma.exchangeRate.findMany();

    if (rates.length === 0) {
      return NextResponse.json(FALLBACK_RATES);
    }

    const rateMap: Record<string, number> = {};
    for (const rate of rates) {
      rateMap[rate.currency] = rate.rate;
    }
    return NextResponse.json(rateMap);
  } catch (error) {
    console.error("Exchange rates fetch error:", error);
    return NextResponse.json(FALLBACK_RATES);
  }
}

export async function POST() {
  try {
    const apiUrl = "https://api.exchangerate-api.com/v4/latest/USD";
    const response = await fetch(apiUrl);

    let rates: Record<string, number>;

    if (response.ok) {
      const data = await response.json();
      rates = data.rates;
    } else {
      rates = FALLBACK_RATES;
    }

    for (const [currency, rate] of Object.entries(rates)) {
      await prisma.exchangeRate.upsert({
        where: { currency },
        update: { rate },
        create: { currency, rate },
      });
    }

    return NextResponse.json({ success: true, count: Object.keys(rates).length });
  } catch (error) {
    console.error("Exchange rates update error:", error);
    return NextResponse.json({ error: "Failed to update rates" }, { status: 500 });
  }
}
