'use client';

import { motion } from 'framer-motion';

const courses = [
  {
    title: 'أساسيات اللغة، من الصفر',
    meta: '8h · 87 lectures',
    topics: [
      'نطق الحروف ومقاطع الحروف بشكل احترافي',
      'الأرقام من 1 إلى 1000 مع التمارين',
      'Der Die Das، أدوات التعريف بأبسط الطرق',
      'الجمل الأساسية، التحيات، التعارف',
      'قراءة الساعة، الألوان، أيام الأسبوع',
      'محادثات من الحياة اليومية + امتحانات',
    ],
    footer: '6 أقسام · اختبارات · استماع',
    accent: 'border-t-4 border-t-[#FFCC00]'
  },
  {
    title: 'التواصل الأساسي، تبدا تهضر',
    meta: '9.5h · 106 lectures',
    topics: [
      'الأفعال المنتظمة وغير المنتظمة',
      'الحالات الإعرابية: Nominativ, Akkusativ, Dativ',
      'المهن، الطقس، الروتين اليومي',
      'الضمائر الملكية والشخصية',
      'زمن الماضي التام (Perfekt) + المستقبل',
      '36 مقالة + محادثات متقدمة + امتحان',
    ],
    footer: '6 أقسام · 36 مقالة',
    accent: 'border-t-4 border-t-orange-500'
  },
  {
    title: 'الحياة اليومية، تتواصل بثقة',
    meta: '10.5h · 98 lectures',
    topics: [
      'الجمل الأساسية والفرعية (Nebensatz)',
      'تصاريف الصفات مع الحالات الإعرابية',
      'أهم 100 فعل مع تصاريف الأزمنة',
      'Konjunktiv II، التعبير عن الرغبات',
      'أساسيات بناء الجمل المركبة',
      'محادثات واقعية: طعام، سفر، صحة، عمل',
    ],
    footer: '6 أقسام · 22 مقالة',
    accent: 'border-t-4 border-t-orange-700'
  },
  {
    title: 'جاهز للامتحان، المستوى الأخير',
    meta: '5.5h · 55 lectures',
    topics: [
      'Genitiv + Passiv (المبني للمجهول)',
      'أدوات الربط المتقدمة مع تحليل الجمل',
      'كتابة الرسائل (Briefe schreiben)',
      'مراجعة شاملة: أفعال، ضمائر، حالات',
      'قصص من الحياة اليومية للاستماع',
      'امتحان القواعد الشامل',
    ],
    footer: '4 أقسام · امتحان شامل',
    accent: 'border-t-4 border-t-green-600'
  },
];

export default function Courses() {
  return (
    <section id="curriculum" className="py-24 bg-black/30" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mt-4 mb-4">شنو غادي تقرا بالضبط؟</h2>
          <p className="text-gray-200">4 كورسات كاملين، 346 درس، 33+ ساعة ديال المحتوى المنظم.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {courses.map((c, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className={`bg-[#161b22] ${c.accent} rounded-2xl overflow-hidden flex flex-col`}
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-black text-white">{c.title}</h3>
                  <div className="text-[#FFCC00] font-mono text-xs whitespace-nowrap">{c.meta}</div>
                </div>
                <ul className="space-y-3">
                  {c.topics.map((t, i) => (
                    <li key={i} className="text-gray-400 flex items-start gap-3 text-sm">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FFCC00] shrink-0"></div>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-8 py-4 bg-black/40 border-t border-[#21262d] flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-500 uppercase">{c.footer}</span>
                <span className="text-green-500 uppercase">Certificate ✓</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
