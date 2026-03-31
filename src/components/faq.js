'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'واش مناسب للمبتدئين اللي ما عندهم حتى أساس؟', a: 'نعم 100%. الكورس كيبدا من الحرف الأول. ما خاصك حتى معرفة مسبقة، غير الرغبة أنك تتعلم.' },
  { q: 'واش 149dh ماشي بزاف؟', a: 'حصة وحدة خاصة فمركز كتكلف 200 إلى 400dh. هنا عندك 33 ساعة ديال المحتوى المنظم بـ 149dh فقط، أقل من ثمن عشاء فمطعم.' },
  { q: 'واش غادي نوصل فعلاً لمستوى A2؟', a: 'المحتوى كيغطي كلشي اللي كيطلبو Goethe-Institut لمستوى A2. إلا تبعتي الكورسات بالترتيب وطبقتي التمارين، غادي تكون جاهز تجوز الامتحان.' },
  { q: 'واش هاد الكورس بحال فيديوهات YouTube؟', a: 'لا. YouTube فيه فيديوهات عشوائية بلا ترتيب. هنا عندك منهج أكاديمي منظم مع اختبارات، أقسام استماع، وتقدم واضح من مستوى لمستوى.' },
  { q: 'ما عنديش الوقت بزاف، واش نقدر؟', a: 'عندك وصول مدى الحياة. 30 دقيقة فالنهار كافية. بهاد الإيقاع تقدر تكمل الكورسات كاملين فـ 2 إلى 3 أشهر.' },
  { q: 'كيفاش نخلص؟', a: 'عندك 3 طرق: Carte Bancaire (Visa/Mastercard)، Virement Bancaire، أو CashPlus/Wafacash. اختار اللي مناسبة ليك فالفورمولير.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-24" dir="rtl">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mt-4">أسئلة مهمة</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full p-6 text-right flex justify-between items-center text-white font-bold text-lg bg-transparent border-none cursor-pointer"
              >
                <span>{f.q}</span>
                <motion.div animate={{ rotate: open === idx ? 45 : 0 }}>
                  <ChevronDown size={24} className="text-[#FFCC00]" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-[#21262d]">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
