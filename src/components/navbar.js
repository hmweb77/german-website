'use client';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* German Flag Stripe */}
      <div className="h-1 flex w-full">
        <div className="h-full w-1/3 bg-black"></div>
        <div className="h-full w-1/3 bg-[#DD0000]"></div>
        <div className="h-full w-1/3 bg-[#FFCC00]"></div>
      </div>

      {/* Glassmorphism Bar */}
      <div className="bg-[#0d1117]/80 backdrop-blur-md border-b border-[#21262d] py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center flex-row-reverse">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-1">
            <span className="text-white">Maroc</span>
            <span className="text-[#FFCC00]">Deutsch</span>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400 flex-row-reverse">
            <a href="#curriculum" className="hover:text-white transition-colors">المحتوى</a>
            <a href="#pricing" className="hover:text-white transition-colors">الأثمنة</a>
            <a href="#faq" className="hover:text-white transition-colors">الأسئلة</a>
          </div>

          <a
            href="#register"
            className="bg-[#FFCC00] text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95"
          >
            سجّل دابا، 149dh
          </a>
        </div>
      </div>
    </nav>
  );
}
