import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PartyPopper, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FestiveOffer {
  id: string;
  festival_name: string;
  discount_text: string;
  banner_text: string;
  gradient: string;
  is_active: boolean;
}

const FestiveBanner = () => {
  const [offer, setOffer] = useState<FestiveOffer | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [userCountry, setUserCountry] = useState('');

  useEffect(() => {
    // Detect user location
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(() => {
        // Use a simple country detection - fallback to "IN" (India)
        setUserCountry('IN');
      })
      .catch(() => setUserCountry('IN'));
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('global_offers')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const d = data[0];
        setOffer({
          id: d.id,
          festival_name: d.offer_name || 'Special Offer',
          discount_text: `Flat ${d.discount_percentage || 50}% OFF`,
          banner_text: d.description || 'Limited time offer on all products!',
          gradient: 'from-amber-500 via-orange-500 to-red-500',
          is_active: true,
        });
      } else {
        // Fallback festive banner based on current season
        const month = new Date().getMonth();
        const festive = getFestiveByMonth(month);
        if (festive) {
          setOffer(festive);
        }
      }
    };

    fetchOffers();
  }, [userCountry]);

  if (dismissed || !offer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative overflow-hidden"
      >
        <div className={`relative bg-gradient-to-r ${offer.gradient} py-3 sm:py-4`}>
          {/* Sparkle overlay */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 flex items-center justify-center gap-3 text-white">
            <PartyPopper className="w-5 h-5 flex-shrink-0 hidden sm:block" />
            <motion.div
              className="flex items-center gap-2 overflow-hidden"
              animate={{ x: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-sm sm:text-base font-bold whitespace-nowrap">
                🎉 {offer.festival_name} —
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-sm sm:text-base font-black whitespace-nowrap">
                {offer.discount_text}
              </span>
              <span className="text-sm hidden md:inline whitespace-nowrap">
                {offer.banner_text}
              </span>
            </motion.div>
            <Tag className="w-4 h-4 flex-shrink-0 hidden sm:block" />
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

function getFestiveByMonth(month: number): FestiveOffer | null {
  const festivals: Record<number, FestiveOffer> = {
    0: { id: 'ny', festival_name: 'New Year Sale', discount_text: 'Flat 40% OFF', banner_text: 'Start the year with best deals!', gradient: 'from-blue-500 via-indigo-500 to-purple-600', is_active: true },
    2: { id: 'holi', festival_name: 'Holi Festival Sale', discount_text: 'Flat 50% OFF', banner_text: 'Colors of savings!', gradient: 'from-pink-500 via-purple-500 to-indigo-500', is_active: true },
    3: { id: 'spring', festival_name: 'Spring Sale', discount_text: 'Flat 35% OFF', banner_text: 'Fresh deals for your business!', gradient: 'from-green-500 via-emerald-500 to-teal-500', is_active: true },
    7: { id: 'ind', festival_name: 'Independence Day Sale', discount_text: 'Flat 50% OFF', banner_text: 'Freedom to choose!', gradient: 'from-orange-500 via-white to-green-500', is_active: true },
    9: { id: 'diwali', festival_name: 'Diwali Mega Sale', discount_text: 'Flat 60% OFF', banner_text: 'Festival of lights & deals!', gradient: 'from-amber-500 via-orange-500 to-red-500', is_active: true },
    10: { id: 'bf', festival_name: 'Black Friday', discount_text: 'Flat 70% OFF', banner_text: 'Biggest sale of the year!', gradient: 'from-gray-800 via-gray-900 to-black', is_active: true },
    11: { id: 'xmas', festival_name: 'Christmas Sale', discount_text: 'Flat 45% OFF', banner_text: 'Holiday special!', gradient: 'from-red-500 via-red-600 to-green-600', is_active: true },
  };
  return festivals[month] || null;
}

export default FestiveBanner;
