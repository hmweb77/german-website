// Static quiz bank for lesson gates. Keyed by exact lesson title (Arabic).
// Each value is an array of 5 multiple-choice questions with 4 options each,
// and a zero-based correctIndex.

export const QUIZZES = {
  'الدرس 1: الحروف الألمانية (Alphabet)': [
    {
      question: 'كم عدد الحروف في الأبجدية الألمانية الأساسية (بدون Umlaute و ß)؟',
      options: ['24', '25', '26', '30'],
      correctIndex: 2,
    },
    {
      question: 'أيُّ من هذه الحروف هو حرف Umlaut؟',
      options: ['B', 'Ö', 'L', 'R'],
      correctIndex: 1,
    },
    {
      question: 'كيف يُنطق حرف "W" في اللغة الألمانية؟',
      options: ['مثل W في الإنجليزية', 'مثل V في الإنجليزية', 'مثل F', 'مثل صامت'],
      correctIndex: 1,
    },
    {
      question: 'ماذا يُسمى الحرف "ß" في الألمانية؟',
      options: ['Umlaut', 'Eszett (أو scharfes S)', 'Doppel-B', 'Beta'],
      correctIndex: 1,
    },
    {
      question: 'كيف يُنطق الحرف "J" في الألمانية (مثل Ja)؟',
      options: ['مثل J في الإنجليزية', 'مثل Y في "Yes"', 'مثل H', 'مثل Ch'],
      correctIndex: 1,
    },
  ],

  'الدرس 2: الأرقام بالألمانية': [
    {
      question: 'كيف نقول الرقم "3" بالألمانية؟',
      options: ['zwei', 'drei', 'vier', 'fünf'],
      correctIndex: 1,
    },
    {
      question: 'ما معنى "zehn"؟',
      options: ['7', '9', '10', '12'],
      correctIndex: 2,
    },
    {
      question: 'كيف نكتب الرقم 21 بالألمانية؟',
      options: ['zwanzigeins', 'einundzwanzig', 'zweiundzehn', 'einszwanzig'],
      correctIndex: 1,
    },
    {
      question: 'ما معنى "hundert"؟',
      options: ['10', '50', '100', '1000'],
      correctIndex: 2,
    },
    {
      question: 'أيّ رقم يقابل "sechzig"؟',
      options: ['16', '60', '66', '600'],
      correctIndex: 1,
    },
  ],

  'الدرس 3: الأفعال Haben و Sein + الضمائر الشخصية': [
    {
      question: 'ما هو تصريف فعل "sein" مع الضمير "ich"؟',
      options: ['bin', 'bist', 'ist', 'sind'],
      correctIndex: 0,
    },
    {
      question: 'ما هو تصريف فعل "haben" مع الضمير "du"؟',
      options: ['habe', 'hast', 'hat', 'haben'],
      correctIndex: 1,
    },
    {
      question: 'ماذا يعني الضمير "wir"؟',
      options: ['أنا', 'أنت', 'نحن', 'هم'],
      correctIndex: 2,
    },
    {
      question: 'اختر الجملة الصحيحة:',
      options: ['Er sind müde', 'Er ist müde', 'Er bist müde', 'Er bin müde'],
      correctIndex: 1,
    },
    {
      question: 'ما معنى جملة "Ich habe ein Buch"؟',
      options: ['أنا كتاب', 'لديّ كتاب', 'هذا كتاب', 'أنا أقرأ كتاباً'],
      correctIndex: 1,
    },
  ],

  'الدرس 4: أدوات التعريف والتنكير': [
    {
      question: 'أيُّ أداة تعريف تُستخدم مع الاسم المذكر في الألمانية؟',
      options: ['die', 'das', 'der', 'den'],
      correctIndex: 2,
    },
    {
      question: 'ما أداة التعريف المناسبة لكلمة "Mädchen" (فتاة)؟',
      options: ['der', 'die', 'das', 'den'],
      correctIndex: 2,
    },
    {
      question: 'أداة التنكير المستخدمة مع المؤنث هي:',
      options: ['ein', 'eine', 'einen', 'einem'],
      correctIndex: 1,
    },
    {
      question: 'اختر الجملة الصحيحة:',
      options: ['Das ist ein Frau', 'Das ist eine Frau', 'Das ist der Frau', 'Das ist einen Frau'],
      correctIndex: 1,
    },
    {
      question: 'ما الفرق بين "der" و "ein"؟',
      options: [
        '"der" للمؤنث و "ein" للمذكر',
        '"der" للتعريف و "ein" للتنكير',
        'لا فرق بينهما',
        '"der" للجمع و "ein" للمفرد',
      ],
      correctIndex: 1,
    },
  ],

  'الدرس 5: الضمائر الملكية': [
    {
      question: 'ما الضمير الملكي المقابل لـ "ich"؟',
      options: ['dein', 'sein', 'mein', 'unser'],
      correctIndex: 2,
    },
    {
      question: 'ما معنى "dein Buch"؟',
      options: ['كتابي', 'كتابك', 'كتابه', 'كتابها'],
      correctIndex: 1,
    },
    {
      question: 'الضمير الملكي "ihr" يعني:',
      options: ['كتابه', 'كتابها / كتابهم', 'كتابنا', 'كتابي'],
      correctIndex: 1,
    },
    {
      question: 'اختر الجملة الصحيحة للتعبير عن "سيارته":',
      options: ['mein Auto', 'dein Auto', 'sein Auto', 'ihr Auto'],
      correctIndex: 2,
    },
    {
      question: 'ما معنى "unser Haus"؟',
      options: ['بيتي', 'بيتك', 'بيتنا', 'بيتهم'],
      correctIndex: 2,
    },
  ],

  'الدرس 6: العائلة (Die Familie)': [
    {
      question: 'ماذا تعني كلمة "Mutter"؟',
      options: ['أب', 'أم', 'أخ', 'جدة'],
      correctIndex: 1,
    },
    {
      question: 'ما معنى "Bruder"؟',
      options: ['أخت', 'أخ', 'ابن', 'عم'],
      correctIndex: 1,
    },
    {
      question: 'كلمة "Großvater" تعني:',
      options: ['أب', 'جد', 'خال', 'ابن'],
      correctIndex: 1,
    },
    {
      question: 'ما معنى "Tochter"؟',
      options: ['ابن', 'ابنة', 'أخت', 'زوجة'],
      correctIndex: 1,
    },
    {
      question: 'أداة التعريف الصحيحة لكلمة "Familie" هي:',
      options: ['der', 'die', 'das', 'den'],
      correctIndex: 1,
    },
  ],

  'الدرس 7: الوقت – الجزء الأول': [
    {
      question: 'كيف نسأل "كم الساعة؟" في الألمانية؟',
      options: ['Wie geht es?', 'Wie spät ist es?', 'Was ist das?', 'Wo bist du?'],
      correctIndex: 1,
    },
    {
      question: 'ماذا تعني "Es ist drei Uhr"؟',
      options: ['الساعة الثانية', 'الساعة الثالثة', 'الساعة الرابعة', 'الساعة الخامسة'],
      correctIndex: 1,
    },
    {
      question: 'كيف نقول "الساعة النصف بعد الثانية عشرة" (12:30) بالطريقة الألمانية الشائعة؟',
      options: ['halb eins', 'halb zwölf', 'halb zwei', 'zwölf halb'],
      correctIndex: 0,
    },
    {
      question: 'ماذا تعني كلمة "Uhr"؟',
      options: ['يوم', 'ساعة (وقت)', 'دقيقة', 'أسبوع'],
      correctIndex: 1,
    },
    {
      question: 'كيف نعبّر عن "الربع بعد الثالثة" (3:15)؟',
      options: ['Viertel vor drei', 'Viertel nach drei', 'halb drei', 'drei Uhr fünfzehn'],
      correctIndex: 1,
    },
  ],

  'الدرس 8: الوقت – الجزء الثاني': [
    {
      question: 'كيف نقول "الربع قبل الخامسة" (4:45) بالألمانية؟',
      options: ['Viertel nach fünf', 'Viertel vor fünf', 'halb fünf', 'halb vier'],
      correctIndex: 1,
    },
    {
      question: 'ماذا تعني "zwanzig nach sechs"؟',
      options: ['5:40', '6:20', '6:40', '7:20'],
      correctIndex: 1,
    },
    {
      question: 'ما معنى "zehn vor acht"؟',
      options: ['7:50', '8:10', '10:08', '7:10'],
      correctIndex: 0,
    },
    {
      question: 'كلمة "morgens" تعني:',
      options: ['ليلاً', 'صباحاً', 'ظهراً', 'مساءً'],
      correctIndex: 1,
    },
    {
      question: 'كيف نقول "الآن الساعة الثامنة تماماً"؟',
      options: [
        'Es ist halb acht',
        'Es ist acht Uhr',
        'Es ist Viertel nach acht',
        'Es ist acht vor neun',
      ],
      correctIndex: 1,
    },
  ],

  'الدرس 9: الألوان بالألمانية': [
    {
      question: 'ماذا يعني "rot"؟',
      options: ['أزرق', 'أحمر', 'أخضر', 'أصفر'],
      correctIndex: 1,
    },
    {
      question: 'كلمة "blau" تعني:',
      options: ['أسود', 'أبيض', 'أزرق', 'بني'],
      correctIndex: 2,
    },
    {
      question: 'ما معنى "grün"؟',
      options: ['رمادي', 'أخضر', 'برتقالي', 'وردي'],
      correctIndex: 1,
    },
    {
      question: 'كلمة "schwarz" تعني:',
      options: ['أبيض', 'أسود', 'أصفر', 'بنفسجي'],
      correctIndex: 1,
    },
    {
      question: 'اختر الجملة الصحيحة للتعبير عن "السيارة حمراء":',
      options: [
        'Das Auto ist rot',
        'Das Auto bin rot',
        'Der Auto ist rot',
        'Die Auto ist rote',
      ],
      correctIndex: 0,
    },
  ],
};

/**
 * Returns the quiz (array of 5 questions) for a given lesson title, or null
 * when no quiz is defined for that lesson (the gate should be skipped).
 */
export function getQuizForLesson(title) {
  if (!title) return null;
  return QUIZZES[title] || null;
}
