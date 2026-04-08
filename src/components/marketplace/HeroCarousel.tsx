import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

interface FeaturedProduct {
  id: string;
  title: string;
  subtitle: string;
  cta_primary: string;
  cta_link: string;
  gradient: string;
  accent: string;
}

const FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: '1',
    title: 'Restaurant POS System',
    subtitle: 'Complete billing, inventory & kitchen management. Try the live demo now!',
    cta_primary: 'Try Demo',
    cta_link: '/demos',
    gradient: 'from-orange-600 via-red-600 to-pink-700',
    accent: 'orange',
  },
  {
    id: '2',
    title: 'School ERP & LMS',
    subtitle: 'Student management, attendance, fees & online classes — all-in-one.',
    cta_primary: 'Try Demo',
    cta_link: '/demos',
    gradient: 'from-blue-600 via-indigo-600 to-purple-700',
    accent: 'blue',
  },
  {
    id: '3',
    title: 'Hospital Management',
    subtitle: 'OPD, IPD, pharmacy, lab reports & billing. Built for modern clinics.',
    cta_primary: 'Try Demo',
    cta_link: '/demos',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    accent: 'teal',
  },
  {
    id: '4',
    title: 'E-Commerce Platform',
    subtitle: 'Launch your online store in minutes. Multi-vendor, payments & delivery.',
    cta_primary: 'Try Demo',
    cta_link: '/demos',
    gradient: 'from-purple-600 via-violet-600 to-fuchsia-700',
    accent: 'purple',
  },
  {
    id: '5',
    title: 'CRM & Sales Automation',
    subtitle: 'Manage leads, customers & sales pipeline with AI-powered insights.',
    cta_primary: 'Try Demo',
    cta_link: '/demos',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    accent: 'cyan',
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % FEATURED_PRODUCTS.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + FEATURED_PRODUCTS.length) % FEATURED_PRODUCTS.length);
  }, []);

  // Auto-slide every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const product = FEATURED_PRODUCTS[current];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <section className="relative w-full overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={product.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className={`relative w-full bg-gradient-to-r ${product.gradient} py-16 sm:py-20 lg:py-28`}
        >
          {/* Overlay pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
          <div className="absolute inset-0 bg-black/20" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/70 text-sm font-medium tracking-widest uppercase mb-3"
            >
              ★ Featured Software
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 drop-shadow-lg"
            >
              {product.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8"
            >
              {product.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link
                to={product.cta_link}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-gray-900 font-bold text-base hover:scale-105 transition-transform shadow-xl"
              >
                <Play className="w-5 h-5" />
                {product.cta_primary}
              </Link>
              <Link
                to="/demos"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/15 backdrop-blur-sm text-white font-semibold border border-white/20 hover:bg-white/25 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Buy Now
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {FEATURED_PRODUCTS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? 'bg-white w-7' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
