import { useState, useEffect } from "react";

export const FIXED_OFFER_TEXT = "Limited Time Offer — Save Big Today";

export function useFestivalBanner() {
  const [banner] = useState({
    active: true,
    title: FIXED_OFFER_TEXT,
    subtitle: "",
    color: "from-orange-500 to-red-500",
  });
  useEffect(() => {}, []);
  return banner;
}

export default useFestivalBanner;