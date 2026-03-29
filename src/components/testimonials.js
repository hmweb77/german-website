'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const reviews = [
  { name: 'سارة م.', role: 'طالبة — الدار البيضاء', text: 'كنت صفر فالألمانية، دابا كنفهم المحادثات البسيطة وكنقدر نعرف براسي. طريقة الشرح واضحة بزاف.' },
  { name: 'يوسف ب.', role: 'Ausbildung متقدم — فاس', text: 'كنقلب على كورس منظم بالعربية وما لقيتش حتى واحد بحال هادا. التمارين والاستماع كيخليك تطبق فعلاً.' },
  { name: 'نهيلة ع.', role: 'موظفة — الرباط', text: 'الثمن معقول بزاف مقارنة مع المراكز. وخا كنت خايفة من القواعد، ولكن الشرح سهل وكل حاجة مرتبة.' },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-black/40" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#FFCC00] text-sm font-black tracking-widest uppercase">TESTIMONIALS</span>
          <h2 className="text-4xl font-black text-white mt-4">شنو كيقولو الطلبة</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#161b22] p-8 rounded-3xl border border-[#30363d] relative"
            >
              <div className="flex gap-1 text-[#FFCC00] mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FFCC00" />)}
              </div>
              <p className="text-gray-300 italic mb-8 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFCC00] to-orange-600 flex items-center justify-center text-black font-black text-lg">
                  {r.name.charAt(0)}
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
