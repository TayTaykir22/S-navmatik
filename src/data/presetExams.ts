import { ExamData } from '../types/exam';
import { PRESET_LOGOS } from './defaultLogos';
import { QUESTION_DIAGRAMS } from './questionBank';

export const PRESET_EXAMS: ExamData[] = [
  {
    id: 'matematik-10-klasik',
    title: '1. Dönem 1. Ortak Yazılı Sınavı',
    header: {
      ministryTitle: '',
      district: '',
      schoolName: 'İSTİKLAL ORTAOKULU',
      academicYear: '2026-2027 EĞİTİM VE ÖĞRETİM YILI',
      termExam: '1. DÖNEM 1. ORTAK YAZILI SINAVI',
      courseName: '',
      gradeClass: '',
      examDate: '09/10/2026',
      durationMinutes: 40,
      examGroup: 'A GRUBU',
      scenario: '',
      logoLeft: PRESET_LOGOS[0].dataUrl,
      logoRight: PRESET_LOGOS[1].dataUrl,
      showStudentInfoBox: true,
      showHeaderBorder: true
    },
    questions: [
      {
        id: 'q1',
        number: 1,
        text: '2x + 5 = 3(x - 2) + 9 denklemi veriliyor.\nBuna göre denklemi sağlayan x gerçek sayısını işlem adımlarını sırasıyla göstererek bulunuz.',
        premise: '2x + 5 = 3(x - 2) + 9 denklemi veriliyor.',
        stem: 'Buna göre denklemi sağlayan x gerçek sayısını işlem adımlarını sırasıyla göstererek bulunuz.',
        points: 10,
        subject: 'Matematik',
        answerSpace: {
          type: 'squared',
          lineCount: 5,
          showBorder: true,
          boxHeightPx: 95,
          hintText: 'Çözüm Alanı:'
        },
        solutionNotes: '2x + 5 = 3x - 6 + 9 => 2x + 5 = 3x + 3 => x = 2'
      },
      {
        id: 'q2',
        number: 2,
        text: 'Yandaki şekilde verilen ABC dik üçgeninde |AB| = 6 cm ve |BC| = 8 cm\'dir.\nBuna göre |AC| = x hipotenüs uzunluğunu Pisagor teoremini uygulayarak bulunuz.',
        premise: 'Yandaki şekilde verilen ABC dik üçgeninde |AB| = 6 cm ve |BC| = 8 cm\'dir.',
        stem: 'Buna göre |AC| = x hipotenüs uzunluğunu Pisagor teoremini uygulayarak bulunuz.',
        points: 10,
        subject: 'Matematik',
        image: {
          url: QUESTION_DIAGRAMS.rightTriangle,
          position: 'right',
          size: 'small',
          widthPercent: 42
        },
        answerSpace: {
          type: 'squared',
          lineCount: 5,
          showBorder: true,
          boxHeightPx: 95,
          hintText: 'Çözüm Alanı:'
        },
        solutionNotes: '|AC|² = 6² + 8² = 100 => |AC| = 10 cm'
      },
      {
        id: 'q3',
        number: 3,
        text: 'f(x) = 3x - 4 fonksiyonu veriliyor.\nBuna göre f(2) + f⁻¹(5) işleminin sonucunu bulunuz.',
        premise: 'f(x) = 3x - 4 fonksiyonu veriliyor.',
        stem: 'Buna göre f(2) + f⁻¹(5) işleminin sonucunu bulunuz.',
        points: 10,
        subject: 'Matematik',
        answerSpace: {
          type: 'squared',
          lineCount: 5,
          showBorder: true,
          boxHeightPx: 95,
          hintText: 'Çözüm Alanı:'
        },
        solutionNotes: 'f(2) = 2, f⁻¹(5) = 3. Toplam = 5'
      },
      {
        id: 'q4',
        number: 4,
        text: 'x² - 5x + 6 = 0 ikinci dereceden denklemi verilmiştir.\nBuna göre denklemin çözüm kümesini çarpanlara ayırma yöntemi ile göstererek bulunuz.',
        premise: 'x² - 5x + 6 = 0 ikinci dereceden denklemi verilmiştir.',
        stem: 'Buna göre denklemin çözüm kümesini çarpanlara ayırma yöntemi ile göstererek bulunuz.',
        points: 15,
        subject: 'Matematik',
        answerSpace: {
          type: 'squared',
          lineCount: 6,
          showBorder: true,
          boxHeightPx: 105,
          hintText: 'Çözüm Alanı:'
        },
        solutionNotes: '(x - 2)(x - 3) = 0 => ÇK = {2, 3}'
      },
      {
        id: 'q5',
        number: 5,
        text: 'Analitik düzlemde A(2, -3) ve B(6, 5) noktaları verilmektedir.\nBuna göre iki nokta arasındaki uzaklığı formülü yazıp uygulayarak hesaplayınız.',
        premise: 'Analitik düzlemde A(2, -3) ve B(6, 5) noktaları verilmektedir.',
        stem: 'Buna göre iki nokta arasındaki uzaklığı formülü yazıp uygulayarak hesaplayınız.',
        points: 15,
        subject: 'Matematik',
        answerSpace: {
          type: 'squared',
          lineCount: 6,
          showBorder: true,
          boxHeightPx: 105,
          hintText: 'Çözüm Alanı:'
        },
        solutionNotes: 'd = √[(4)² + (8)²] = √80 = 4√5'
      },
      {
        id: 'q6',
        number: 6,
        text: 's(A) = 14, s(B) = 18 ve s(A ∩ B) = 6 bilgileri verilmektedir.\nBuna göre A ∪ B kümesinin eleman sayısını formülü yazarak hesaplayınız.',
        premise: 's(A) = 14, s(B) = 18 ve s(A ∩ B) = 6 bilgileri verilmektedir.',
        stem: 'Buna göre A ∪ B kümesinin eleman sayısını formülü yazarak hesaplayınız.',
        points: 15,
        subject: 'Matematik',
        answerSpace: {
          type: 'squared',
          lineCount: 5,
          showBorder: true,
          boxHeightPx: 95,
          hintText: 'Çözüm Alanı:'
        },
        solutionNotes: 's(A ∪ B) = 14 + 18 - 6 = 26'
      },
      {
        id: 'q7',
        number: 7,
        text: 'P(x) = 2x³ - 4x² + 5x - 7 polinomu verilmektedir.\nBuna göre bu polinomun x - 2 ile bölümünden kalanı Kalan Teoremini kullanarak bulunuz.',
        premise: 'P(x) = 2x³ - 4x² + 5x - 7 polinomu verilmektedir.',
        stem: 'Buna göre bu polinomun x - 2 ile bölümünden kalanı Kalan Teoremini kullanarak bulunuz.',
        points: 15,
        subject: 'Matematik',
        answerSpace: {
          type: 'squared',
          lineCount: 5,
          showBorder: true,
          boxHeightPx: 95,
          hintText: 'Çözüm Alanı:'
        },
        solutionNotes: 'x - 2 = 0 => x = 2. Kalan = P(2) = 2(8) - 4(4) + 5(2) - 7 = 16 - 16 + 10 - 7 = 3.'
      },
      {
        id: 'q8',
        number: 8,
        text: 'Bir torbada 4 kırmızı, 5 beyaz ve 3 mavi bilye bulunmaktadır.\nTorbadan rastgele çekilen bir bilyenin beyaz olmama olasılığını hesaplayınız.',
        premise: 'Bir torbada 4 kırmızı, 5 beyaz ve 3 mavi bilye bulunmaktadır.',
        stem: 'Torbadan rastgele çekilen bir bilyenin beyaz olmama olasılığını hesaplayınız.',
        points: 10,
        subject: 'Matematik',
        answerSpace: {
          type: 'squared',
          lineCount: 5,
          showBorder: true,
          boxHeightPx: 95,
          hintText: 'Çözüm Alanı:'
        },
        solutionNotes: 'Toplam bilye = 12. Beyaz olmayan = 4 + 3 = 7. Olasılık = 7/12.'
      }
    ],
    evaluationTable: {
      enabled: true,
      showCommentBox: true,
      commentBoxLabel: 'Öğretmen Değerlendirmesi & Notu:'
    },
    signatures: {
      enabled: false,
      instructionsText: '1. Sınav süresi 40 dakikadır. 2. Cevaplarınızı ayrılan kutucuklara okunaklı yazınız. 3. İşlem basamakları puanlamaya dahildir. Başarılar dileriz.',
      teachers: [
        { name: 'Barış KIR', title: 'Sosyal Bilgiler Öğretmeni' },
        { name: 'Hamza ERDOĞAN', title: 'Zümre Başkanı' }
      ],
      showPrincipal: false,
      principalTitle: 'Okul Müdürü',
      principalName: 'Hakan ÇİÇEK'
    },
    layout: {
      layoutMode: 'two-column',
      fontFamily: 'serif',
      fontSize: 'sm',
      showColumnDivider: true,
      showPageNumbers: true,
      compactSpacing: true,
      showSolutions: false
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'edebiyat-9-klasik',
    title: '9. Sınıf Türk Dili ve Edebiyatı Klasik Yazılı Yoklama',
    header: {
      ministryTitle: '',
      district: 'İSTANBUL - KADIKÖY İLÇE MİLLÎ EĞİTİM MÜDÜRLÜĞÜ',
      schoolName: 'KADIKÖY ANADOLU LİSESİ',
      academicYear: '2024-2025 EĞİTİM VE ÖĞRETİM YILI',
      termExam: '1. DÖNEM 1. KLASİK YAZILI YOKLAMA',
      courseName: 'TÜRK DİLİ VE EDEBİYATI',
      gradeClass: '9 / D',
      examDate: '15.11.2024',
      durationMinutes: 40,
      examGroup: 'A GRUBU',
      scenario: '1. Senaryo',
      logoLeft: PRESET_LOGOS[0].dataUrl,
      logoRight: PRESET_LOGOS[2].dataUrl,
      showStudentInfoBox: true,
      showHeaderBorder: true
    },
    questions: [
      {
        id: 'eq1',
        number: 1,
        text: '"Sanatçı, toplumun aynası olduğu kadar geleceğe ışık tutan bir fenerdir." sözüyle anlatılmak isteneni kendi cümlelerinizle en az 4 cümle halinde açıklayınız.',
        points: 20,
        subject: 'Türk Dili ve Edebiyatı',
        answerSpace: {
          type: 'lined',
          lineCount: 6,
          showBorder: true,
          boxHeightPx: 120,
          hintText: 'Cevap Alanı:'
        },
        solutionNotes: 'Sanatçının hem mevcut toplumu yansıtma hem de topluma rehberlik etme rolü değerlendirilir.'
      },
      {
        id: 'eq2',
        number: 2,
        text: 'Aşağıdaki dizelerin kafiye (uyak) türünü, redifini ve kafiye örgüsünü bularak ilgili alana yazınız:\n"Gözlerin gözlerime değince\nFelaketim olurdu, ağlardım\nBeni sevmiyordun, bilirdim\nBir sevdiğin vardı, duyardım"',
        points: 20,
        subject: 'Türk Dili ve Edebiyatı',
        answerSpace: {
          type: 'lined',
          lineCount: 5,
          showBorder: true,
          boxHeightPx: 110,
          hintText: 'Cevap Alanı:'
        },
        solutionNotes: 'Kafiye ve redif tahlili beklenir.'
      },
      {
        id: 'eq3',
        number: 3,
        text: '"Okul bahçesinde toplanan öğrenciler büyük bir heyecanla sonuçları bekliyordu." cümlesini ögelerine ayırarak yazınız.',
        points: 20,
        subject: 'Türk Dili ve Edebiyatı',
        answerSpace: {
          type: 'lined',
          lineCount: 5,
          showBorder: true,
          boxHeightPx: 110,
          hintText: 'Cevap Alanı:'
        },
        solutionNotes: 'Özne, Zarf Tümleci, Belirtili Nesne, Yüklem.'
      },
      {
        id: 'eq4',
        number: 4,
        text: 'Edebiyatın güzel sanatlar içindeki yerini ve diğer bilim dallarıyla (özellikle tarih ve psikoloji) olan ilişkisini kısaca açıklayınız.',
        points: 20,
        subject: 'Türk Dili ve Edebiyatı',
        answerSpace: {
          type: 'lined',
          lineCount: 5,
          showBorder: true,
          boxHeightPx: 110,
          hintText: 'Cevap Alanı:'
        },
        solutionNotes: 'Edebiyat işitsel (fonetik) sanatlardandır. Tarihi olayları kurmaca olarak işler, insan ruhunu derinlemesine yansıtır.'
      },
      {
        id: 'eq5',
        number: 5,
        text: 'İletişimin temel ögelerini (Gönderici, Alıcı, İleti, Kanal, Dönüt, Bağlam) birer cümleyle tanımlayınız.',
        points: 20,
        subject: 'Türk Dili ve Edebiyatı',
        answerSpace: {
          type: 'lined',
          lineCount: 5,
          showBorder: true,
          boxHeightPx: 110,
          hintText: 'Cevap Alanı:'
        },
        solutionNotes: 'İletişim ögelerinin doğru eşleşmesi.'
      }
    ],
    evaluationTable: {
      enabled: true,
      showCommentBox: true,
      commentBoxLabel: 'Öğretmen Değerlendirmesi & Yazım/Düzen Notu:'
    },
    signatures: {
      enabled: false,
      instructionsText: '1. Sınav süresi 40 dakikadır. 2. Yazım ve noktalama kurallarına uyunuz. 3. Karalama yapmayınız. Başarılar dileriz.',
      teachers: [
        { name: 'Emel ÇETİN', title: 'Türk Dili ve Ed. Öğretmeni' }
      ],
      showPrincipal: false,
      principalTitle: 'Okul Müdürü',
      principalName: 'Hakan ÇİÇEK'
    },
    layout: {
      layoutMode: 'two-column',
      fontFamily: 'serif',
      fontSize: 'sm',
      showColumnDivider: true,
      showPageNumbers: true,
      compactSpacing: true,
      showSolutions: false
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'a4-cift-nusha-fen',
    title: 'A4 İkiye Bölünen Hızlı Yazılı (2 Nüsha / Kağıt Tasarruflu)',
    header: {
      ministryTitle: '',
      district: 'İZMİR - KARŞIYAKA İLÇE MEM',
      schoolName: 'CUMHURİYET ORTAOKULU',
      academicYear: '2024-2025 EĞİTİM ÖĞRETİM YILI',
      termExam: 'FEN BİLİMLERİ 1. DÖNEM 2. YAZILI',
      courseName: 'FEN BİLİMLERİ',
      gradeClass: '8 / C',
      examDate: '28.11.2024',
      durationMinutes: 35,
      examGroup: 'A GRUBU',
      scenario: '1. Senaryo',
      logoLeft: PRESET_LOGOS[0].dataUrl,
      logoRight: '',
      showStudentInfoBox: true,
      showHeaderBorder: true
    },
    questions: [
      {
        id: 'fn1',
        number: 1,
        text: 'DNA\'nın kendini eşlemesi sırasında gerçekleşen temel olayları 3 madde halinde sırasıyla yazınız.',
        points: 25,
        subject: 'Fen Bilimleri',
        answerSpace: {
          type: 'lined',
          lineCount: 4,
          showBorder: true,
          boxHeightPx: 80,
          hintText: 'Cevap:'
        },
        solutionNotes: '1. Fermuar gibi açılır. 2. Sitoplazmadaki serbest nükleotidler çekirdeğe girer. 3. Uygun nükleotidlerle eşleşir.'
      },
      {
        id: 'fn2',
        number: 2,
        text: 'Fiziksel sindirim ile kimyasal sindirim arasındaki 2 temel farkı yazınız.',
        points: 25,
        subject: 'Fen Bilimleri',
        answerSpace: {
          type: 'lined',
          lineCount: 4,
          showBorder: true,
          boxHeightPx: 80,
          hintText: 'Cevap:'
        },
        solutionNotes: 'Fiziksel sindirimde enzim kullanılmaz, besinin kimyasal yapısı değişmez. Kimyasalda enzim kullanılır ve yapı taşlarına ayrılır.'
      },
      {
        id: 'fn3',
        number: 3,
        text: 'Katı basıncının bağlı olduğu faktörleri yazarak bu faktörlerin basınca etkisini açıklayınız.',
        points: 25,
        subject: 'Fen Bilimleri',
        answerSpace: {
          type: 'lined',
          lineCount: 4,
          showBorder: true,
          boxHeightPx: 80,
          hintText: 'Cevap:'
        },
        solutionNotes: 'Ağırlık ile doğru orantılıdır, temas yüzey alanı ile ters orantılıdır.'
      },
      {
        id: 'fn4',
        number: 4,
        text: 'Asit yağmurlarının çevreye ve tarihi eserlere verdiği zararları 2 örnekle açıklayınız.',
        points: 25,
        subject: 'Fen Bilimleri',
        answerSpace: {
          type: 'lined',
          lineCount: 4,
          showBorder: true,
          boxHeightPx: 80,
          hintText: 'Cevap:'
        },
        solutionNotes: 'Toprağın ve suların pH dengesini bozar, mermer ve tarihi heykelleri aşındırır.'
      }
    ],
    evaluationTable: {
      enabled: true,
      showCommentBox: false,
      commentBoxLabel: 'Not:'
    },
    signatures: {
      enabled: false,
      instructionsText: 'Başarılar dileriz. Süre 35 dakikadır.',
      teachers: [{ name: 'Ayşe GÜL', title: 'Fen Bilimleri Öğretmeni' }],
      showPrincipal: false,
      principalTitle: 'Okul Müdürü',
      principalName: 'Hakan ÇİÇEK'
    },
    layout: {
      layoutMode: 'two-exams-a4', // 2 exams printed side-by-side on 1 landscape A4 sheet!
      fontFamily: 'serif',
      fontSize: 'xs',
      showColumnDivider: true,
      showPageNumbers: false,
      compactSpacing: true,
      showSolutions: false
    },
    updatedAt: new Date().toISOString()
  }
];
