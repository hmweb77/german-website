'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Award } from 'lucide-react';

export default function RegistrationForm() {
  const [status, setStatus] = useState('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    payment: 'card'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    console.log('Registering user:', formData);
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <section id="register" className="py-24 border-t border-[#21262d]" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[#FFCC00] text-sm font-black tracking-widest uppercase">REGISTER NOW</span>
          <h2 className="text-4xl font-black text-white mt-4 mb-4">سجّل دابا وبدا التعلم</h2>
          <p className="text-gray-400">عمّر المعلومات ديالك واختار طريقة الدفع المناسبة ليك</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="bg-[#161b22] border border-[#30363d] rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Yellow Header */}
            <div className="bg-[#FFCC00] p-6 text-black flex justify-between items-center">
              <div>
                <h3 className="font-black text-xl">التسجيل — الحزمة الكاملة 🇩🇪</h3>
                <p className="text-xs font-bold opacity-80 uppercase tracking-tight">A1.1 → A2.2 · 149dh</p>
              </div>
              <Award size={40} className="opacity-20" />
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 block">الاسم الكامل</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: أحمد بنعمر"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-all"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 block">البريد الإلكتروني</label>
                  <input
                    required
                    dir="ltr"
                    type="email"
                    placeholder="example@email.com"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFCC00] transition-all"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 block">رقم الهاتف</label>
                  <input
                    required
                    dir="ltr"
                    type="tel"
                    placeholder="06 XX XX XX XX"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFCC00] transition-all"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-300 block">طريقة الدفع</label>
                {[
                  { id: 'card', label: 'Carte Bancaire 💳', desc: 'خلص مباشرة بالكارط — Visa, Mastercard' },
                  { id: 'bank', label: 'Virement Bancaire 🏦', desc: 'حوّل للحساب البنكي — غادي نرسلو ليك RIB' },
                  { id: 'cash', label: 'CashPlus / Wafacash 💰', desc: 'خلص كاش فأقرب نقطة CashPlus أو Wafacash' },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      formData.payment === m.id
                        ? 'bg-[#FFCC00]/5 border-[#FFCC00]'
                        : 'bg-[#0d1117] border-[#30363d]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="hidden"
                      checked={formData.payment === m.id}
                      onChange={() => setFormData({ ...formData, payment: m.id })}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                      formData.payment === m.id ? 'border-[#FFCC00]' : 'border-[#30363d]'
                    }`}>
                      {formData.payment === m.id && <div className="w-2.5 h-2.5 bg-[#FFCC00] rounded-full"></div>}
                    </div>
                    <div>
                      <div className="text-white font-bold">{m.label}</div>
                      <div className="text-xs text-gray-500">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={status !== 'idle'}
                className={`w-full py-5 rounded-xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${
                  status === 'success'
                    ? 'bg-green-600 text-white'
                    : 'bg-[#FFCC00] text-black hover:scale-[1.02]'
                }`}
              >
                {status === 'idle' && (
                  <>
                    سجّل دابا — 149dh
                    <ArrowLeft size={24} />
                  </>
                )}
                {status === 'loading' && (
                  <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                )}
                {status === 'success' && <>✓ تم التسجيل — غادي نتواصلو معاك</>}
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-500 text-xs text-center">
                <ShieldCheck size={16} />
                ضمان 7 أيام — إلا ما عجبكش الكورس نرجعو ليك فلوسك بلا أسئلة
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
