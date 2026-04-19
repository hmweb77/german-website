import Link from 'next/link';

export const metadata = {
  title: 'شكراً لك! تم استلام التسجيل',
  description: 'تم استلام معلوماتك بنجاح. غادي نتواصلو معاك قريباً لتحديد طريقة الدفع.',
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-['Cairo'] flex items-center justify-center px-6" dir="rtl">
      <div className="w-full max-w-2xl">
        <div className="bg-[#161b22] border border-[#30363d] rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-[#FFCC00] p-6 text-black">
            <p className="text-xs font-bold opacity-80 uppercase tracking-tight">Registration</p>
            <h1 className="font-black text-2xl mt-1">شكراً لك! تم استلام التسجيل</h1>
          </div>

          <div className="p-8 space-y-5 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-3xl">
              ✓
            </div>

            <p className="text-lg text-gray-200 leading-relaxed">
              شكراً، توصلنا بالمعلومات ديالك. غادي نتواصلو معاك قريباً باش نحددو طريقة الدفع.
            </p>

            <p className="text-sm text-gray-400">
              طرق الدفع: <span className="text-white font-semibold">Carte Bancaire</span> ·{' '}
              <span className="text-white font-semibold">Virement Bancaire</span> ·{' '}
              <span className="text-white font-semibold">CashPlus / Wafacash</span>
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/#register"
                className="inline-flex items-center justify-center rounded-xl px-6 py-4 font-black bg-[#FFCC00] text-black hover:scale-[1.02] transition-all"
              >
                رجع للتسجيل
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl px-6 py-4 font-bold border border-[#30363d] bg-[#0d1117] text-white hover:border-[#FFCC00] transition-all"
              >
                الصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

