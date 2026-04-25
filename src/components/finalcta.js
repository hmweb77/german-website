'use client';

import { ShieldCheck } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden text-center" dir="rtl">
      <div className="absolute inset-0 bg-[#FFCC00]/5 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFCC00]/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <h2 className="text-5xl md:text-7xl font-black text-white mt-6 mb-8">واش غادي تبقى مأجّل؟</h2>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12">
          كل نهار كيدوز بلا ما تبدا = كتبعد على الهدف ديالك 🇩🇪
        </p>
        <div className="flex flex-col items-center gap-6">
          <a href="#register" className="bg-[#FFCC00] text-black px-12 py-6 rounded-2xl font-black text-2xl hover:scale-105 transition-all shadow-[0_20px_60px_rgba(255,204,0,0.4)]">
            سجّل دابا، 249dh فقط ←
          </a>
          <span className="flex items-center gap-2 text-gray-500 font-bold">
            <ShieldCheck size={20} />
            ضمان 7 أيام، بلا مخاطرة
          </span>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-12 border-t border-[#21262d] text-center text-gray-100 text-sm">
      <div className="max-w-7xl mx-auto px-6">
        © 2026 DeutschMaroc، جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
