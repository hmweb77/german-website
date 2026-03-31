'use client';

import { motion } from 'framer-motion';

const steps = [
  { level: 'A1.1', label: 'تبدا تفهم', hours: '8h · 87 lectures', outcome: 'الحروف، النطق، الأرقام، الجمل الأولى، التعارف', color: '#FFCC00' },
  { level: 'A1.2', label: 'تبدا تهضر', hours: '9.5h · 106 lectures', outcome: 'المحادثات اليومية، الأفعال، الأزمنة، القواعد الأساسية', color: '#f97316' },
  { level: 'A2.1', label: 'تتواصل', hours: '10.5h · 98 lectures', outcome: 'بناء الجمل المركبة، السفر، العمل، المحادثات المتقدمة', color: '#c2410c' },
  { level: 'A2.2', label: 'جاهز 🇩🇪', hours: '5.5h · 55 lectures', outcome: 'كتابة الرسائل، القواعد المتقدمة، التحضير للامتحان', color: '#16a34a' },
];

export default function Roadmap() {
  return (
    <section className="py-24 bg-[#0d1117]" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mt-4 mb-4">من صفر حتى A2، خطوة بخطوة</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">ماشي فيديوهات عشوائية. هادي خريطة طريق واضحة توصّلك للهدف ديالك.</p>
        </div>

        <div className="relative mt-20">
          {/* Progress Line */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-gray-800 rounded-full overflow-hidden hidden md:block">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-l from-[#FFCC00] via-orange-500 to-green-600 origin-right"
            />
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="relative pt-10"
              >
                {/* Dot */}
                <div
                  className="absolute -top-2 right-1/2 translate-x-1/2 w-5 h-5 rounded-full z-10 hidden md:block shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                  style={{ backgroundColor: step.color }}
                ></div>

                <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl hover:border-[#FFCC00]/30 transition-all">
                  <div className="text-xs font-black mb-2" style={{ color: step.color }}>{step.level}</div>
                  <h4 className="text-xl font-black text-white mb-2">{step.label}</h4>
                  <p className="text-xs text-gray-500 mb-4 font-mono">{step.hours}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.outcome}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
