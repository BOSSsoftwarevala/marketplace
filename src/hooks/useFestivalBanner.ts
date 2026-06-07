import { useState, useEffect } from "react";

export const FIXED_OFFER_TEXT = "Limited Time Offer — Save Big Today";

export interface FestivalBanner {
  active: boolean;
  title: string;
  subtitle: string;
  color: string;
  gradient: string;
  compactText: string;
  emoji: string;
  note: string;
  countryName: string;
  isGlobal: boolean;
}

export function useFestivalBanner(): FestivalBanner {
  const [banner] = useState<FestivalBanner>({
    active: true,
    title: FIXED_OFFER_TEXT,
    subtitle: "",
    color: "from-orange-500 to-red-500",
    gradient: "from-orange-500 via-pink-500 to-red-500",
    compactText: FIXED_OFFER_TEXT,
    emoji: "🎉",
    note: "",
    countryName: "",
    isGlobal: true,
  });
  useEffect(() => {}, []);
  return banner;
}

export default useFestivalBanner;