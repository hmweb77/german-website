'use client';

import { motion } from 'framer-motion';

const props = [
  { title: 'منهج واضح ومنظم', desc: 'ماشي فيديوهات عشوائية من YouTube. كلشي مرتب من الحرف الأول حتى مستوى A2. كل درس كيبني على اللي قبلو.', icon: '📐' },
  { title: 'تعلم عملي بالتمارين', desc: '70+ اختبار وتمرين تطبيقي. أقسام الاستماع، حوارات من الحياة اليومية، وامتحانات شاملة فكل مستوى.', icon: '🎯' },
  { title: 'مصمم للعرب والمغاربة', desc: 'الشرح بالعربية البسيطة، مع أمثلة قريبة من الحياة ديالنا. مناسب حتى إلا ما عندك حتى أساس.', icon: '🇲🇦' },
  { title: 'نتيجة واضحة', desc: 'توصل لمستوى A2 المعترف بيه. تقدر تجوز امتحان Goethe-Zertifikat وتقدم للفيزا أو Ausbildung.', icon: '🏆' },
];

export default function ValueProps() {
  return (
    <section className="py-24 border-t border-[#21262d]" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mt-4">علاش هاد الكورسات مختلفين؟</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {props.map((p, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-8 bg-[#161b22] border border-[#30363d] rounded-2xl flex gap-6 items-start"
            >
             
              <div className="text-right">
                <h3 className="text-xl font-black text-yellow-500 mb-3">{p.title}</h3>
                <p className="text-gray-100 leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
