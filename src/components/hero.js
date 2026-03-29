'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { FloatingElement } from './animation';

const levels = [
  { id: 'A1.1', title: 'أساسيات اللغة', meta: '8h · 87 lectures', color: 'bg-[#FFCC00]' },
  { id: 'A1.2', title: 'التواصل الأساسي', meta: '9.5h · 106 lectures', color: 'bg-orange-500' },
  { id: 'A2.1', title: 'الحياة اليومية', meta: '10.5h · 98 lectures', color: 'bg-orange-700' },
  { id: 'A2.2', title: 'جاهز للامتحان', meta: '5.5h · 55 lectures', color: 'bg-green-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFCC00]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-right"
        >
          <motion.div variants={itemVariants} className="inline-block bg-[#21262d] border border-[#30363d] px-4 py-1.5 rounded-full text-[#FFCC00] text-sm font-bold mb-6">
            +33 ساعة ديال المحتوى 🇩🇪
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            بغيت تمشي <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC00] to-[#FFD700]">لألمانيا؟</span><br />هنا تبدا.
          </motion.h1>

          <motion.p variants={itemVariants} className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-xl ml-auto">
            من صفر حتى A2 — كورسات كاملة بالفيديو، منظمين خطوة بخطوة. تمارين، حوارات، وامتحانات. كلشي اللي خاصك باش توصل للمستوى اللي كيطلبو للفيزا أو الدراسة.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-10">
            <a href="#register" className="bg-[#FFCC00] text-black px-8 py-4 rounded-xl font-black text-lg hover:shadow-[0_0_30px_rgba(255,204,0,0.3)] transition-all flex items-center gap-2">
              بدا دابا بـ 149dh فقط
              <ArrowLeft size={20} />
            </a>
            <a href="#curriculum" className="border border-[#30363d] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/5 transition-all">
              شوف المحتوى ↓
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-6 text-gray-400 text-sm">
            <span className="flex items-center gap-1.5"><Check size={16} className="text-[#FFCC00]" /> مناسب للمبتدئين 100%</span>
            <span className="flex items-center gap-1.5"><Check size={16} className="text-[#FFCC00]" /> وصول مدى الحياة</span>
            <span className="flex items-center gap-1.5"><Check size={16} className="text-[#FFCC00]" /> ضمان 7 أيام</span>
          </motion.div>
        </motion.div>

        {/* Hero Card Visual */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Floating Badges */}
          <FloatingElement className="absolute -top-6 -right-6 bg-[#161b22] border border-[#30363d] p-4 rounded-2xl shadow-2xl z-10">
            <div className="text-[#FFCC00] font-black">+346 درس 🎓</div>
          </FloatingElement>

          <FloatingElement yOffset={10} duration={5} className="absolute -bottom-6 -left-6 bg-[#161b22] border border-[#30363d] p-4 rounded-2xl shadow-2xl z-10">
            <div className="text-white font-black flex items-center gap-2">شهادة إتمام ⭐</div>
          </FloatingElement>

          <div className="bg-[#161b22] border border-[#30363d] rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-[#21262d] flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold">الحزمة الكاملة</h3>
                <p className="text-xs text-gray-500 font-mono">A1.1 → A2.2 Complete Bundle</p>
              </div>
              <div className="w-10 h-6 rounded overflow-hidden flex flex-col border border-white/10">
                <div className="bg-black flex-1"></div>
                <div className="bg-[#DD0000] flex-1"></div>
                <div className="bg-[#FFCC00] flex-1"></div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {levels.map((level, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1) }}
                  key={level.id}
                  className="flex items-center gap-4 group"
                >
                  <div className={`${level.color} text-black font-black px-3 py-1 rounded text-xs min-w-[50px] text-center`}>
                    {level.id}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-bold">{level.title}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{level.meta}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-gray-700 group-hover:bg-[#FFCC00] transition-colors"></div>
                </motion.div>
              ))}
            </div>

            <div className="bg-black/40 p-6 flex justify-between items-center border-t border-[#21262d]">
              <div className="text-right">
                <span className="text-gray-500 line-through text-sm">316dh</span>
                <div className="text-[#FFCC00] text-3xl font-black">149dh</div>
              </div>
              <div className="text-left text-[10px] text-gray-400 font-mono leading-tight">
                TOTAL CONTENT<br />
                <span className="text-white font-bold">346 LECTURES</span><br />
                33.5 HOURS
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
