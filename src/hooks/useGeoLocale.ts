import { useState, useEffect } from "react";

export type GeoLocale = { country: string; currency: string; symbol: string; rate: number };
const DEFAULT: GeoLocale = { country: "IN", currency: "INR", symbol: "₹", rate: 1 };

export function useGeoLocale(): GeoLocale {
  const [locale] = useState<GeoLocale>(DEFAULT);
  useEffect(() => {}, []);
  return locale;
}

export function parseINRPrice(price: string | number): number {
  if (typeof price === "number") return price;
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

export function convertPrice(inr: number, locale: GeoLocale = DEFAULT): string {
  const value = inr * (locale.rate || 1);
  return `${locale.symbol}${Math.round(value).toLocaleString()}`;
}

export default useGeoLocale;