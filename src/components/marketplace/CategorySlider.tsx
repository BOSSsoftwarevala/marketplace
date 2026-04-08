import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Utensils, GraduationCap, Heart, ShoppingCart, Building2, 
  Truck, Laptop, Home, Sparkles, ChevronLeft, ChevronRight 
} from 'lucide-react';

const CATEGORIES = [
  { icon: Sparkles, name: 'All', color: 'from-cyan-500 to-blue-600', link: '/demos' },
  { icon: Utensils, name: 'Restaurant & POS', color: 'from-orange-500 to-red-500', link: '/demos?cat=restaurant' },
  { icon: GraduationCap, name: 'Education', color: 'from-blue-500 to-indigo-600', link: '/demos?cat=education' },
  { icon: Heart, name: 'Healthcare', color: 'from-pink-500 to-rose-600', link: '/demos?cat=healthcare' },
  { icon: ShoppingCart, name: 'E-Commerce', color: 'from-green-500 to-emerald-600', link: '/demos?cat=ecommerce' },
  { icon: Building2, name: 'Business CRM', color: 'from-violet-500 to-purple-600', link: '/demos?cat=crm' },
  { icon: Truck, name: 'Logistics', color: 'from-cyan-500 to-teal-600', link: '/demos?cat=logistics' },
  { icon: Laptop, name: 'IT & SaaS', color: 'from-gray-500 to-slate-600', link: '/demos?cat=saas' },
  { icon: Home, name: 'Real Estate', color: 'from-amber-500 to-yellow-600', link: '/demos?cat=realestate' },
];

const CategorySlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, []);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let dir = 1;
    const timer = setInterval(() => {
      if (isDragging) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 5) dir = -1;
      if (el.scrollLeft <= 5) dir = 1;
      el.scrollBy({ left: dir * 1, behavior: 'auto' });
    }, 30);
    return () => clearInterval(timer);
  }, [isDragging]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => setIsDragging(false);

  return (
    <section className="relative py-6 bg-white/[0.02]">
      <div className="max-w-5xl mx-auto px-4 relative">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="flex gap-3 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.name}
              to={cat.link}
              onClick={(e) => isDragging && e.preventDefault()}
              className="flex-shrink-0"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${cat.color} text-white text-sm font-semibold whitespace-nowrap shadow-lg transition-all hover:shadow-xl`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
