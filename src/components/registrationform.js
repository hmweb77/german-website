'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Award } from 'lucide-react';

export default function RegistrationForm() {
  const router = useRouter();
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatus('loading');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('idle');
        const msg =
          typeof data.error === 'string'
            ? data.error
            : 'حدث خطأ. حاول من جديد.';
        setErrorMessage(msg);
        return;
      }
      router.push('/thank-you');
      router.refresh();
    } catch {
      setStatus('idle');
      setErrorMessage('ما قدرناش نتواصلو مع الخادم. جربي من بعد.');
    }
  };

  return (
    <section id="register" className="py-24 border-t border-[#21262d]" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mt-4 mb-4">سجّل دابا وبدا التعلم</h2>
          <p className="text-gray-400">عمّر المعلومات ديالك، غادي نتواصلو معاك لتحديد الدفع</p>
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
                <h3 className="font-black text-xl">التسجيل، الحزمة الكاملة 🇩🇪</h3>
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
                    value={formData.name}
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
                      value={formData.email}
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
                      value={formData.phone}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFCC00] transition-all"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-4 space-y-3">
                  <p className="text-sm font-bold text-gray-300">طرق الدفع المتوفرة</p>
                  <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                    <li>
                      <span className="text-white font-semibold">Carte Bancaire</span>: Visa, Mastercard
                    </li>
                    <li>
                      <span className="text-white font-semibold">Virement Bancaire</span>، غادي نرسلو ليك RIB
                    </li>
                    <li>
                      <span className="text-white font-semibold">CashPlus / Wafacash</span>، خلص كاش فأقرب نقطة
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500">غادي نتواصلو معاك باش تختاري الطريقة اللي مناسبة ليك.</p>
                </div>

                {errorMessage && (
                  <p className="text-red-400 text-sm font-bold text-center" role="alert">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full py-5 rounded-xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 bg-[#FFCC00] text-black hover:scale-[1.02] ${
                    status === 'loading' ? 'opacity-80 cursor-wait' : ''
                  }`}
                >
                  {status === 'idle' && (
                    <>
                      سجّل دابا، 149dh
                      <ArrowLeft size={24} />
                    </>
                  )}
                  {status === 'loading' && (
                    <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs text-center">
                  <ShieldCheck size={16} />
                  تجربة تجريبية لمدة 7 أيام مع ضمان استرجاع المال إذا لم يناسبك الكورس
                </div>
              </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
