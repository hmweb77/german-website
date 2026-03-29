'use client';

import { motion } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';

export default function Pricing() {
  return (
    <section id="pricing" className="py-24" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#FFCC00] text-sm font-black tracking-widest uppercase">PRICING</span>
          <h2 className="text-4xl font-black text-white mt-4">اختار كيفاش تبدا</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {/* Single Course */}
          <div className="bg-[#0d1117] border border-[#21262d] p-10 rounded-3xl flex flex-col">
            <h3 className="text-white text-2xl font-black mb-2">كورس واحد</h3>
            <p className="text-gray-500 text-sm mb-8">مستوى واحد فقط — مناسب إلا بغيت تجرب</p>
            <div className="text-4xl font-black text-white mb-8">79 درهم</div>
            <div className="space-y-4 mb-10 flex-1">
              <div className="flex items-center gap-3 text-gray-400 text-sm"><Check size={18} className="text-green-500" /> مستوى واحد كامل</div>
              <div className="flex items-center gap-3 text-gray-400 text-sm"><Check size={18} className="text-green-500" /> وصول مدى الحياة</div>
              <div className="flex items-center gap-3 text-gray-400 text-sm"><Check size={18} className="text-green-500" /> شهادة إتمام</div>
              <div className="flex items-center gap-3 text-gray-600 text-sm opacity-50"><span className="text-red-500">✗</span> باقي المستويات</div>
              <div className="flex items-center gap-3 text-gray-600 text-sm opacity-50"><span className="text-red-500">✗</span> التحديثات المستقبلية</div>
            </div>
            <a href="#register" className="w-full py-4 rounded-xl border border-[#30363d] text-white font-bold hover:bg-white/5 transition-all text-center block">
              اختار هاد العرض
            </a>
          </div>

          {/* Bundle */}
          <motion.div
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            className="bg-[#161b22] border-2 border-[#FFCC00] p-10 rounded-3xl relative overflow-hidden flex flex-col shadow-[0_0_50px_rgba(255,204,0,0.1)]"
          >
            <div className="absolute top-6 left-6 bg-[#FFCC00] text-black px-4 py-1 rounded-full text-xs font-black uppercase">
              الأكثر طلباً 🔥
            </div>
            <h3 className="text-white text-2xl font-black mb-2">الحزمة الكاملة</h3>
            <p className="text-gray-400 text-sm mb-8">جميع الكورسات من A1.1 حتى A2.2 — أحسن قيمة</p>
            <div className="mb-4">
              <span className="text-gray-500 line-through text-lg">316dh</span>
              <div className="text-5xl font-black text-[#FFCC00]">149 درهم</div>
              <p className="text-green-500 text-xs font-bold mt-2">کتوفر 167dh — أكثر من 50% تخفيض</p>
            </div>
            <div className="space-y-4 mb-10 flex-1">
              <div className="flex items-center gap-3 text-white text-sm"><Check size={18} className="text-[#FFCC00]" /> 4 كورسات كاملين (A1 → A2)</div>
              <div className="flex items-center gap-3 text-white text-sm"><Check size={18} className="text-[#FFCC00]" /> 346 درس · 33+ ساعة</div>
              <div className="flex items-center gap-3 text-white text-sm"><Check size={18} className="text-[#FFCC00]" /> 70+ تمرين واختبار</div>
              <div className="flex items-center gap-3 text-white text-sm"><Check size={18} className="text-[#FFCC00]" /> وصول مدى الحياة</div>
              <div className="flex items-center gap-3 text-white text-sm"><Check size={18} className="text-[#FFCC00]" /> شهادات إتمام × 4</div>
              <div className="flex items-center gap-3 text-white text-sm"><Check size={18} className="text-[#FFCC00]" /> تحديثات مستقبلية مجانية</div>
            </div>
            <a href="#register" className="w-full py-5 rounded-xl bg-[#FFCC00] text-black font-black text-xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,204,0,0.3)] text-center flex items-center justify-center gap-3">
              بدا دابا — 149dh
              <ArrowLeft size={24} />
            </a>
            <p className="text-center text-gray-500 text-xs mt-4">ضمان 7 أيام — إلا ما عجبكش نرجعو ليك فلوسك 🛡️</p>
          </motion.div>
        </div>

        {/* Value Stack Table */}
        <div className="max-w-3xl mx-auto">
          <h4 className="text-center text-white text-xl font-black mb-8">شنو كتاخد بالضبط</h4>
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
            <table className="w-full text-right border-collapse">
              <tbody className="divide-y divide-[#21262d]">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-300">4 كورسات كاملين (A1.1 → A2.2)</td>
                  <td className="p-4 text-white font-mono font-bold">316dh</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-300">70+ تمرين واختبار تفاعلي</td>
                  <td className="p-4 text-green-500 font-bold">+50dh</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-300">أقسام الاستماع والمحادثات</td>
                  <td className="p-4 text-green-500 font-bold">+40dh</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-300">شهادات إتمام × 4</td>
                  <td className="p-4 text-green-500 font-bold">+30dh</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-300">وصول مدى الحياة + تحديثات مجانية</td>
                  <td className="p-4 text-green-500 font-bold">+50dh</td>
                </tr>
                <tr className="bg-[#FFCC00]/10">
                  <td className="p-6 text-white font-black text-lg">كلشي غادي تخلص ←</td>
                  <td className="p-6 text-[#FFCC00] font-black text-3xl">149dh</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
