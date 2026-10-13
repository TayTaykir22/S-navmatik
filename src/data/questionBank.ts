import { Question } from '../types/exam';

// Ready-made vector diagram SVGs for science and math questions
export const QUESTION_DIAGRAMS = {
  rightTriangle: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130" width="200" height="130">
    <polygon points="30,105 170,105 30,25" fill="%23f8fafc" stroke="%230f172a" stroke-width="2"/>
    <rect x="30" y="93" width="12" height="12" fill="none" stroke="%230f172a" stroke-width="1.5"/>
    <circle cx="36" cy="99" r="1.5" fill="%230f172a"/>
    <text x="18" y="25" font-family="sans-serif" font-size="12" font-weight="bold">A</text>
    <text x="18" y="115" font-family="sans-serif" font-size="12" font-weight="bold">B</text>
    <text x="175" y="115" font-family="sans-serif" font-size="12" font-weight="bold">C</text>
    <text x="10" y="70" font-family="sans-serif" font-size="11">6 cm</text>
    <text x="95" y="122" font-family="sans-serif" font-size="11">8 cm</text>
    <text x="110" y="55" font-family="sans-serif" font-size="11" font-weight="bold" fill="%23dc2626">x = ?</text>
  </svg>`,
  physicsCircuit: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 110" width="220" height="110">
    <rect x="25" y="20" width="170" height="70" fill="none" stroke="%231e293b" stroke-width="2"/>
    <!-- Resistor R1 -->
    <rect x="80" y="12" width="50" height="16" fill="%23ffffff" stroke="%231e293b" stroke-width="2"/>
    <text x="92" y="24" font-family="sans-serif" font-size="10" font-weight="bold">R₁ = 6Ω</text>
    <!-- Battery -->
    <rect x="95" y="80" width="30" height="20" fill="%23ffffff"/>
    <line x1="102" y1="83" x2="102" y2="97" stroke="%231e293b" stroke-width="3"/>
    <line x1="112" y1="78" x2="112" y2="102" stroke="%231e293b" stroke-width="1.5"/>
    <text x="92" y="105" font-family="sans-serif" font-size="10">V = 24V</text>
    <text x="120" y="76" font-family="sans-serif" font-size="9">+</text>
    <text x="98" y="76" font-family="sans-serif" font-size="9">-</text>
    <!-- Ammeter -->
    <circle cx="160" cy="55" r="12" fill="%23ffffff" stroke="%231e293b" stroke-width="1.5"/>
    <text x="156" y="59" font-family="sans-serif" font-size="11" font-weight="bold">A</text>
  </svg>`,
  cartesianPlane: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 130" width="160" height="130">
    <line x1="20" y1="65" x2="140" y2="65" stroke="%2364748b" stroke-width="1.5"/>
    <line x1="80" y1="15" x2="80" y2="115" stroke="%2364748b" stroke-width="1.5"/>
    <polygon points="140,65 133,62 133,68" fill="%2364748b"/>
    <polygon points="80,15 77,22 83,22" fill="%2364748b"/>
    <text x="144" y="69" font-family="sans-serif" font-size="10">x</text>
    <text x="84" y="18" font-family="sans-serif" font-size="10">y</text>
    <line x1="35" y1="105" x2="125" y2="25" stroke="%23dc2626" stroke-width="2"/>
    <circle cx="80" cy="65" r="2.5" fill="%230f172a"/>
    <text x="70" y="77" font-family="sans-serif" font-size="9">O</text>
    <text x="110" y="40" font-family="sans-serif" font-size="10" fill="%23dc2626">d: y = 2x+1</text>
  </svg>`,
  barChart: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130" width="200" height="130">
    <line x1="30" y1="20" x2="30" y2="105" stroke="%23334155" stroke-width="2"/>
    <line x1="30" y1="105" x2="185" y2="105" stroke="%23334155" stroke-width="2"/>
    <rect x="45" y="55" width="22" height="50" fill="%233b82f6" rx="2"/>
    <rect x="80" y="35" width="22" height="70" fill="%2310b981" rx="2"/>
    <rect x="115" y="65" width="22" height="40" fill="%23f59e0b" rx="2"/>
    <rect x="150" y="25" width="22" height="80" fill="%236366f1" rx="2"/>
    <text x="52" y="118" font-size="10" font-family="sans-serif">A</text>
    <text x="87" y="118" font-size="10" font-family="sans-serif">B</text>
    <text x="122" y="118" font-size="10" font-family="sans-serif">C</text>
    <text x="157" y="118" font-size="10" font-family="sans-serif">D</text>
    <text x="12" y="18" font-size="10" font-family="sans-serif" font-weight="bold">Adet</text>
  </svg>`,
  numberLine: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 70" width="220" height="70">
    <line x1="20" y1="35" x2="200" y2="35" stroke="%230f172a" stroke-width="2"/>
    <polygon points="205,35 195,31 195,39" fill="%230f172a"/>
    <polygon points="15,35 25,31 25,39" fill="%230f172a"/>
    <line x1="40" y1="28" x2="40" y2="42" stroke="%230f172a" stroke-width="1.5"/>
    <text x="35" y="55" font-size="11" font-family="sans-serif">-2</text>
    <line x1="75" y1="28" x2="75" y2="42" stroke="%230f172a" stroke-width="1.5"/>
    <text x="70" y="55" font-size="11" font-family="sans-serif">-1</text>
    <line x1="110" y1="25" x2="110" y2="45" stroke="%230f172a" stroke-width="2"/>
    <text x="107" y="56" font-size="11" font-family="sans-serif" font-weight="bold">0</text>
    <line x1="145" y1="28" x2="145" y2="42" stroke="%230f172a" stroke-width="1.5"/>
    <text x="142" y="55" font-size="11" font-family="sans-serif">1</text>
    <line x1="180" y1="28" x2="180" y2="42" stroke="%230f172a" stroke-width="1.5"/>
    <text x="177" y="55" font-size="11" font-family="sans-serif">2</text>
    <circle cx="145" cy="35" r="4" fill="%23ef4444"/>
    <text x="140" y="20" font-size="11" font-family="sans-serif" font-weight="bold" fill="%23ef4444">K</text>
  </svg>`
};

export interface BankQuestionItem {
  id: string;
  subject: string;
  category: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  text: string;
  points: number;
  answerType: 'lined' | 'squared' | 'dotted' | 'blank';
  lineCount: number;
  image?: {
    url: string;
    position: 'below-text' | 'right' | 'top';
    size: 'small' | 'medium' | 'large';
    widthPercent: number;
  };
  solutionNotes: string;
}

export const QUESTION_BANK: BankQuestionItem[] = [
  // MATEMATİK
  {
    id: 'mat-1',
    subject: 'Matematik',
    category: 'Denklemler & Eşitsizlikler',
    difficulty: 'Orta',
    text: '2x + 5 = 3(x - 2) + 9 denklemini sağlayan x gerçek sayısını işlem adımlarını göstererek bulunuz.',
    points: 10,
    answerType: 'squared',
    lineCount: 5,
    solutionNotes: '2x + 5 = 3x - 6 + 9 => 2x + 5 = 3x + 3 => x = 2'
  },
  {
    id: 'mat-2',
    subject: 'Matematik',
    category: 'Geometri',
    difficulty: 'Kolay',
    text: 'Yandaki şekilde verilen ABC dik üçgeninde |AB| = 6 cm ve |BC| = 8 cm olduğuna göre hipotenüs uzunluğu |AC| = x değerini Pisagor bağıntısını kullanarak hesaplayınız.',
    points: 10,
    answerType: 'squared',
    lineCount: 5,
    image: {
      url: QUESTION_DIAGRAMS.rightTriangle,
      position: 'right',
      size: 'small',
      widthPercent: 40
    },
    solutionNotes: '|AC|² = 6² + 8² = 36 + 64 = 100 => |AC| = 10 cm'
  },
  {
    id: 'mat-3',
    subject: 'Matematik',
    category: 'Fonksiyonlar',
    difficulty: 'Orta',
    text: 'f: R -> R olmak üzere f(x) = 3x - 4 fonksiyonu veriliyor. Buna göre f(2) + f⁻¹(5) toplamının sonucunu işlem basamaklarıyla bulunuz.',
    points: 10,
    answerType: 'squared',
    lineCount: 6,
    solutionNotes: 'f(2) = 3(2) - 4 = 2. f⁻¹(5) için: 3x - 4 = 5 => 3x = 9 => x = 3. Toplam = 2 + 3 = 5.'
  },
  {
    id: 'mat-4',
    subject: 'Matematik',
    category: 'İkinci Dereceden Denklemler',
    difficulty: 'Zor',
    text: 'x² - 5x + 6 = 0 denkleminin çözüm kümesini çarpanlara ayırma yöntemi ve diskriminant (Δ) yöntemlerini belirterek bulunuz.',
    points: 15,
    answerType: 'squared',
    lineCount: 7,
    solutionNotes: '(x - 2)(x - 3) = 0 => x₁ = 2, x₂ = 3. ÇK = {2, 3}'
  },
  {
    id: 'mat-5',
    subject: 'Matematik',
    category: 'Analitik Geometri',
    difficulty: 'Orta',
    text: 'Analitik düzlemde A(2, -3) ve B(6, 5) noktaları arasındaki uzaklığı formülü yazıp uygulayarak hesaplayınız.',
    points: 10,
    answerType: 'squared',
    lineCount: 5,
    solutionNotes: 'd = √[(6 - 2)² + (5 - (-3))²] = √[16 + 64] = √80 = 4√5 birim'
  },
  {
    id: 'mat-6',
    subject: 'Matematik',
    category: 'Kümeler',
    difficulty: 'Kolay',
    text: 's(A) = 14, s(B) = 18 ve s(A ∩ B) = 6 olduğuna göre A ∪ B kümesinin eleman sayısını formülü yazarak hesaplayınız.',
    points: 10,
    answerType: 'squared',
    lineCount: 4,
    solutionNotes: 's(A ∪ B) = s(A) + s(B) - s(A ∩ B) = 14 + 18 - 6 = 26'
  },

  // TÜRK DİLİ VE EDEBİYATI
  {
    id: 'edb-1',
    subject: 'Türk Dili ve Edebiyatı',
    category: 'Metin Analizi',
    difficulty: 'Orta',
    text: '"Sanatçı, toplumun aynası olduğu kadar geleceğe ışık tutan bir fenerdir." sözüyle anlatılmak isteneni kendi cümlelerinizle, örneklerle destekleyerek en az 4 cümle halinde açıklayınız.',
    points: 15,
    answerType: 'lined',
    lineCount: 6,
    solutionNotes: 'Öğrencinin sanatçının hem mevcut toplumu yansıtma hem de topluma rehberlik etme rolünü açıklaması beklenir.'
  },
  {
    id: 'edb-2',
    subject: 'Türk Dili ve Edebiyatı',
    category: 'Şiir Bilgisi',
    difficulty: 'Orta',
    text: 'Aşağıdaki dizelerin kafiye (uyak) türünü, redifini ve ölçüsünü bularak ilgili alana yazınız:\n\n"Gözlerin gözlerime değince\nFelaketim olurdu, ağlardım\nBeni sevmiyordun, bilirdim\nBir sevdiğin vardı, duyardım"',
    points: 10,
    answerType: 'lined',
    lineCount: 5,
    solutionNotes: 'ağlardım / bilirdim / duyardım dizelerinde -r zaman eki ve -dım şahıs eki rediftir. Ağla / bil / duy köklerinde benzer ses aranır.'
  },
  {
    id: 'edb-3',
    subject: 'Türk Dili ve Edebiyatı',
    category: 'Dil Bilgisi',
    difficulty: 'Kolay',
    text: '"Okul bahçesinde toplanan öğrenciler büyük bir heyecanla sonuçları bekliyordu." cümlesini ögelerine ayırarak (Özne, Nesne, Zarf Tümleci, Dolaylı Tümleç, Yüklem) belirtiniz.',
    points: 10,
    answerType: 'lined',
    lineCount: 4,
    solutionNotes: 'Bekliyordu: Yüklem. Okul bahçesinde toplanan öğrenciler: Özne. Büyük bir heyecanla: Zarf Tümleci. Sonuçları: Belirtili Nesne.'
  },
  {
    id: 'edb-4',
    subject: 'Türk Dili ve Edebiyatı',
    category: 'Yazım Kuralları',
    difficulty: 'Kolay',
    text: 'Aşağıdaki cümlelerde yapılan yazım yanlışlarını bularak doğrularını altına yazınız:\na) Yarın ki toplantı TBMM\'de yapılacak mı?\nb) 1980\'de Adana\'da doğan şair, Türkçeyi çok güzel kullanır.',
    points: 10,
    answerType: 'lined',
    lineCount: 4,
    solutionNotes: 'a) "Yarınki" bitişik yazılmalıdır (sıfat yapan -ki). b) Doğrudur veya verilen yanlış düzeltilir.'
  },

  // FEN BİLİMLERİ & FİZİK
  {
    id: 'fiz-1',
    subject: 'Fizik',
    category: 'Elektrik',
    difficulty: 'Orta',
    text: 'Şekilde verilen elektrik devresinde ana koldan geçen akım şiddetini (I) Ohm Kanunu (V = I · R) bağıntısını kullanarak hesaplayınız.',
    points: 10,
    answerType: 'squared',
    lineCount: 5,
    image: {
      url: QUESTION_DIAGRAMS.physicsCircuit,
      position: 'right',
      size: 'small',
      widthPercent: 42
    },
    solutionNotes: 'V = I · R => 24 = I · 6 => I = 4 Amper'
  },
  {
    id: 'fiz-2',
    subject: 'Fizik',
    category: 'Kuvvet ve Hareket',
    difficulty: 'Orta',
    text: 'Sürtünmesiz yatay bir düzlemde durmakta olan 4 kg kütleli bir cisme 20 N büyüklüğünde yatay bir kuvvet 5 saniye boyunca uygulanıyor. Cismin kazanacağı ivmeyi (a) ve 5 saniye sonundaki hızını (v) bulunuz.',
    points: 15,
    answerType: 'squared',
    lineCount: 6,
    solutionNotes: 'F = m · a => 20 = 4 · a => a = 5 m/s². v = a · t = 5 · 5 = 25 m/s'
  },

  // KİMYA
  {
    id: 'kim-1',
    subject: 'Kimya',
    category: 'Periyodik Sistem',
    difficulty: 'Kolay',
    text: '₁₁Na (Sodyum) ve ₁₇Cl (Klor) atomlarının katman elektron dizilimlerini yazarak periyodik tablodaki periyot ve grup numaralarını belirtiniz.',
    points: 10,
    answerType: 'squared',
    lineCount: 5,
    solutionNotes: 'Na: 2)8)1 -> 3. periyot 1A grubu. Cl: 2)8)7 -> 3. periyot 7A grubu.'
  },
  {
    id: 'kim-2',
    subject: 'Kimya',
    category: 'Mol Kavramı',
    difficulty: 'Orta',
    text: 'Normal şartlar altında (NŞA) 44,8 litre hacim kaplayan CO₂ gazının kaç mol olduğunu ve kaç gram olduğunu bulunuz. (C: 12, O: 16 g/mol)',
    points: 10,
    answerType: 'squared',
    lineCount: 5,
    solutionNotes: 'n = V / 22.4 = 44.8 / 22.4 = 2 mol. M_A = 12 + 2·16 = 44 g/mol. m = n · M_A = 2 · 44 = 88 gram.'
  },

  // BİYOLOJİ
  {
    id: 'biy-1',
    subject: 'Biyoloji',
    category: 'Hücre Bölünmeleri',
    difficulty: 'Orta',
    text: 'Mitoz bölünme ile Mayoz bölünme arasındaki farklardan en az 4 tanesini maddeler halinde yazınız.',
    points: 15,
    answerType: 'lined',
    lineCount: 6,
    solutionNotes: '1. Vücut hücreleri / Üreme ana hücreleri. 2. 2 hücre / 4 hücre oluşur. 3. Kromozom sayısı sabit kalır / yarıya iner. 4. Kalıtsal çeşitlilik yoktur / vardır (krossing-over).'
  },

  // TARİH & SOSYAL BİLGİLER
  {
    id: 'tar-1',
    subject: 'Tarih',
    category: 'Kurtuluş Savaşı',
    difficulty: 'Orta',
    text: 'Mustafa Kemal Atatürk\'ün Amasya Genelgesi\'nde yer alan "Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır." maddesinin Millî Mücadele tarihindeki önemini ve niteliğini (amaç-yöntem) açıklayınız.',
    points: 15,
    answerType: 'lined',
    lineCount: 6,
    solutionNotes: 'Bu madde Kurtuluş Savaşı\'nın gerekçesinden öte amaç ve yöntemini ilk kez ortaya koymuş, millet egemenliğine dayalı yeni bir yönetimin ilk sinyalini vermiştir.'
  },
  {
    id: 'tar-2',
    subject: 'Tarih',
    category: 'Osmanlı Tarihi',
    difficulty: 'Kolay',
    text: 'Osmanlı Devleti\'nde uygulanan Tımar sisteminin devlete sağladığı askerî, ekonomik ve idari faydalardan 3 tanesini yazınız.',
    points: 10,
    answerType: 'lined',
    lineCount: 5,
    solutionNotes: '1. Hazineden para çıkmadan savaşa hazır tımarlı sipahi ordusu yetiştirildi. 2. Tarımsal üretimde süreklilik sağlandı. 3. Taşrada güvenlik ve asayiş korundu.'
  },

  // COĞRAFYA
  {
    id: 'cog-1',
    subject: 'Coğrafya',
    category: 'İklim',
    difficulty: 'Orta',
    text: 'Akdeniz İklimi\'nin genel sıcaklık ve yağış özelliklerini, bitki örtüsünü ve Türkiye\'de görüldüğü başlıca alanları yazınız.',
    points: 10,
    answerType: 'lined',
    lineCount: 5,
    solutionNotes: 'Yazlar sıcak ve kurak, kışlar ılık ve yağışlıdır. Bitki örtüsü maki (bodur çalılar). Akdeniz, Ege ve Güney Marmara kıyılarında etkilidir.'
  },

  // İNGİLİZCE
  {
    id: 'ing-1',
    subject: 'İngilizce',
    category: 'Writing & Expression',
    difficulty: 'Orta',
    text: 'Write a short paragraph (at least 4-5 sentences) about your future career plans and what steps you need to take to achieve your goals.',
    points: 15,
    answerType: 'lined',
    lineCount: 6,
    solutionNotes: 'Expected clear sentences using will / going to / want to and relevant vocabulary.'
  },

  // DİN KÜLTÜRÜ & FELSEFE
  {
    id: 'din-1',
    subject: 'Din Kültürü',
    category: 'İnanç & İbadet',
    difficulty: 'Kolay',
    text: 'İslam dininde aklın ve iradenin sorumluluk ile ilişkisini açıklayınız. Kişinin eylemlerinden sorumlu tutulabilmesi için hangi temel şartlar gereklidir?',
    points: 10,
    answerType: 'lined',
    lineCount: 5,
    solutionNotes: 'Kişinin sorumlu olması için akıl sağlığının yerinde olması ve özgür iradesiyle karar verebilmesi gerekir.'
  },
  {
    id: 'fel-1',
    subject: 'Felsefe',
    category: 'Bilgi Felsefesi (Epistemoloji)',
    difficulty: 'Orta',
    text: 'Rasyonalizm (Akılcılık) ve Empirizm (Deneycilik) akımlarının bilginin kaynağına bakışlarını karşılaştırarak kısaca açıklayınız.',
    points: 15,
    answerType: 'lined',
    lineCount: 5,
    solutionNotes: 'Rasyonalizm doğru bilginin kaynağını akıl olarak görür ve bilgilerin doğuştan geldiğini savunur (Descartes, Platon). Empirizm ise bilginin deney ve duyumlarla sonradan kazanıldığını savunur (John Locke: Tabula Rasa).'
  }
];

export const SUBJECT_OPTIONS = [
  'Tümü',
  'Matematik',
  'Türk Dili ve Edebiyatı',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Tarih',
  'Coğrafya',
  'İngilizce',
  'Felsefe',
  'Din Kültürü'
];
