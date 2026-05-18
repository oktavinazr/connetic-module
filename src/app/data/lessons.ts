// Lesson content data structure
export interface Stage {
  type: 'constructivism' | 'inquiry' | 'questioning' | 'learning-community' | 'modeling' | 'reflection' | 'authentic-assessment';
  title: string;
  activityNumber?: number;
  description: string;
  objectiveCode?: string;
  objectiveDescription?: string;
  activityGuide?: string[];
  logicalThinkingIndicators?: string[];
  facilitatorNotes?: string[];
  atpAbcd?: {
    audience: string;
    behavior: string;
    condition: string;
    degree: string;
  };
  conclusionPrompt?: string;                       // ATP-aligned conclusion prompt

  // ── CONSTRUCTIVISM ──────────────────────────────────────────────────
  apersepsi?: string;                              // Experience-based opening scenario
  question?: string;
  options?: Array<{ id: string; text: string }>;   // Multiple-choice options
  correctAnswer?: string;                          // Correct option id
  feedback?: { correct: string; incorrect: string };
  videoUrl?: string;                               // YouTube URL or local path

  // ── INQUIRY ─────────────────────────────────────────────────────
  explorationSections?: Array<{                    // Clickable accordion sections
    id: string;
    title: string;
    content: string;
    example?: string;
  }>;
  groups?: Array<{                                 // Drop-zone categories for grouping
    id: string;
    label: string;
    colorClass: 'blue' | 'green' | 'purple' | 'amber' | 'pink';
  }>;
  groupItems?: Array<{                             // Items to drag into groups
    id: string;
    text: string;
    correctGroup: string;
  }>;

  // ── QUESTIONING ─────────────────────────────────────────────────
  teacherImage?: string;                           // URL or path to teacher avatar
  teacherQuestion?: string;                        // Question from teacher representation
  questionBank?: Array<{                           // Questions student can "ask"
    id: string;
    text: string;
    response: string;                              // Automatic response from media
  }>;
  scenario?: string;                               // Contextual situation for "why" question
  whyQuestion?: string;                            // The "why" question
  hint?: string;                                   // Optional hint text
  reasonOptions?: Array<{                          // Reason-selection options
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }>;

  // ── LEARNING COMMUNITY ──────────────────────────────────────────
  matchingPairs?: Array<{ left: string; right: string }>;
  caseScenario?: {
    id?: string;
    title: string;
    description?: string;
    scenario?: string;
    question: string;
    options: Array<{ id: string; text: string; description?: string; isCorrect?: boolean; feedback?: string; logic?: string }>;
  };
  peerAnswers?: Array<{ name: string; role: string; answer: string; score?: number }>; // score for sorting
  groupActivity?: { 
    groupNames: string[];
    discussionPrompt?: string;
  };
  tcpInteractiveLabels?: Array<{ layer: string; pdu: string }>;
  layers5?: Array<{ id: string; name: string; pdu: string; color: string; desc: string }>;
  encapsulationCase?: {
    id: string;
    title: string;
    concept?: string;
    scenario: string;
    question: string;
    options: Array<{ id: string; text: string; description?: string; logic?: string }>;
    peerArguments?: Array<{ name: string; text: string; votes: number; isUser?: boolean; choiceText?: string }>;
  };
  decapsulationCase?: {
    id: string;
    title: string;
    concept?: string;
    scenario: string;
    question: string;
    options: Array<{ id: string; text: string; description?: string; logic?: string }>;
    peerArguments?: Array<{ name: string; text: string; votes: number; isUser?: boolean; choiceText?: string }>;
  };

  // ── MODELING ────────────────────────────────────────────────────
  modelingSteps?: Array<{                          // Interactive step-by-step
    id: string;
    type: 'example' | 'practice';
    title: string;
    content: string;
    interactiveAction?: string;                    // Instruction for simulation
    simulationState?: any;                         // Target state for practice
  }>;
  practiceInstructions?: {
    forTeacher: string[];
    forStudent: string[];
  };
  steps?: Array<{                                  // Step-by-step navigation
    id: string;
    title: string;
    description: string;
    visual: string;                                // emoji or short icon label
  }>;
  items?: Array<{ id: string; text: string; order: number }>; // Drag-drop ordering

  // ── REFLECTION ──────────────────────────────────────────────────
  essayReflection?: {
    materialSummaryPrompt: string;
    easyPartPrompt: string;
    hardPartPrompt: string;
  };
  reflectionPrompts?: string[];                     // Ordered reflection prompt labels
  initialKnowledgeContext?: string;                // Reference to opening answer
  reflectionQuestion?: string;                     // Single short-answer question
  selfEvaluationCriteria?: Array<{ id: string; label: string }>;

  // ── CONSTRUCTIVISM (extended) ────────────────────────────────────────────
  storyScramble?: {
    instruction: string;
    fragments: Array<{ id: string; text: string; order: number }>;
    successMessage: string;
    reflection?: string;
    reflectionAnswer?: string;
  };
  analogySortGroups?: Array<{ id: string; label: string; colorClass: 'blue' | 'green' | 'purple' | 'amber' }>;
  analogySortItems?: Array<{ id: string; text: string; correctGroup: string; correctOrder?: number; courierAnalogy?: string }>;
  constructivismEssay1?: string;
  constructivismEssay2?: string;

  // ── INQUIRY (extended) ──────────────────────────────────────────────────
  flowItems?: Array<{
    id: string;
    text: string;
    correctOrder: number;
    description?: string;
    colorClass?: 'blue' | 'green' | 'purple' | 'amber' | 'pink' | 'indigo';
  }>;
  flowInstruction?: string;
  labelingSlots?: Array<{ id: string; label: string; description: string }>;
  labelingLabels?: Array<{ id: string; text: string; correctSlot: string }>;
  inquiryReflection1?: string;
  inquiryReflection2?: string;
  material?: {
    title: string;
    content: string[];
    examples?: string[];
    osiLayers?: Array<{ name: string; number: number; mapsTo: string; desc: string }>;
  };

  // ── QUESTIONING (extended) ──────────────────────────────────────────────
  problemVisual?: {
    icon: string;
    title: string;
    description: string;
    problemType: 'corruption' | 'packet-loss' | 'collision' | 'delay';
  };

  // ── LEARNING COMMUNITY (extended) ─────────────────────────────────────────
  peerVotingScenario?: {
    context: string;
    question: string;
    methods: Array<{ id: string; title: string; description: string; votes?: number; pros: string; cons: string }>;
    correctMethodId: string;
  };
  peerComments?: Array<{ name: string; avatar: string; comment: string; votedFor: string }>;
  caseComparisonData?: {
    title: string;
    process: Array<{ id: string; step: string; correctOrder: number }>;
    peerAnalyses: Array<{ name: string; analysis: string; isCorrect: boolean }>;
  };
  encapsulationCaseData?: {
    title: string;
    process: Array<{ id: string; step: string; correctOrder: number }>;
    groupAnswers: Array<{ name: string; analysis: string; isCorrect: boolean }>;
  };

  // ── REFLECTION (extended) ──────────────────────────────────────────────
  conceptMapNodes?: Array<{ id: string; label: string; description?: string; colorClass?: string }>;
  conceptMapConnections?: Array<{ from: string; to: string; label: string; options: string[] }>;

  // ── AUTHENTIC ASSESSMENT ────────────────────────────────────────────────
  branchingScenario?: {
    context: string;
    initialQuestion: string;
    focusAreas?: string[];
    choices: Array<{
      id: string;
      text: string;
      isOptimal: boolean;
      consequence: string;
      followUpQuestion?: string;
      followUpChoices?: Array<{
        id: string;
        text: string;
        isCorrect: boolean;
        explanation: string;
      }>;
    }>;
    finalEvaluation: string;
  };
}

export interface TestQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Lesson {
  id: string;
  title: string;
  topic: string;
  description: string;
  objectives: string[];
  initialCompetencies: string[];
  materials?: string[];
  pretest: {
    questions: TestQuestion[];
  };
  stages: Stage[];
  posttest: {
    questions: TestQuestion[];
  };
}

export type StageType = Stage['type'];

export interface StageLearningObjective {
  code: string;
  description: string;
  atpAbcd?: {
    audience: string;
    behavior: string;
    condition: string;
    degree: string;
  };
}

export const stageDisplayTitles: Record<StageType, string> = {
  constructivism: 'Constructivism',
  inquiry: 'Inquiry',
  questioning: 'Questioning',
  'learning-community': 'Learning Community',
  modeling: 'Modeling',
  reflection: 'Reflection',
  'authentic-assessment': 'Authentic Assessment',
};

export function getStageDisplayTitle(stageType: StageType) {
  return stageDisplayTitles[stageType];
}

export const lessonMainObjectives: Record<string, string> = {
  '1': 'Pada pertemuan ini, peserta didik mempelajari konsep dasar TCP, fungsi utama, dan perannya dalam jaringan melalui rangkaian aktivitas CTL interaktif.',
  '2': 'Pada pertemuan ini, peserta didik mempelajari mekanisme kerja TCP secara mendalam termasuk three-way handshake dan flow control.',
  '3': 'Pada pertemuan ini, peserta didik mempelajari struktur IPv4, pengelompokan kelas alamat, dan dasar pengalamatan jaringan.',
  '4': 'Pada pertemuan ini, peserta didik mempelajari struktur IPv6, jenis alamat, fitur unggulan, serta mekanisme transisi dari IPv4 ke IPv6.',
};

export const stageLearningObjectivesByLesson: Record<string, Partial<Record<StageType, StageLearningObjective[]>>> = {
  '1': {
    constructivism: [
      {
        code: 'X.TCP.1',
        description: 'Mampu mendefinisikan konsep dasar TCP/IP sebagai fondasi komunikasi jaringan komputer',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu mendefinisikan konsep dasar TCP/IP sebagai fondasi komunikasi jaringan komputer',
          condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif pada CONNETIC Module',
          degree: 'dengan tepat',
        },
      },
    ],
    inquiry: [
      {
        code: 'X.TCP.2',
        description: 'Mampu menguraikan susunan lapisan model TCP/IP berdasarkan perbandingan dengan model OSI',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menguraikan susunan lapisan model TCP/IP berdasarkan perbandingan dengan model OSI',
          condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
          degree: 'secara runtut',
        },
      },
    ],
    questioning: [
      {
        code: 'X.TCP.3',
        description: 'Mampu membedakan fungsi setiap lapisan model TCP/IP dalam proses komunikasi jaringan',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu membedakan fungsi setiap lapisan model TCP/IP dalam proses komunikasi jaringan',
          condition: 'melalui aktivitas questioning berupa tanya jawab dua arah pada CONNETIC Module',
          degree: 'dengan logis',
        },
      },
    ],
    'learning-community': [
      {
        code: 'X.TCP.4',
        description: 'Mampu menerapkan proses enkapsulasi sebagai pengirim',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menerapkan proses enkapsulasi sebagai pengirim',
          condition: 'melalui aktivitas learning community berupa papan kolaborasi studi kasus pada CONNETIC Module',
          degree: 'secara logis',
        },
      },
      {
        code: 'X.TCP.5',
        description: 'Mampu menerapkan proses dekapsulasi sebagai penerima',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menerapkan proses dekapsulasi sebagai penerima',
          condition: 'melalui aktivitas learning community berupa papan kolaborasi studi kasus pada CONNETIC Module',
          degree: 'secara logis',
        },
      },
    ],
    modeling: [
      {
        code: 'X.TCP.6',
        description: 'Mampu mensimulasikan alur transmisi data dari pengirim ke penerima melalui seluruh lapisan TCP/IP',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu mensimulasikan alur transmisi data dari pengirim ke penerima melalui seluruh lapisan TCP/IP',
          condition: 'melalui aktivitas modeling berupa simulasi step-by-step pada CONNETIC Module',
          degree: 'secara sistematis',
        },
      },
    ],
    reflection: [
      {
        code: 'X.TCP.7',
        description: 'Mampu menyimpulkan model TCP/IP sebagai kerangka komunikasi jaringan yang terstruktur',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menyimpulkan model TCP/IP sebagai kerangka komunikasi jaringan yang terstruktur',
          condition: 'melalui aktivitas reflection berupa konstruksi rekap materi pada CONNETIC Module',
          degree: 'secara tepat',
        },
      },
    ],
    'authentic-assessment': [
      {
        code: 'X.TCP.8',
        description: 'Mampu menganalisis skenario proses transmisi data di setiap lapisan TCP/IP',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menganalisis skenario proses transmisi data di setiap lapisan TCP/IP',
          condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
          degree: 'secara logis',
        },
      },
    ],
  },
  '2': {
    constructivism: [
      {
        code: 'X.TCP.9',
        description: 'Mampu mengidentifikasi TCP Header beserta fungsinya pada protokol TCP',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu mengidentifikasi TCP Header beserta fungsinya pada protokol TCP',
          condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif pada CONNETIC Module',
          degree: 'dengan tepat',
        },
      },
    ],
    inquiry: [
      {
        code: 'X.TCP.10',
        description: 'Mampu menguraikan mekanisme TCP Sequence Number dalam memastikan urutan pengiriman',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menguraikan mekanisme TCP Sequence Number dalam memastikan urutan pengiriman',
          condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
          degree: 'secara runtut',
        },
      },
    ],
    questioning: [
      {
        code: 'X.TCP.11',
        description: 'Mampu membedakan kondisi pengiriman data normal dengan kondisi yang memerlukan error recovery pada TCP berdasarkan nilai Sequence Number',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu membedakan kondisi pengiriman data normal dengan kondisi yang memerlukan error recovery pada TCP berdasarkan nilai Sequence Number',
          condition: 'melalui aktivitas questioning berupa tanya jawab dua arah pada CONNETIC Module',
          degree: 'secara tepat',
        },
      },
    ],
    'learning-community': [
      {
        code: 'X.TCP.12',
        description: 'Mampu menerapkan proses TCP Three-Way Handshake untuk menentukan nilai SYN, SYN-ACK, dan ACK pada setiap langkah pembentukan koneksi',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menerapkan proses TCP Three-Way Handshake untuk menentukan nilai SYN, SYN-ACK, dan ACK pada setiap langkah pembentukan koneksi',
          condition: 'melalui aktivitas learning community berupa papan kolaboratif studi kasus pada CONNETIC Module',
          degree: 'secara logis',
        },
      },
    ],
    modeling: [
      {
        code: 'X.TCP.13',
        description: 'Mampu mensimulasikan mekanisme kerja TCP dari pembentukan koneksi hingga pengiriman data',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu mensimulasikan mekanisme kerja TCP dari pembentukan koneksi hingga pengiriman data',
          condition: 'melalui aktivitas modeling berupa simulasi step-by-step pada CONNETIC Module',
          degree: 'secara sistematis',
        },
      },
    ],
    reflection: [
      {
        code: 'X.TCP.14',
        description: 'Mampu menyimpulkan mekanisme keandalan TCP sebagai satu kesatuan yang utuh',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menyimpulkan mekanisme keandalan TCP sebagai satu kesatuan yang utuh',
          condition: 'melalui aktivitas reflection berupa konstruksi rekap materi pada CONNETIC Module',
          degree: 'secara tepat',
        },
      },
    ],
    'authentic-assessment': [
      {
        code: 'X.TCP.15',
        description: 'Mampu menganalisis skenario komunikasi TCP pada setiap langkah koneksi',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menganalisis skenario komunikasi TCP pada setiap langkah koneksi',
          condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
          degree: 'secara logis',
        },
      },
    ],
  },
  '3': {
    constructivism: [
      {
        code: 'X.IP.1',
        description: 'Mampu menjelaskan peran Internet Protocol lapisan Network dalam protokol TCP/IP',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menjelaskan peran Internet Protocol lapisan Network dalam protokol TCP/IP',
          condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif pada CONNETIC Module',
          degree: 'dengan tepat',
        },
      },
    ],
    inquiry: [
      {
        code: 'X.IP.2',
        description: 'Mampu menguraikan komponen IP Header beserta fungsinya',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menguraikan komponen IP Header beserta fungsinya',
          condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
          degree: 'secara runtut',
        },
      },
    ],
    questioning: [
      {
        code: 'X.IP.3',
        description: 'Mampu membedakan struktur alamat IPv4 berdasarkan format penulisannya',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu membedakan struktur alamat IPv4 berdasarkan format penulisannya',
          condition: 'melalui aktivitas questioning berupa tanya jawab dua arah pada CONNETIC Module',
          degree: 'secara tepat',
        },
      },
    ],
    'learning-community': [
      {
        code: 'X.IP.4',
        description: 'Mampu menerapkan pengetahuan kelas IPv4 beserta rentang alamat Private & Public berdasarkan nilai oktet pertamanya',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menerapkan pengetahuan kelas IPv4 beserta rentang alamat Private & Public berdasarkan nilai oktet pertamanya',
          condition: 'melalui aktivitas learning community berupa papan kolaborasi studi kasus pada CONNETIC Module',
          degree: 'secara logis',
        },
      },
      {
        code: 'X.IP.5',
        description: 'Mampu menerapkan konsep range host IPv4 untuk menghitung alamat-alamat yang tersedia dari sebuah jaringan',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menerapkan konsep range host IPv4 untuk menghitung alamat-alamat yang tersedia dari sebuah jaringan',
          condition: 'melalui aktivitas learning community berupa papan kolaborasi studi kasus pada CONNETIC Module',
          degree: 'secara logis',
        },
      },
    ],
    modeling: [
      {
        code: 'X.IP.6',
        description: 'Mampu mensimulasikan proses konversi alamat IPv4 dari format desimal ke biner',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu mensimulasikan proses konversi alamat IPv4 dari format desimal ke biner',
          condition: 'melalui aktivitas modeling berupa simulasi step-by-step pada CONNETIC Module',
          degree: 'secara sistematis',
        },
      },
    ],
    reflection: [
      {
        code: 'X.IP.7',
        description: 'Mampu menyimpulkan sistem pengalamatan IPv4 sebagai fondasi konfigurasi jaringan yang terstruktur',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menyimpulkan sistem pengalamatan IPv4 sebagai fondasi konfigurasi jaringan yang terstruktur',
          condition: 'melalui aktivitas reflection berupa konstruksi rekap materi pada CONNETIC Module',
          degree: 'secara tepat',
        },
      },
    ],
    'authentic-assessment': [
      {
        code: 'X.IP.8',
        description: 'Mampu menganalisis skenario perancangan pengalamatan IPv4 Private & Public pada arsitektur TCP/IP',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menganalisis skenario perancangan pengalamatan IPv4 Private & Public pada arsitektur TCP/IP',
          condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
          degree: 'secara logis',
        },
      },
    ],
  },
  '4': {
    constructivism: [
      {
        code: 'X.IP.9',
        description: 'Mampu menjelaskan konsep dasar IPv6 sebagai solusi keterbatasan ruang alamat IPv4',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menjelaskan konsep dasar IPv6 sebagai solusi keterbatasan ruang alamat IPv4',
          condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif pada CONNETIC Module',
          degree: 'dengan tepat',
        },
      },
    ],
    inquiry: [
      {
        code: 'X.IP.10',
        description: 'Mampu menerapkan tahapan standar EUI-64 untuk membentuk IPv6 Link Local Address dari alamat MAC secara berurutan',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menerapkan tahapan standar EUI-64 untuk membentuk IPv6 Link Local Address dari alamat MAC secara berurutan',
          condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
          degree: 'secara runtut',
        },
      },
    ],
    questioning: [
      {
        code: 'X.IP.11',
        description: 'Mampu menerapkan aturan penyederhanaan IPv6 pada skenario yang diberikan',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menerapkan aturan penyederhanaan IPv6 pada skenario yang diberikan',
          condition: 'melalui aktivitas questioning berupa tanya jawab dua arah pada CONNETIC Module',
          degree: 'secara tepat',
        },
      },
    ],
    'learning-community': [
      {
        code: 'X.IP.12',
        description: 'Mampu menganalisis setiap langkah proses EUI-64 untuk menentukan kebenaran hasil konversi alamat MAC menjadi IPv6 Link Local Address',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menganalisis setiap langkah proses EUI-64 untuk menentukan kebenaran hasil konversi alamat MAC menjadi IPv6 Link Local Address',
          condition: 'melalui aktivitas learning community berupa papan kolaborasi studi kasus pada CONNETIC Module',
          degree: 'secara logis',
        },
      },
    ],
    modeling: [
      {
        code: 'X.IP.13',
        description: 'Mampu mensimulasikan proses perencanaan pengalamatan IPv6 Gateway (Global Unicast) pada interface router',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu mensimulasikan proses perencanaan pengalamatan IPv6 Gateway (Global Unicast) pada interface router',
          condition: 'melalui aktivitas modeling berupa simulasi step-by-step pada CONNETIC Module',
          degree: 'secara sistematis',
        },
      },
    ],
    reflection: [
      {
        code: 'X.IP.14',
        description: 'Mampu menyimpulkan perbedaan karakteristik antara pengalamatan IPv4 dan IPv6 serta kesesuaian penggunaannya dalam konteks jaringan modern',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu menyimpulkan perbedaan karakteristik antara pengalamatan IPv4 dan IPv6 serta kesesuaian penggunaannya dalam konteks jaringan modern',
          condition: 'melalui aktivitas reflection berupa konstruksi rekap materi pada CONNETIC Module',
          degree: 'secara tepat',
        },
      },
    ],
    'authentic-assessment': [
      {
        code: 'X.IP.15',
        description: 'Mampu mengevaluasi keterkaitan TCP dan IP dalam arsitektur model TCP/IP saat proses komunikasi jaringan',
        atpAbcd: {
          audience: 'Peserta didik',
          behavior: 'mampu mengevaluasi keterkaitan TCP dan IP dalam arsitektur model TCP/IP saat proses komunikasi jaringan',
          condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
          degree: 'secara logis',
        },
      },
    ],
  },
};

export const globalPretest = {
  title: 'Pre-Test Umum',
  description: 'Tes ini mengukur pemahaman awal Anda tentang jaringan komputer secara keseluruhan',
  questions: [
    // 1 (Dokumen No. 31)
    {
      question: 'Perhatikan pernyataan berikut tentang TCP/IP. 1. TCP/IP adalah kumpulan protokol komunikasi yang menjadi standar di internet maupun jaringan lokal. 2. IP berperan memecah data menjadi segmen-segmen kecil dan memastikan urutan pengirimannya ke penerima. 3. TCP berperan menjamin keandalan pengiriman data melalui konfirmasi penerimaan dan pengiriman ulang jika gagal. 4. TCP/IP adalah protokol yang hanya aktif saat perangkat terhubung ke internet publik, bukan jaringan lokal. Pernyataan yang BENAR tentang TCP/IP adalah ...',
      options: ['1 dan 2', '2 dan 3', '1 dan 3', '2 dan 4', '3 dan 4'],
      correctAnswer: 2,
    },
    // 2 (Dokumen No. 32)
    {
      question: 'Model TCP/IP menyederhanakan 7 lapisan OSI menjadi 5 lapisan dengan cara menggabungkan lapisan yang fungsinya berdekatan. Lapisan Application pada model TCP/IP menggabungkan lapisan OSI ...',
      options: ['Physical dan Data Link', 'Network dan Transport', 'Transport dan Session', 'Session, Presentation, dan Application', 'Data Link dan Network'],
      correctAnswer: 3,
    },
    // 3 (Dokumen No. 33)
    {
      question: 'Ketika data melewati lapisan-lapisan TCP/IP, setiap lapisan menjalankan fungsinya masing-masing. Pasangan lapisan dan fungsi yang TIDAK TEPAT adalah ...',
      options: [
        'Data Link - mengelola pengiriman frame melalui media fisik menggunakan MAC Address',
        'Network - memberikan alamat IP dan menentukan rute pengiriman paket antar jaringan',
        'Transport - memecah data menjadi segmen dan memastikan keutuhan pengirimannya ke penerima',
        'Application - mengubah data digital menjadi sinyal listrik untuk dikirim melalui kabel',
        'Transport - mengelola nomor port agar data sampai ke aplikasi yang tepat di penerima'
      ],
      correctAnswer: 3,
    },
    // 4 (Dokumen No. 4)
    {
      question: 'Perhatikan studi kasus berikut: Seorang teknisi jaringan mendapati bahwa sebuah data pesan telah berhasil dipecah menjadi bagian-bagian kecil (Segmen) di komputer pengirim. Namun, data tersebut berhenti di sana dan tidak bisa dikirimkan keluar menuju jaringan lain karena belum memiliki informasi mengenai alamat tujuan global yang dibutuhkan oleh perangkat Router. Berdasarkan kasus tersebut, manakah penerapan proses enkapsulasi yang tepat untuk memecahkan masalah tersebut?',
      options: [
        'Mengubah Segmen secara langsung menjadi sinyal bit agar data bisa segera merambat di kabel jaringan, karena kecepatan pengiriman adalah prioritas utama agar data tidak hilang.',
        'Menggabungkan kembali semua Segmen menjadi satu data utuh tanpa label tambahan, agar beban kerja Router menjadi lebih ringan karena tidak perlu membaca banyak identitas pada setiap paket data.',
        'Menambahkan alamat fisik (MAC Address) langsung pada Segmen agar data berubah menjadi Frame, karena setiap perangkat di jaringan hanya bisa saling mengenali melalui alamat fisik perangkat kerasnya.',
        'Kembali ke tahap awal untuk mengecek format file aplikasi, karena kegagalan pengiriman biasanya disebabkan oleh ketidaksesuaian antara aplikasi pengirim dan aplikasi penerima.',
        'Membungkus Segmen ke dalam Paket dengan menambahkan Network Header, karena informasi ini memberikan alamat tujuan logis yang dibutuhkan Router untuk mengarahkan data ke jaringan yang tepat.'
      ],
      correctAnswer: 4,
    },
    // 5 (Dokumen No. 5)
    {
      question: 'Sebuah data Frame diterima oleh komputer penerima melalui jaringan. Komputer tersebut harus memproses data dari bawah ke atas hingga sampai ke lapisan Aplikasi (Bottom-Up Approach). Seorang teknisi menduga bahwa data gagal diproses karena Network Header tidak dilepas dengan benar sehingga lapisan Transport tidak bisa membaca isi Segmen. Berdasarkan kasus tersebut, manakah penerapan proses dekapsulasi yang tepat pada lapisan Network?',
      options: [
        'Melewati pemrosesan di lapisan Network dan langsung membuka data di lapisan Transport agar lebih efisien karena Network Header tidak penting untuk penerima.',
        'Melepas Data Link Header terlebih dahulu di lapisan Data Link untuk mendapatkan Paket, kemudian melepas Network Header di lapisan Network untuk mendapatkan Segmen.',
        'Melepas seluruh header sekaligus di lapisan Transport karena lapisan ini adalah lapisan terpenting yang mengontrol semua proses dekapsulasi.',
        'Menggabungkan kembali semua header yang ada menjadi satu paket besar sebelum diteruskan ke lapisan Application agar data lebih mudah dibaca.',
        'Mengembalikan data ke komputer pengirim karena setiap data yang gagal dilepas header-nya harus diverifikasi ulang oleh pengirim sebelum bisa diproses.'
      ],
      correctAnswer: 1,
    },
    // 6 (Dokumen No. 6)
    {
      question: 'Perhatikan langkah-langkah transmisi data dari sisi pengirim berikut ini (diurutkan secara acak): 1. Protokol HTTP menyiapkan data permintaan halaman web. 2. Data dipecah menjadi Segment dan diberi nomor urut. 3. Data dikemas menjadi Packet dengan penambahan IP Header. 4. Data dikemas menjadi Frame dengan penambahan MAC Header. 5. Data diubah menjadi bit/sinyal dan dikirimkan melalui media transmisi kabel jaringan. Urutan alur transmisi data dari sisi pengirim yang benar (dari lapisan teratas hingga lapisan terbawah) adalah ...',
      options: [
        'Application - Transport - Network - Data Link - Physical',
        'Application - Network - Transport - Data Link - Physical',
        'Physical - Data Link - Network - Transport - Application',
        'Application - Transport - Data Link - Network - Physical',
        'Data Link - Network - Transport - Physical - Application'
      ],
      correctAnswer: 0,
    },
    // 7 (Dokumen No. 37)
    {
      question: 'Pak Budi menguji jaringan dengan tiga percobaan: 1. Kabel dicabut → seluruh komunikasi data terputus total. 2. IP Address dihapus → komunikasi antar jaringan terhenti meski kabel terpasang. 3. TCP dimatikan → pengiriman file ukuran besar gagal meski kabel dan IP aktif. Kesimpulan yang tepat adalah ...',
      options: [
        'Lapisan Network merupakan lapisan paling kritis karena tanpa adanya IP Address maka tidak akan ada proses komunikasi yang dapat berjalan.',
        'Setiap lapisan protokol bekerja secara independen sehingga kegagalan pada satu lapisan tidak akan mengganggu fungsi dari lapisan lainnya.',
        'Lapisan fisik sama sekali tidak penting untuk dikonfigurasi selama pengaturan pada IP Address dan protokol TCP sudah berfungsi dengan baik.',
        'Model TCP/IP bersifat hierarkis dan saling bergantung sehingga kegagalan di satu lapisan akan mengganggu keseluruhan proses komunikasi data.',
        'Hanya lapisan Transport dan Network yang bersifat kritis dalam jaringan sedangkan pengaturan pada lapisan fisik hanyalah pilihan opsional.'
      ],
      correctAnswer: 3,
    },
    // 8 (Dokumen No. 38)
    {
      question: 'Ibu Sari memeriksa komputer yang tidak bisa mengakses server ujian dan menemukan tiga fakta berikut: 1. Kabel terpasang dengan benar dan lampu indikator pada perangkat switch menyala hijau. 2. Pengujian perintah ping ke alamat IP server target mendapatkan respons Reply. 3. Koneksi TCP ke port 443 mengalami kegagalan dengan keterangan \'Connection Refused\'. Kesimpulan analisis yang paling tepat berdasarkan pemeriksaan tersebut adalah ...',
      options: [
        'Masalah terjadi di lapisan Physical karena lampu hijau pada perangkat switch belum menjamin aliran data digital dapat mengalir dengan lancar.',
        'Masalah terjadi di lapisan Network karena nilai TTL pada respons Reply mengindikasikan adanya rute perjalanan paket data yang tidak optimal.',
        'Tidak ada masalah pada sistem jaringan karena status Connection Refused merupakan kondisi normal yang terjadi saat server sedang sangat sibuk.',
        'Masalah terjadi di lapisan Transport atau sisi server karena koneksi TCP ke port 443 ditolak meskipun fungsi lapisan bawahnya berjalan normal.',
        'Masalah terjadi di seluruh lapisan model protokol karena kegagalan akses aplikasi web pasti bersumber dari kerusakan total di setiap tingkatan.'
      ],
      correctAnswer: 3,
    },
    // 9 (Dokumen No. 9)
    {
      question: 'Perhatikan komponen-komponen pada TCP Header berikut: Source Port, Destination Port, Sequence Number, Acknowledgment Number, Checksum. Komponen yang berfungsi untuk memastikan bahwa data yang diterima tidak mengalami kerusakan atau korupsi selama proses pengiriman adalah ...',
      options: ['Source Port', 'Checksum', 'Sequence Number', 'Destination Port', 'Acknowledgment Number'],
      correctAnswer: 1,
    },
    // 10 (Dokumen No. 10)
    {
      question: 'Sebuah pesan teks berukuran besar dikirimkan melalui protokol TCP. Data tersebut dipecah menjadi 4 segmen dengan Sequence Number berturut-turut: 1, 501, 1001, dan 1501. Jika setiap segmen berisi 500 byte, mekanisme TCP Sequence Number memastikan bahwa ...',
      options: [
        'Setiap segmen dikirimkan sekaligus dalam satu waktu tanpa perlu memperhatikan urutan kedatangannya di penerima.',
        'Penerima dapat mendeteksi apabila ada segmen yang hilang dan meminta pengiriman ulang segmen tersebut secara spesifik.',
        'Pengirim tidak perlu menerima konfirmasi (ACK) dari penerima karena Sequence Number sudah menjamin urutan data.',
        'Setiap segmen memiliki alamat tujuan yang berbeda sehingga data dapat disebarkan ke banyak penerima sekaligus.',
        'Data selalu tiba di penerima dalam urutan yang sama persis dengan urutan pengirimannya tanpa kemungkinan tertukar.'
      ],
      correctAnswer: 1,
    },
    // 11 (Dokumen No. 11)
    {
      question: 'Dalam komunikasi TCP, penerima mengamati nilai Sequence Number yang diterimanya. Kondisi 1: Penerima menerima segmen dengan SEQ=1, SEQ=501, SEQ=1001, SEQ=1501 secara berurutan. Kondisi 2: Penerima menerima segmen dengan SEQ=1, SEQ=501, kemudian tiba-tiba SEQ=1501 tanpa SEQ=1001. Perbedaan kedua kondisi tersebut menunjukkan bahwa ...',
      options: [
        'Kondisi 1 dan Kondisi 2 tidak berbeda karena TCP akan menyusun ulang data secara otomatis tanpa perlu pengiriman ulang.',
        'Kondisi 1 menunjukkan pengiriman normal, sedangkan Kondisi 2 menunjukkan jalur jaringan berbeda yang digunakan tiap segmen.',
        'Kondisi 1 merupakan kondisi pengiriman data normal, sementara Kondisi 2 merupakan kondisi di mana terjadi kehilangan segmen (SEQ=1001) yang memerlukan proses error recovery.',
        'Kondisi 2 lebih efisien karena melewatkan satu segmen sehingga data lebih cepat sampai ke tujuan.',
        'Kondisi 1 terjadi karena koneksi TCP gagal, sedangkan Kondisi 2 adalah kondisi TCP yang berjalan normal.'
      ],
      correctAnswer: 2,
    },
    // 12 (Dokumen No. 12)
    {
      question: 'Komputer A ingin membangun koneksi TCP dengan Server B. Komputer A mengirimkan paket pertama dengan flag SYN=1, ACK=0, SEQ=100. Server B merespons dengan paket kedua. Kemudian Komputer A mengirimkan paket ketiga untuk menyelesaikan handshake. Manakah nilai yang benar untuk paket kedua (dari Server B) dan paket ketiga (dari Komputer A) dalam proses TCP Three-Way Handshake tersebut?',
      options: [
        'Paket 2: SYN=0, ACK=1, SEQ=200, ACK_NUM=101; Paket 3: SYN=1, ACK=0, SEQ=101',
        'Paket 2: SYN=1, ACK=0, SEQ=200, ACK_NUM=100; Paket 3: SYN=0, ACK=1, SEQ=101, ACK_NUM=200',
        'Paket 2: SYN=1, ACK=1, SEQ=200, ACK_NUM=101; Paket 3: SYN=0, ACK=1, SEQ=101, ACK_NUM=201',
        'Paket 2: SYN=0, ACK=0, SEQ=200, ACK_NUM=101; Paket 3: SYN=1, ACK=1, SEQ=101, ACK_NUM=201',
        'Paket 2: SYN=1, ACK=1, SEQ=100, ACK_NUM=101; Paket 3: SYN=0, ACK=0, SEQ=200, ACK_NUM=101'
      ],
      correctAnswer: 2,
    },
    // 13 (Dokumen No. 13)
    {
      question: 'Perhatikan urutan langkah mekanisme kerja TCP berikut dalam urutan yang acak: 1. Pengirim menerima ACK dari penerima dan mengirimkan segmen data berikutnya. 2. Pengirim mengirimkan SYN untuk memulai Three-Way Handshake. 3. Data dipecah menjadi segmen-segmen dengan Sequence Number. 4. Koneksi TCP ditutup setelah semua data terkirim dan dikonfirmasi. 5. Penerima mengirimkan SYN-ACK sebagai respons. Urutan mekanisme kerja TCP yang benar dari awal hingga akhir adalah ...',
      options: ['2 - 5 - 3 - 1 - 4', '2 - 3 - 5 - 1 - 4', '3 - 2 - 5 - 1 - 4', '5 - 2 - 3 - 1 - 4', '2 - 5 - 1 - 3 - 4'],
      correctAnswer: 0,
    },
    // 14 (Dokumen No. 14)
    {
      question: 'Perhatikan tiga fakta tentang mekanisme TCP berikut: Fakta 1: TCP menggunakan Three-Way Handshake sebelum pengiriman data sehingga koneksi terjamin terbentuk antara pengirim dan penerima. Fakta 2: TCP menggunakan Sequence Number dan Acknowledgment sehingga setiap kehilangan segmen dapat dideteksi dan data dapat dikirim ulang. Fakta 3: TCP menggunakan Checksum untuk mendeteksi kerusakan data selama pengiriman. Berdasarkan ketiga fakta tersebut, kesimpulan yang paling tepat tentang mekanisme keandalan TCP adalah ...',
      options: [
        'TCP menjamin keandalan hanya pada tahap pembukaan koneksi melalui Three-Way Handshake, sedangkan keandalan saat pengiriman data bergantung pada media fisik jaringan.',
        'Ketiga mekanisme TCP bekerja secara berurutan dan tidak bisa aktif secara bersamaan, sehingga hanya satu mekanisme yang aktif pada satu waktu tertentu.',
        'Keandalan TCP hanya bergantung pada Sequence Number karena Three-Way Handshake dan Checksum hanya bersifat tambahan dan tidak wajib digunakan.',
        'TCP tidak sepenuhnya andal karena Checksum hanya mendeteksi kerusakan tetapi tidak dapat memperbaikinya, sehingga data yang rusak akan hilang permanen.',
        'TCP menjamin keandalan pengiriman data secara end-to-end melalui tiga mekanisme yang saling melengkapi: pembentukan koneksi, penomoran urutan, dan deteksi kerusakan data.'
      ],
      correctAnswer: 4,
    },
    // 15 (Dokumen No. 15)
    {
      question: 'Perhatikan skenario komunikasi TCP berikut: Komputer A (pengirim) memulai koneksi: mengirim SYN dengan SEQ=0. Server B merespons dengan SYN-ACK, SEQ=0, ACK_NUM=1. Komputer A membalas dengan ACK, SEQ=1, ACK_NUM=1 (koneksi terbentuk). Komputer A mulai mengirim data: Segmen 1 dengan SEQ=1 berisi 100 byte. Server B menerima Segmen 1 dan membalas ACK_NUM=101. Namun, Segmen 2 (SEQ=101) tidak kunjung mendapat ACK dari Server B. Berdasarkan skenario tersebut, manakah kesimpulan yang tepat tentang kondisi jaringan dan langkah selanjutnya?',
      options: [
        'Tidak adanya ACK untuk Segmen 2 adalah kondisi normal dalam TCP karena ACK hanya dikirimkan setelah semua segmen diterima, bukan per-segmen.',
        'Server B telah menerima semua data karena ACK_NUM=101 menunjukkan bahwa semua segmen sudah berhasil diterima dengan sempurna.',
        'Segmen 1 berhasil terkirim (terbukti dari ACK_NUM=101). Tidak adanya ACK untuk Segmen 2 mengindikasikan Segmen 2 hilang di jaringan, sehingga Komputer A perlu melakukan retransmisi Segmen 2.',
        'Masalah ada pada Three-Way Handshake yang tidak sempurna karena nilai SEQ=0 tidak valid dan harus dimulai dari angka yang lebih besar.',
        'Koneksi TCP telah gagal total sehingga Komputer A harus memulai ulang Three-Way Handshake dari awal untuk mengirimkan data kembali.'
      ],
      correctAnswer: 2,
    },
    // 16 (Dokumen No. 16)
    {
      question: 'Dalam alur enkapsulasi sisi pengirim, data digital bergerak turun melewati lapisan-lapisan protokol secara runtut. Setelah lapisan Transport selesai memecah data menjadi Segmen, langkah logis berikutnya yang dilakukan oleh protokol IP pada lapisan Network adalah ...',
      options: [
        'Mengarahkan Segmen langsung ke lapisan Physical agar diubah menjadi bit sinyal kabel.',
        'Mengemas Segmen menjadi Frame dengan menambahkan informasi alamat MAC tujuan.',
        'Meneruskan Segmen ke lapisan Application untuk mendeteksi jenis protokol webnya.',
        'Membungkus Segmen menjadi Paket dengan menambahkan informasi alamat IP tujuan.',
        'Mengubah Segmen menjadi format enkripsi khusus sebelum dilempar ke media transmisi.'
      ],
      correctAnswer: 3,
    },
    // 17 (Dokumen No. 17)
    {
      question: 'Perhatikan komponen-komponen IP Header berikut: Source IP Address, Destination IP Address, TTL (Time to Live), Protocol, Header Checksum. Komponen yang berfungsi untuk mencegah sebuah paket berputar tanpa henti di jaringan (routing loop) dengan cara mengurangi nilainya setiap kali melewati sebuah router adalah ...',
      options: ['Source IP Address', 'Header Checksum', 'TTL (Time to Live)', 'Destination IP Address', 'Protocol'],
      correctAnswer: 2,
    },
    // 18 (Dokumen No. 18)
    {
      question: 'Perhatikan empat format penulisan alamat berikut: (A) 192.168.1.1, (B) 192.168.1.256, (C) 10.0.0.1/24, (D) 172.16.ABC.1. Seorang siswa diminta mengidentifikasi format penulisan alamat IPv4 yang valid. Argumen yang benar adalah ...',
      options: [
        'Hanya (A) yang valid karena semua oktetnya bernilai antara 0-255 dan ditulis dalam format desimal bertitik yang benar.',
        'Semua format valid karena IPv4 dapat ditulis dalam berbagai format termasuk heksadesimal dan desimal.',
        '(A), (B), dan (C) valid; hanya (D) yang tidak valid karena menggunakan huruf.',
        '(A) dan (B) valid; (C) tidak valid karena tanda slash tidak diperbolehkan dalam penulisan IPv4.',
        'Hanya (A) dan (C) yang valid; (A) sebagai alamat host biasa dan (C) sebagai alamat dengan prefix length yang juga merupakan format valid IPv4.'
      ],
      correctAnswer: 4,
    },
    // 19 (Dokumen No. 19)
    {
      question: 'Perhatikan studi kasus berikut ini: Sebuah SMK baru saja membangun gedung aula serbaguna yang akan digunakan untuk kegiatan seminar. Administrator jaringan sekolah memperkirakan akan ada sekitar 350 perangkat (laptop dan smartphone) yang terhubung ke jaringan di dalam aula tersebut secara bersamaan. Administrator harus menentukan kelas alamat IPv4 yang akan diterapkan agar seluruh perangkat dapat terhubung dalam satu segmen jaringan (satu broadcast domain) yang sama. Manakah keputusan penerapan kelas alamat IP yang logis diambil oleh administrator tersebut beserta argumen pendukungnya?',
      options: [
        'Menerapkan alamat Kelas C, karena Kelas C adalah standar umum untuk jaringan lokal (LAN) dan memiliki konfigurasi yang paling sederhana untuk skala sekolah.',
        'Menerapkan alamat Kelas B, karena jumlah perangkat yang diperkirakan (350) sudah melampaui kapasitas maksimal host yang dapat ditampung oleh Kelas C (254 host).',
        'Menerapkan alamat Kelas A, karena Kelas A memiliki daya jangkau sinyal yang lebih kuat dan mampu menampung jutaan perangkat sehingga tidak perlu khawatir kekurangan IP di masa depan.',
        'Tetap menerapkan alamat Kelas C dengan cara membagi perangkat menjadi dua kelompok berbeda agar penggunaan alamat IP lebih hemat dan efisien sesuai ketersediaan.',
        'Menerapkan alamat Kelas B, karena secara teknis alamat Kelas B memiliki prioritas bandwidth yang lebih tinggi dibandingkan Kelas C saat digunakan di ruangan terbuka.'
      ],
      correctAnswer: 1,
    },
    // 20 (Dokumen No. 50)
    {
      question: 'Jaringan 10.10.0.0 dengan subnet mask 255.255.0.0 (/16). Jumlah host yang tersedia dan batas-batasnya yang benar adalah ...',
      options: [
        '65.536 host; semua dari 10.10.0.0 hingga 10.10.255.255 bisa digunakan',
        '65.534 host (2^16 – 2); Network Address=10.10.0.0 dan Broadcast Address=10.10.255.255 tidak dapat diberikan ke host',
        '65.534 host; Network Address=10.10.0.1 dan Broadcast=10.10.255.254',
        '254 host; /16 berarti hanya 8 bit yang tersedia untuk host',
        'Tidak bisa dihitung karena 10.x.x.x adalah kelas A yang dibatasi'
      ],
      correctAnswer: 1,
    },
    // 21 (Dokumen No. 51)
    {
      question: 'Seorang siswa diminta mensimulasikan konversi alamat IPv4 192.168.10.1 ke dalam format biner secara berurutan oktet per oktet. Manakah urutan konversi yang BENAR?',
      options: [
        '192 → 11000000 | 168 → 10100000 | 10 → 00001010 | 1 → 00000001',
        '192 → 11000000 | 168 → 10101000 | 10 → 00001010 | 1 → 00000001',
        '192 → 10111000 | 168 → 10101000 | 10 → 00001010 | 1 → 00000001',
        '192 → 10101100 | 168 → 10101000 | 10 → 00001010 | 1 → 00000001',
        '192 → 11000000 | 168 → 10101000 | 10 → 00001010 | 1 → 11111111'
      ],
      correctAnswer: 1,
    },
    // 22 (Dokumen No. 22)
    {
      question: 'Perhatikan fakta-fakta hasil pemeriksaan pada IP Header berikut: IP Pengirim: 192.168.1.5 dengan Subnet Mask 255.255.255.0, IP Penerima: 192.168.1.200 dengan Subnet Mask 255.255.255.0, Default Gateway perangkat pengirim: 192.168.1.1, Aktivitas terdeteksi: Perangkat pengirim mengirimkan ARP Request untuk mencari MAC Address perangkat tujuan di jaringan lokal. Berdasarkan analisis terhadap seluruh fakta di atas, manakah kesimpulan yang tepat mengenai proses pengiriman paket tersebut?',
      options: [
        'Paket tidak dapat dikirim karena oktet terakhir IP pengirim (5) dan penerima (200) terlalu jauh sehingga melebihi batas jangkauan transmisi.',
        'Paket diteruskan ke Default Gateway 192.168.1.1 terlebih dahulu karena nilai subnet mask 255.255.255.0 menunjukkan keterbatasan jumlah host dalam satu jaringan.',
        'Paket dikirimkan langsung ke 192.168.1.200 menggunakan MAC Address hasil ARP tanpa melewati Default Gateway.',
        'ARP Request akan gagal karena IP penerima 192.168.1.200 berada di luar rentang subnet mask 255.255.255.0 dari pengirim.',
        'Perangkat pengirim harus mengganti subnet mask-nya menjadi 255.255.255.128 agar kedua perangkat dapat berada dalam satu jaringan yang sama.'
      ],
      correctAnswer: 2,
    },
    // 23 (Dokumen No. 23)
    {
      question: 'Pak Hendri, seorang administrator jaringan, sedang menganalisis laporan gangguan koneksi di kantornya. Ia menemukan data berikut: Komputer A: IP 192.168.10.5, Subnet Mask 255.255.255.0, Gateway 192.168.10.1; Komputer B: IP 192.168.10.80, Subnet Mask 255.255.255.0, Gateway 192.168.10.1; Server C: IP 192.168.20.50, Subnet Mask 255.255.255.0, Gateway 192.168.20.1. Komputer A dapat berkomunikasi dengan Komputer B tanpa masalah. Namun, saat Komputer A mencoba mengakses Server C, koneksi selalu gagal. Pak Hendri memastikan bahwa kabel dan switch berfungsi normal. Berdasarkan analisis pengalamatan IP tersebut, manakah kesimpulan yang tepat?',
      options: [
        'Komputer A tidak dapat berkomunikasi dengan siapapun karena nilai oktet terakhir (5) terlalu kecil dan dianggap sebagai alamat network.',
        'Koneksi A ke C gagal karena Komputer A tidak memiliki alamat IP yang valid; seharusnya menggunakan Kelas B agar dapat menjangkau subnet yang berbeda.',
        'Komputer B menghalangi koneksi antara A dan C karena keduanya berada dalam subnet yang sama sehingga terjadi konflik alamat.',
        'Komputer A dan Server C berada di subnet yang berbeda (192.168.10.x vs 192.168.20.x). Koneksi gagal karena router atau gateway di antara kedua subnet tersebut tidak terkonfigurasi dengan benar untuk meneruskan paket antar-subnet.',
        'Koneksi gagal karena Subnet Mask 255.255.255.0 tidak kompatibel untuk digunakan pada jaringan Kelas C yang memiliki lebih dari 50 perangkat.'
      ],
      correctAnswer: 3,
    },
    // 24 (Dokumen No. 24)
    {
      question: 'Seiring pertumbuhan pesat perangkat yang terhubung ke internet, IPv4 menghadapi masalah keterbatasan ruang alamat. Pernyataan yang paling tepat menggambarkan hubungan antara keterbatasan IPv4 dan solusi yang ditawarkan IPv6 adalah ...',
      options: [
        'IPv4 menggunakan 32-bit alamat sehingga mampu menampung sekitar 4 miliar alamat unik; IPv6 dikembangkan sebagai solusi dengan menggunakan 64-bit sehingga kapasitasnya menjadi dua kali lipat.',
        'IPv4 menggunakan format heksadesimal sehingga sulit dikonfigurasi; IPv6 hadir dengan format desimal bertitik yang lebih mudah digunakan oleh administrator jaringan.',
        'IPv4 menggunakan 32-bit alamat dengan kapasitas sekitar 4 miliar alamat yang hampir habis; IPv6 hadir dengan 128-bit alamat yang mampu menampung miliaran kali lebih banyak perangkat.',
        'IPv4 sudah cukup untuk semua perangkat di dunia; IPv6 hanya dikembangkan untuk meningkatkan kecepatan transmisi data bukan untuk menambah kapasitas alamat.',
        'Keterbatasan IPv4 disebabkan oleh kecepatan transmisi yang lambat; IPv6 hadir untuk meningkatkan bandwidth jaringan menjadi lebih cepat dan stabil.'
      ],
      correctAnswer: 2,
    },
    // 25 (Dokumen No. 55)
    {
      question: 'Interface memiliki MAC A0:B1:C2:D3:E4:F5. Proses EUI-64: Bagi MAC: A0:B1:C2 | D3:E4:F5. Sisipkan FF:FE: A0:B1:C2:FF:FE:D3:E4:F5. A0=10100000, flip bit ke-7: 10100010=A2. Interface ID: A2:B1:C2:FF:FE:D3:E4:F5. IPv6 Link Local Address yang terbentuk adalah ...',
      options: [
        'FE80::A0B1:C2FF:FED3:E4F5/64',
        'FE80::A2B1:C2FF:FED3:E4F5/64',
        'FE80::A0FF:FEB1:C2D3:E4F5/64',
        'FE80::A2FF:B1C2:FED3:E4F5/64',
        'FE80::A0B1:FFFE:C2D3:E4F5/64'
      ],
      correctAnswer: 1,
    },
    // 26 (Dokumen No. 26)
    {
      question: 'Perhatikan alamat IPv6 berikut: 2001:0DB8:0000:000A:0000:0000:0000:0001. Seorang teknisi diminta menyederhanakan alamat tersebut menggunakan dua aturan penyederhanaan IPv6. Argumen penyederhanaan yang benar adalah ...',
      options: [
        'Alamat tidak bisa disederhanakan karena setiap grup harus tetap ditulis lengkap 4 digit agar tidak terjadi kebingungan saat konfigurasi router.',
        'Dengan menghilangkan leading zero pada setiap grup dan mengganti rangkaian grup bernilai nol berturutan dengan ::, alamat menjadi 2001:DB8:0:A::1.',
        'Hanya leading zero yang boleh dihilangkan tanpa boleh menggunakan :: sehingga hasilnya adalah 2001:DB8:0:A:0:0:0:1.',
        'Tanda :: bisa digunakan lebih dari sekali dalam satu alamat untuk memperpendek, sehingga hasilnya adalah 2001::DB8::A::1.',
        'Semua nol dalam alamat dapat dihapus seluruhnya termasuk nol di tengah angka, sehingga hasilnya adalah 21:DB8:::A:::1.'
      ],
      correctAnswer: 1,
    },
    // 27 (Dokumen No. 27)
    {
      question: 'Seorang siswa mengerjakan konversi MAC Address 08:00:27:AB:CD:EF menjadi IPv6 Interface ID menggunakan EUI-64. Ia melakukan langkah-langkah berikut: Langkah 1: Membagi MAC menjadi 08:00:27 | AB:CD:EF. Langkah 2: Menyisipkan FF:FE di tengah menjadi 08:00:27:FF:FE:AB:CD:EF. Langkah 3: Mengonversi 08 (oktet pertama) ke biner: 00001000, lalu membalik bit ke-7 menjadi 00001010, lalu mengonversi kembali ke heksadesimal: 0A. Langkah 4: Interface ID = 0A00:27FF:FEAB:CDEF. Manakah analisis yang benar terhadap pekerjaan siswa tersebut?',
      options: [
        'Langkah 1 benar, tetapi Langkah 2 salah karena berdasarkan aturan baku standar EUI-64 kode yang disisipkan seharusnya adalah FE:FF',
        'Langkah 2 salah karena kode FF:FE seharusnya diletakkan pada bagian akhir alamat biner, bukan disisipkan di tengah-tengah urutan MAC',
        'Langkah 1 salah karena struktur MAC Address harus dipecah menjadi tiga bagian simetris terlebih dahulu sebelum bisa disisipkan kode tambahan',
        'Langkah 1 dan 2 sudah benar, namun pada Langkah 3 operasi pembalikan bit keliru karena perhitungan bit ke-7 seharusnya dimulai dari arah kanan (LSB)',
        'Seluruh tahapan dan hasil akhir pekerjaan siswa tersebut sudah benar. Operasi matematika pada Langkah 3 tepat karena bit ke-7 dari kiri pada biner 00001000 adalah 0, sehingga ketika dibalik berubah menjadi 1 dan menghasilkan nilai heksadesimal 0A.'
      ],
      correctAnswer: 4,
    },
    // 28 (Dokumen No. 28)
    {
      question: 'Seorang administrator jaringan merencanakan pengalamatan IPv6 Gateway untuk dua interface router (FastEthernet0/0 dan FastEthernet0/1) menggunakan model Global Unicast dengan prefix network 2001:DB8:AAAA::. Ia menggunakan Subnet ID A untuk interface pertama dan Subnet ID B untuk interface kedua, serta Interface ID ::1 untuk keduanya. Urutan komponen pengalamatan IPv6 yang benar untuk interface FastEthernet0/0 adalah ...',
      options: [
        'Unicast Address: 2001:DB8:AAAA | Subnet ID: 000B | Interface ID: ::1 menghasilkan 2001:DB8:AAAA:B::1/64',
        'Unicast Address: FE80 | Subnet ID: A | Interface ID: ::1 menghasilkan FE80:AAAA:A::1/64',
        'Unicast Address: FF00 | Subnet ID: A | Interface ID: ::1 menghasilkan FF00:DB8:AAAA:A::1/64',
        'Unicast Address: 2001:DB8:AAAA | Subnet ID: A | Interface ID: ::1 menghasilkan 2001:DB8:AAAA:A::1/64',
        'Unicast Address: FC00 | Subnet ID: A | Interface ID: ::1 menghasilkan FC00:DB8:AAAA:A::1/64'
      ],
      correctAnswer: 3,
    },
    // 29 (Dokumen No. 29)
    {
      question: 'Perhatikan pernyataan-pernyataan berikut tentang perbedaan IPv4 dan IPv6: 1. IPv4 menggunakan panjang alamat 32-bit, sedangkan IPv6 menggunakan 128-bit sehingga kapasitas alamat IPv6 jauh lebih besar. 2. IPv6 menggunakan format penulisan heksadesimal dengan tanda titik dua (:) sebagai pemisah, sedangkan IPv4 menggunakan format desimal dengan tanda titik (.) sebagai pemisah. 3. IPv6 sudah tidak memerlukan teknik NAT (Network Address Translation) karena jumlah alamatnya yang sangat banyak, berbeda dengan IPv4 yang sangat bergantung pada NAT. 4. IPv6 hanya cocok digunakan untuk jaringan lokal saja, sedangkan IPv4 digunakan untuk jaringan global dan internet. Pernyataan yang benar adalah ...',
      options: ['1, 2, dan 3', '2, 3, dan 4', '1, 2, dan 4', '1, 3, dan 4', '2 dan 4 saja'],
      correctAnswer: 0,
    },
    // 30 (Dokumen No. 30)
    {
      question: 'Perhatikan skenario berikut: Komputer A mengirimkan permintaan halaman web ke Server B. Proses yang terjadi melibatkan: 1. TCP memecah permintaan HTTP menjadi segmen dan melakukan Three-Way Handshake untuk memastikan koneksi terbentuk. 2. IP memberikan alamat logis pada setiap segmen yang dikemas menjadi paket, lalu menentukan jalur terbaik menuju Server B. 3. Server B menerima paket, IP melepas Network Header, TCP menyusun ulang segmen berdasarkan Sequence Number, dan data diteruskan ke aplikasi web. Berdasarkan skenario tersebut, manakah evaluasi yang tepat tentang keterkaitan TCP dan IP dalam arsitektur TCP/IP?',
      options: [
        'TCP dan IP bekerja secara berurutan dan tidak bisa aktif bersamaan; TCP harus selesai bekerja sebelum IP mulai bekerja dalam setiap pengiriman paket.',
        'TCP bertanggung jawab atas keandalan dan urutan data (Transport Layer), sedangkan IP bertanggung jawab atas pengalamatan dan routing (Network Layer); keduanya bekerja bersama secara berlapis untuk menjamin pengiriman data yang andal dan tepat sasaran.',
        'Keterkaitan TCP dan IP hanya terjadi saat Three-Way Handshake; setelah koneksi terbentuk, IP tidak lagi terlibat dalam proses pengiriman data.',
        'IP adalah protokol yang lebih penting dari TCP karena tanpa alamat IP, koneksi TCP tidak akan pernah bisa terbentuk meskipun jaringan fisik tersedia.',
        'TCP dan IP memiliki fungsi yang sama persis karena keduanya sama-sama mengatur pengalamatan dan pengiriman data di lapisan yang berbeda.'
      ],
      correctAnswer: 1,
    }
  ] as TestQuestion[],
};

export const globalPosttest = {
  title: 'Post-Test Umum',
  description: 'Tes ini mengukur pemahaman akhir Anda setelah menyelesaikan semua materi',
  questions: [
    // 1 (Dokumen No. 61)
    {
      question: 'Perhatikan pernyataan berikut tentang TCP/IP. 1. TCP/IP adalah satu protokol tunggal yang menangani semua fungsi jaringan dari lapisan fisik hingga aplikasi. 2. TCP (Transmission Control Protocol) berperan menjamin keandalan data dengan mekanisme ACK dan retransmission. 3. IP (Internet Protocol) berperan memastikan setiap segmen data tiba secara berurutan dan lengkap di penerima. 4. IP berperan memberikan pengalamatan logis dan menentukan rute terbaik pengiriman paket antar jaringan. 5. TCP dan IP bekerja di lapisan yang sama (lapisan Transport) dalam arsitektur model TCP/IP. Pernyataan yang BENAR tentang TCP/IP adalah ...',
      options: ['1 dan 3', '2 dan 4', '3 dan 5', '1 dan 5', '3 dan 4'],
      correctAnswer: 1,
    },
    // 2 (Dokumen No. 62)
    {
      question: 'Perhatikan lima lapisan model TCP/IP berikut yang disusun secara acak: Transport, Data Link, Application, Physical, Network. Urutan susunan lapisan model TCP/IP modern (5 layer) dari lapisan teratas (aplikasi) hingga lapisan terbawah (fisik) yang benar adalah ...',
      options: [
        'Application - Network - Transport - Data Link - Physical',
        'Application - Transport - Data Link - Network - Physical',
        'Application - Transport - Network - Data Link - Physical',
        'Transport - Application - Network - Data Link - Physical',
        'Physical - Data Link - Network - Transport - Application'
      ],
      correctAnswer: 2,
    },
    // 3 (Dokumen No. 63)
    {
      question: 'Sebuah kartu referensi memuat lima pasangan lapisan dan fungsi model TCP/IP berikut. 1. Application – antarmuka antara aplikasi pengguna dan layanan jaringan. 2. Network – memberikan alamat IP dan menentukan rute pengiriman paket. 3. Transport – memecah data menjadi segmen dan memastikan keutuhan pengirimannya. 4. Data Link – mengelola pengiriman frame melalui media fisik menggunakan MAC Address. 5. Network – memecah data menjadi segmen kecil agar lebih efisien di jaringan. Pasangan yang TIDAK TEPAT adalah ...',
      options: [
        'Pasangan (1) tidak tepat karena lapisan Application seharusnya hanya bertanggung jawab penuh dalam menangani proses enkripsi data digital.',
        'Pasangan (2) tidak tepat karena lapisan Network tidak mengurus rute pengiriman paket data melainkan itu tugas dari lapisan Transport.',
        'Pasangan (3) tidak tepat karena lapisan Transport tidak memecah data menjadi segmen melainkan itu adalah tugas utama lapisan Network.',
        'Pasangan (4) tidak tepat karena lapisan Data Link tidak pernah menggunakan MAC Address melainkan menggunakan alamat IP dalam bekerja.',
        'Pasangan (5) tidak tepat karena aktivitas memecah data menjadi segmen kecil merupakan tanggung jawab penuh dari lapisan Transport.'
      ],
      correctAnswer: 4,
    },
    // 4 (Dokumen No. 34)
    {
      question: 'Sebuah file gambar akan dikirim dari laptop ke server. Lapisan Transport sudah memecah data menjadi Segmen dengan nomor port. Langkah enkapsulasi berikutnya di lapisan Network yang tepat adalah ...',
      options: [
        'A. Mengubah Segmen langsung menjadi sinyal fisik agar lebih cepat sampai ke server',
        'B. Menggabungkan semua Segmen menjadi satu sebelum diberi alamat IP untuk efisiensi',
        'C. Menambahkan MAC Address server pada Segmen agar langsung menjadi Frame',
        'D. Kembali ke lapisan Application untuk memverifikasi format file gambar',
        'E. Membungkus setiap Segmen ke dalam Paket dengan IP Header berisi alamat IP pengirim dan penerima, sehingga Router dapat meneruskan paket ke jaringan yang tepat'
      ],
      correctAnswer: 4,
    },
    // 5 (Dokumen No. 35)
    {
      question: 'Sebuah Paket berhasil diekstrak dari Frame oleh lapisan Data Link di komputer penerima. Langkah dekapsulasi berikutnya di lapisan Network yang tepat adalah ...',
      options: [
        'A. Meneruskan Paket data secara langsung menuju lapisan Application tanpa memeriksa atau membuka header protokol di dalamnya.',
        'B. Mengirimkan kembali Paket data tersebut ke jaringan untuk meminta konfirmasi ulang dari pihak pengirim sebelum diproses.',
        'C. Mengakumulasikan seluruh Paket data yang sejenis menjadi satu kesatuan file utuh sebelum diserahkan ke lapisan atas.',
        'D. Melepaskan Network Header dari Paket untuk mengambil Segmen, lalu meneruskannya ke lapisan Transport agar port bisa dibaca.',
        'E. Menolak dan membuang Paket data tersebut dari memori jika struktur Network Header yang diterima mengalami kerusakan.'
      ],
      correctAnswer: 3,
    },
    // 6 (Dokumen No. 36)
    {
      question: 'Perhatikan tahapan-tahapan perjalanan data dalam sebuah jaringan komputer berikut ini (diurutkan secara acak): 1. Lapisan Transport pengirim memecah data menjadi Segmen, kemudian lapisan Network membungkusnya menjadi Paket data. 2. Lapisan Data Link pengirim mengemas paket menjadi Frame, lalu lapisan Physical mengirimkannya berupa sinyal fisik. 3. Lapisan Data Link penerima mendeteksi sinyal fisik yang masuk, lalu mengupas Frame Header untuk memeriksa MAC Address. 4. Lapisan Network penerima melepas IP Header dari paket, lalu lapisan Transport menyusun kembali segmen menjadi data utuh. Urutan alur transmisi data yang benar dari awal proses enkapsulasi di sisi pengirim hingga selesai proses dekapsulasi di sisi penerima adalah ...',
      options: ['1 - 3 - 2 - 4', '2 - 1 - 3 - 4', '1 - 2 - 3 - 4', '2 - 1 - 4 - 3', '1 - 2 - 4 - 3'],
      correctAnswer: 2,
    },
    // 7 (Dokumen No. 67)
    {
      question: 'Seorang mahasiswa teknik jaringan melakukan empat eksperimen pada sistem jaringan komputer: 1. Router dimatikan - komunikasi antar jaringan berhenti. 2. Alamat IP dihapus - paket data tidak bisa diarahkan ke tujuan. 3. Protokol TCP dimatikan - file ukuran besar gagal terkirim. 4. Kabel transmisi dicabut - tidak ada komunikasi sama sekali. Mahasiswa tersebut menarik kesimpulan: "Lapisan Network (IP) adalah satu-satunya lapisan kritis dalam jaringan; sedangkan lapisan protokol lainnya hanyalah opsional." Berdasarkan keempat eksperimen tersebut, manakah analisis yang paling tepat terhadap kesimpulan mahasiswa tersebut?',
      options: [
        'Benar; hasil pengujian nomor (1) dan (2) membuktikan bahwa protokol IP pada lapisan Network memegang peranan yang paling penting di dalam komunikasi data.',
        'Benar sebagian; hanya lapisan Network dan Transport saja yang dianggap kritis, sedangkan konfigurasi pada lapisan protokol yang lainnya bersifat opsional.',
        'Salah; keempat eksperimen tersebut membuktikan bahwa setiap lapisan memiliki peran unik yang tidak bisa digantikan sehingga seluruh lapisan sama kritisnya.',
        'Benar; lapisan Physical tidak termasuk elemen kritis karena eksperimen nomor (4) secara murni hanya menguji komponen kabel fisik tanpa melibatkan protokol.',
        'Salah; hasil eksperimen nomor (3) justru membuktikan bahwa sebuah penanganan segmentasi data pada lapisan Transport merupakan komponen yang paling kritis.'
      ],
      correctAnswer: 2,
    },
    // 8 (Dokumen No. 68)
    {
      question: 'Admin menerima laporan bahwa mesin di lantai 3 tidak bisa mencetak dokumen ke printer server. Setelah dilakukan pemeriksaan berlapis, ditemukan tiga fakta berikut: 1. Kabel UTP terpasang dengan benar dan lampu indikator port pada perangkat switch menyala. 2. Pengujian traceroute menuju alamat IP printer server berhasil dilakukan dan paket dinyatakan sampai. 3. Job cetak dikirim, printer server menerima koneksi TCP tetapi tugas langsung ditolak dengan kode error 503. Kesimpulan analisis yang paling tepat berdasarkan seluruh hasil pemeriksaan tersebut adalah ...',
      options: [
        'Masalah terjadi pada lapisan Physical karena indikasi lampu menyala hijau pada perangkat switch belum menjamin bahwa data digital dapat mengalir dengan sempurna tanpa adanya interferensi.',
        'Masalah terjadi pada lapisan Network karena keberhasilan eksekusi perintah traceroute menuju server tujuan terkadang memberikan kesimpulan palsu mengenai kondisi rute pengiriman.',
        'Lapisan Physical dan Network terbukti normal, sedangkan masalah berada di lapisan Application karena kode error 503 menandakan adanya gangguan layanan cetak pada sisi server.',
        'Tidak ditemukan gangguan pada arsitektur jaringan komputer karena kemunculan status kode error 503 merupakan sebuah kondisi operasional yang sangat normal ketika proses pencetakan.',
        'Gangguan terjadi secara bersamaan di seluruh tingkatan lapisan model protokol akibat adanya kerusakan sistemik yang memutus jalinan komunikasi data dari pengirim menuju ke penerima.'
      ],
      correctAnswer: 2,
    },
    // 9 (Dokumen No. 39)
    {
      question: 'Perhatikan komponen TCP Header: Source Port, Destination Port, Sequence Number, Acknowledgment Number, Window Size. Komponen yang mengontrol jumlah data yang boleh dikirim pengirim sebelum mendapat konfirmasi (flow control) adalah ...',
      options: ['Source Port', 'Sequence Number', 'Destination Port', 'Acknowledgment Number', 'Window Size'],
      correctAnswer: 4,
    },
    // 10 (Dokumen No. 70)
    {
      question: 'Aplikasi transfer file mengirim 4000 byte via TCP dipecah menjadi: Seq=1 (1000 byte), Seq=1001 (1000 byte), Seq=2001 (1000 byte), Seq=3001 (1000 byte). Urutan tiba di penerima: Seq=3001, Seq=1001, Seq=1, Seq=2001. Seorang siswa mengklaim \'Penerima akan menjalankan file dari Seq=3001 karena itu yang pertama tiba.\' Berdasarkan mekanisme TCP Sequence Number, urutan data yang benar diproses oleh penerima adalah ...',
      options: [
        'Klien memutar video mulai dari Seq=3001 karena segmen itu yang pertama tiba di penerima.',
        'Klien menyusun ulang segmen berdasarkan nilai Sequence Number menjadi Seq=1 → 1001 → 2001 → 3001, sehingga video ditampilkan dengan urutan yang benar meski segmen tiba secara acak.',
        'Server mengirim ulang semua segmen dari awal karena urutan kedatangan yang acak menandakan seluruh transmisi gagal.',
        'Klien membuang semua segmen selain yang pertama tiba, karena TCP hanya mengakui segmen pertama yang diterima.',
        'Sequence Number hanya digunakan untuk mendeteksi kerusakan data, bukan untuk menyusun ulang urutan segmen di penerima.'
      ],
      correctAnswer: 1,
    },
    // 11 (Dokumen No. 41)
    {
      question: 'Kondisi Normal: Server kirim Seq=500 (200 byte); Klien balas ACK=700. Kondisi Error Recovery: Server kirim Seq=700; tidak ada ACK (timeout); Server kirim ulang Seq=700; Klien balas ACK=900. Argumen yang tepat membedakan kedua kondisi adalah ...',
      options: [
        'Tidak ada perbedaan; ACK dikirim hanya setelah semua data selesai diterima',
        'Pada kondisi normal ACK meningkat sesuai data diterima; pada error recovery tidak ada ACK yang kembali, menandakan segmen hilang dan retransmission diperlukan',
        'Perbedaannya hanya pada ukuran paket; segmen besar lebih sering hilang',
        'Kondisi error terjadi karena Three-Way Handshake belum terbentuk',
        'TCP selalu mengirim ulang dari Seq=1 setiap kali timeout, tanpa memandang kondisi'
      ],
      correctAnswer: 1,
    },
    // 12 (Dokumen No. 42)
    {
      question: 'Laptop A (SEQ=300) mengirim SYN ke Server B. Server B membalas SYN-ACK (SEQ=800, ACK_NUM=?). Laptop A merespons ACK (SEQ=?, ACK_NUM=?). Nilai BENAR berdasarkan mekanisme Three-Way Handshake adalah ...',
      options: [
        'ACK_NUM=301; SEQ=301, ACK_NUM=801',
        'ACK_NUM=300; SEQ=301, ACK_NUM=801',
        'ACK_NUM=301; SEQ=800, ACK_NUM=301',
        'ACK_NUM=400; SEQ=401, ACK_NUM=801',
        'ACK_NUM=301; SEQ=301, ACK_NUM=800'
      ],
      correctAnswer: 0,
    },
    // 13 (Dokumen No. 43)
    {
      question: 'Mekanisme kerja TCP (urutan diacak): 1. Penerima kirim ACK untuk setiap segmen. 2. Pengirim kirim SYN untuk memulai koneksi. 3. Koneksi ditutup dengan FIN. 4. Penerima balas SYN-ACK. 5. Data dikirim dalam segmen bernomor urut. Urutan BENAR dari awal hingga selesai adalah ...',
      options: ['2 – 4 – 5 – 1 – 3', '4 – 2 – 5 – 1 – 3', '2 – 5 – 4 – 1 – 3', '5 – 2 – 4 – 3 – 1', '2 – 5 – 1 – 4 – 3'],
      correctAnswer: 0,
    },
    // 14 (Dokumen No. 44)
    {
      question: 'Seorang siswa menyimpulkan: \'Keandalan TCP hanya ditentukan oleh Retransmission; Three-Way Handshake, Sequence Number, dan ACK hanya berfungsi sebagai pendukung opsional.\' Berdasarkan klaim tersebut, manakah analisis yang benar tentang mekanisme keandalan TCP?',
      options: [
        'Benar; Retransmission memang satu-satunya yang langsung memastikan data sampai ke tujuan',
        'Benar sebagian; Sequence Number dan Retransmission sudah cukup tanpa Three-Way Handshake',
        'Salah; keandalan TCP dibangun dari keempat mekanisme yang saling melengkapi: Handshake menjamin kesiapan, Sequence Number menjamin urutan, ACK menjamin konfirmasi, dan Retransmission menjamin pemulihan',
        'Benar; Three-Way Handshake dan ACK tidak aktif saat jaringan dalam kondisi normal',
        'Salah; hanya Three-Way Handshake yang wajib; ketiga lainnya opsional'
      ],
      correctAnswer: 2,
    },
    // 15 (Dokumen No. 45)
    {
      question: 'Log komunikasi TCP: SYN-SYN-ACK-ACK, koneksi terbentuk. Klien kirim Seq=1 (500 byte); Server balas ACK=501. Klien kirim Seq=501; Server balas ACK=501 (Duplicate ACK). Klien kirim ulang Seq=501; Server balas ACK=1001. FIN, koneksi ditutup. Kesimpulan paling tepat adalah ...',
      options: [
        'Komunikasi gagal; Duplicate ACK di [3] menandakan koneksi rusak permanen',
        'Duplicate ACK adalah kondisi normal yang terjadi pada setiap segmen TCP',
        'Komunikasi berhasil; Duplicate ACK di [3] menandakan Seq=501 hilang; retransmission di [4] berhasil mengirimkannya sehingga semua data tersampaikan',
        'Langkah [5] tidak valid; FIN hanya boleh dikirim setelah dua kali retransmission berhasil',
        'ACK=501 yang berulang menandakan Klien terus mengirim data yang sama'
      ],
      correctAnswer: 2,
    },
    // 16 (Dokumen No. 46)
    {
      question: 'Perhatikan empat pernyataan tentang Internet Protocol (IP) di bawah ini: 1. IP beroperasi secara aktif pada lapisan Network (Network Layer). 2. IP memberikan identitas alamat logis unik kepada setiap perangkat. 3. IP menentukan rute terbaik pengiriman paket data antar jaringan. 4. IP menjamin setiap paket data diterima berurutan dan lengkap. Pernyataan yang benar mengenai peran dan karakteristik dari IP adalah ...',
      options: [
        'Pernyataan 1, 2, dan 4',
        'Pernyataan 1, 3, dan 4',
        'Pernyataan 2, 3, dan 4',
        'Pernyataan 1, 2, dan 3',
        'Pernyataan 1, 2, 3, dan 4'
      ],
      correctAnswer: 3,
    },
    // 17 (Dokumen No. 77)
    {
      question: 'Sebuah paket IP melewati 64 router dengan nilai awal TTL=64. Setelah melewati router ke-64, komponen IP Header mana yang berubah dan apa dampaknya ...',
      options: [
        'Protocol berubah dari 6 ke 7; paket dialihkan ke UDP',
        'Source IP berubah; router terakhir mengganti alamat pengirim untuk keamanan',
        'TTL berkurang dari 64 menjadi 0; router ke-64 akan membuang paket ini dan mengirim ICMP Time Exceeded ke pengirim, mencegah paket berputar tanpa henti di jaringan',
        'Header Checksum berubah; paket tidak bisa diteruskan dan harus dikirim ulang',
        'Destination IP berubah; router terakhir mengganti alamat tujuan berdasarkan tabel routing'
      ],
      correctAnswer: 2,
    },
    // 18 (Dokumen No. 48)
    {
      question: 'Seorang siswa menuliskan empat format alamat jaringan di bawah ini: 172.16.0.1, 300.0.0.1, 10.0.0.0/8, 192.168.ABC.1. Argumen yang paling tepat mengenai validitas format penulisan alamat tersebut adalah ...',
      options: [
        'Semua alamat valid; karena IPv4 mendukung berbagai format penulisan termasuk heksadesimal dan notasi CIDR.',
        'Hanya alamat (1) yang valid murni; alamat (2) tidak valid karena 300 > 255; alamat (4) tidak valid karena mengandung huruf; sedangkan alamat (3) tidak valid karena merupakan notasi CIDR bukan alamat IPv4 murni.',
        'Alamat (1) dan (2) valid; sedangkan alamat (3) dan (4) tidak valid.',
        'Alamat (1) dan (3) valid; alamat (2) tidak valid karena bernilai 300 > 255; dan alamat (4) tidak valid karena menggunakan huruf.',
        'E. Hanya alamat (1) dan (4) yang valid; karena huruf heksadesimal diizinkan dalam penulisan alamat IPv4.'
      ],
      correctAnswer: 3,
    },
    // 19 (Dokumen No. 79)
    {
      question: 'Administrator mendesain jaringan untuk 500 perangkat IoT dalam satu broadcast domain. Rekan A menyarankan Kelas C dengan subnetting; Rekan B menyarankan Kelas B langsung. Berdasarkan kedua saran tersebut, manakah keputusan penerapan kelas IPv4 yang tepat untuk satu broadcast domain?',
      options: [
        'Saran A benar; subnetting Kelas C bisa mengakomodasi 500 perangkat dalam satu broadcast domain',
        'Saran B benar; Kelas B langsung dapat menampung 500 perangkat dalam satu broadcast domain (65.534 > 500), sedangkan Saran A salah karena subnetting justru membagi menjadi beberapa broadcast domain',
        'Kedua saran benar; subnetting dan Kelas B sama-sama bisa mengakomodasi 500 perangkat',
        'Kedua saran salah; hanya Kelas A yang bisa menampung 500 perangkat',
        'Saran A benar; subnetting selalu lebih efisien dari memilih kelas yang lebih besar'
      ],
      correctAnswer: 1,
    },
    // 20 (Dokumen No. 80)
    {
      question: 'Jaringan 192.168.10.0/24. Seorang siswa mengklaim: \'Jumlah host yang tersedia adalah 256 karena subnet mask 255.255.255.0 mengalokasikan satu oktet penuh (2^8=256) untuk host.\' Berdasarkan klaim tersebut, manakah analisis yang benar tentang jumlah host yang tersedia?',
      options: [
        'Benar; 256 host tersedia karena 2^8=256 dan semua bisa digunakan',
        'Salah; jumlah host sebenarnya 254 (bukan 256) karena 192.168.10.0 disisihkan sebagai Network Address (semua bit host=0) dan 192.168.10.255 disisihkan sebagai Broadcast Address (semua bit host=1), sehingga host = 2^8 – 2 = 254',
        'Benar; 256 host tersedia karena pengecualian hanya berlaku untuk kelas A dan B',
        'Salah; jumlah host sebenarnya 255 karena hanya Network Address yang dikurangi',
        'Salah; jumlah host sebenarnya 253 karena Network, Broadcast, dan Default Gateway dikurangi'
      ],
      correctAnswer: 1,
    },
    // 21 (Dokumen No. 81)
    {
      question: 'Seorang siswa mengonversi alamat IPv4 10.1.1.1 ke biner dan mendapatkan hasil berikut: Oktet 1 (10): 00001010. Oktet 2 (1): 00000001. Oktet 3 (1): 00000001. Oktet 4 (1): 00000001. Sehingga hasil konversi = 00001010.00000001.00000001.00000001. Rekan siswa mengklaim: \'Hasil konversi tersebut salah.\' Berdasarkan konversi yang dilakukan siswa, manakah analisis yang benar?',
      options: [
        'Rekan benar; oktet 1 (10) seharusnya 00001100',
        'Rekan benar; oktet 2, 3, dan 4 (angka 1) seharusnya 00000010',
        'Rekan benar; oktet 1 (10) seharusnya 00010000 dan oktet 2, 3, 4 (angka 1) seharusnya 00000010',
        'Rekan salah; semua hasil konversi sudah benar: oktet 1 (10)=00001010, oktet 2, 3, 4 (1)=00000001',
        'Rekan benar; oktet 1 (10) seharusnya 01010000 dan oktet 2, 3, 4 (1) seharusnya 10000000'
      ],
      correctAnswer: 3,
    },
    // 22 (Dokumen No. 82)
    {
      question: 'Host X: IP 10.1.5.100, Mask 255.255.0.0, GW 10.1.0.1. Host Y: IP 10.1.200.50, Mask 255.255.0.0, GW 10.1.0.1. Seorang siswa mengklaim X dan Y tidak bisa berkomunikasi langsung karena oktet ketiga berbeda (5 vs 200). Berdasarkan klaim tersebut, manakah analisis yang benar tentang pengalamatan IPv4 Host X dan Y?',
      options: [
        'Benar; perbedaan oktet ketiga (5 vs 200) selalu berarti subnet berbeda',
        'Benar; Subnet Mask 255.255.0.0 membatasi oktet ketiga harus sama',
        'Salah; perbedaan oktet ketiga tidak menentukan subnet yang berbeda. Dengan Mask 255.255.0.0 (/16), bit host mencakup dua oktet terakhir, sehingga 10.1.5.100 dan 10.1.200.50 keduanya berada dalam subnet 10.1.0.0/16 dan bisa berkomunikasi langsung',
        'Benar; untuk komunikasi langsung, tiga oktet pertama harus identik',
        'Salah; X dan Y tidak bisa berkomunikasi karena menggunakan kelas A yang memerlukan router'
      ],
      correctAnswer: 2,
    },
    // 23 (Dokumen No. 53)
    {
      question: 'Bu Ratna memeriksa dua komputer yang tidak bisa berkomunikasi. Komputer X: IP 192.168.1.100, Mask 255.255.255.0, GW 192.168.1.1. Komputer Y: IP 192.168.2.100, Mask 255.255.255.0, GW 192.168.2.1. Switch dan kabel berfungsi normal. Kesimpulan yang tepat adalah ...',
      options: [
        'Komputer X tidak valid; oktet terakhir 100 dianggap sebagai alamat network',
        'Kedua komputer konflik karena menggunakan subnet mask yang sama',
        'Keduanya bisa berkomunikasi langsung karena sama-sama menggunakan kelas C',
        'X dan Y berada di subnet berbeda (192.168.1.x vs 192.168.2.x); komunikasi memerlukan router yang dikonfigurasi untuk meneruskan paket antar kedua subnet tersebut',
        'Subnet mask 255.255.255.0 tidak cocok untuk jaringan dengan dua segmen berbeda'
      ],
      correctAnswer: 3,
    },
    // 24 (Dokumen No. 54)
    {
      question: 'Perhatikan fakta tentang IPv4 dan IPv6: 1. IPv4 menggunakan 32-bit dengan sekitar 4,3 miliar alamat. 2. Pertumbuhan pesat perangkat menyebabkan kehabisan alamat IPv4. 3. IPv6 menggunakan 128-bit dengan kapasitas jauh lebih besar. 4. IPv6 menggantikan TCP sebagai protokol pengiriman data andal. Pernyataan yang BENAR tentang IPv6 adalah ...',
      options: ['1, 2, 3, dan 4', '1, 2, dan 4', '2, 3, dan 4', '1, 2, dan 3', '1 dan 4 saja'],
      correctAnswer: 3,
    },
    // 25 (Dokumen No. 85)
    {
      question: 'Interface router MAC: C8:3A:35:44:55:66. EUI-64: C8:3A:35 | 44:55:66. Sisipkan FF:FE: C8:3A:35:FF:FE:44:55:66. C8=11001000, flip bit ke-7 → 11001010=CA. Interface ID: CA:3A:35:FF:FE:44:55:66. Seorang siswa mengklaim \'Langkah salah; bit ke-7 dari kiri pada 11001000 bernilai 0, setelah dibalik hasilnya 11001001=C9 bukan CA.\' Berdasarkan klaim tersebut, manakah analisis yang benar tentang hasil konversi EUI-64?',
      options: [
        'Benar; C9 adalah hasil yang tepat dari membalik bit ke-7 pada 11001000',
        'Benar; penghitungan bit ke-7 dimulai dari kanan (LSB) sehingga nilainya berbeda',
        'Salah; klaim siswa keliru dalam menghitung posisi bit ke-7. Bit ke-7 dari kiri pada 11001000 adalah bit kedua dari kanan bernilai 0. Membaliknya menghasilkan 11001010=CA, bukan C9. Hasil CA adalah benar',
        'Benar; C9 benar karena bit ke-7 pada 11001000 adalah 0 dan dibalik menjadi 1',
        'Salah; bit ke-7 tidak perlu dibalik; yang dibalik seharusnya bit pertama (MSB)'
      ],
      correctAnswer: 2,
    },
    // 26 (Dokumen No. 56)
    {
      question: 'Alamat IPv6: FE80:0000:0000:0000:0204:61FF:FE9D:F156. Siswa menyederhanakan menjadi: FE80::204:61FF:FE9D:F156. Argumen paling tepat menilai hasil penyederhanaan tersebut adalah ...',
      options: [
        'Benar; FE80::204:61FF:FE9D:F156 adalah bentuk paling ringkas yang memenuhi dua aturan penyederhanaan IPv6',
        'Salah; :: hanya boleh digunakan jika ada minimal empat blok nol berurutan',
        'Salah; leading zero pada grup 0204 tidak boleh dihapus',
        'Benar hanya untuk menghapus leading zero; :: tidak seharusnya digunakan karena grup nol tidak berurutan',
        'Salah; :: hanya boleh digunakan di awal atau akhir alamat'
      ],
      correctAnswer: 0,
    },
    // 27 (Dokumen No. 87)
    {
      question: 'Siswa mengklaim EUI-64 dari MAC B8:27:EB:12:34:56 menghasilkan Interface ID BA:27:EB:FF:FE:12:34:56. Verifikasi: L1: B8:27:EB | 12:34:56 ✓. L2: B8:27:EB:FF:FE:12:34:56 ✓. L3: B8=10111000, bit ke-7 dari kiri=0, dibalik=1 → 10111010=BA ✓. Seorang validator mengklaim \'Hasil BA salah; seharusnya BC.\' Berdasarkan klaim validator tersebut, manakah analisis yang benar tentang hasil konversi EUI-64?',
      options: [
        'Validator benar; bit ke-7 dari kiri pada 10111000 menghasilkan 10111100=BC',
        'Validator benar; bit ke-7 adalah bit ke-7 dari kanan (LSB ke-7) sehingga hasilnya berbeda',
        'Siswa benar; bit ke-7 dari kiri pada 10111000 adalah bit kedua dari kanan yang bernilai 0; membaliknya menghasilkan 10111010=BA. Validator salah menghitung posisi bit',
        'Keduanya salah; bit yang harus dibalik adalah bit ke-1 (MSB) menghasilkan 00111000=38',
        'Validator benar; BC memang hasil yang benar dari operasi EUI-64 pada oktet B8'
      ],
      correctAnswer: 2,
    },
    // 28 (Dokumen No. 58)
    {
      question: 'Admin merencanakan IPv6 Global Unicast: Subnet-1 prefix 2001:DB8:1:1::/64, Subnet-2 prefix 2001:DB8:1:2::/64, keduanya menggunakan gateway ID ::1. Urutan langkah BENAR untuk menentukan alamat gateway Subnet-1 adalah ...',
      options: [
        'Pilih prefix 2001:DB8:1:1 → tambah ID ::1 → tulis 2001:DB8:1:1::1/64 → verifikasi: dimulai 2001: = Global Unicast',
        'Gunakan FE80:: sebagai prefix → tambah ID ::1 → tulis FE80::1:1::1/64',
        'Pilih prefix → sisipkan FF:FE → balik bit ke-7 → tulis 2001:DB8:1:1:02FF:FFFE::1/64',
        'Pilih prefix FC00: → tulis FC00:DB8:1:1::1/64',
        'Gunakan FF00:: sebagai prefix → tulis FF00:1:1::1/64'
      ],
      correctAnswer: 0,
    },
    // 29 (Dokumen No. 59)
    {
      question: 'Seorang siswa menyatakan: \'IPv6 selalu lebih baik dari IPv4 dalam semua aspek sehingga tidak ada alasan untuk tetap menggunakan IPv4.\' Berdasarkan pernyataan tersebut, manakah kesimpulan yang tepat tentang perbandingan IPv4 dan IPv6?',
      options: [
        'Benar; IPv6 unggul di semua aspek dan IPv4 harus segera dihentikan',
        'Benar; IPv6 lebih aman, lebih besar, dan lebih efisien sehingga IPv4 tidak relevan',
        'Tidak tepat; meskipun IPv6 unggul dalam kapasitas alamat, keamanan, dan efisiensi routing, IPv4 masih banyak digunakan karena kompatibilitas perangkat lama, biaya migrasi, dan infrastruktur yang sudah mapan',
        'Salah; IPv4 lebih baik karena lebih sederhana dan terbukti stabil selama puluhan tahun',
        'Tidak dapat dinilai; perbandingan bergantung sepenuhnya pada kebijakan tiap negara'
      ],
      correctAnswer: 2,
    },
    // 30 (Dokumen No. 60)
    {
      question: 'Dalam arsitektur model TCP/IP, protokol TCP bekerja di lapisan Transport sedangkan protokol IP bekerja di lapisan Network. Pernyataan yang paling tepat mengenai hubungan keterkaitan antara kedua protokol tersebut adalah ...',
      options: [
        'Protokol TCP dan IP bekerja secara sepenuhnya independen di mana masing-masing dapat berjalan tanpa membutuhkan kehadiran protokol lain.',
        'Protokol IP sangat bergantung pada TCP karena tanpa adanya jabat tangan TCP maka IP tidak dapat menjalankan fungsi pengalamatan dan routing.',
        'Protokol TCP membutuhkan IP untuk mengirimkan segmennya, tetapi IP bersifat protocol-agnostic sehingga bisa membawa protokol lain seperti UDP.',
        'Protokol TCP dan IP merupakan satu kesatuan fungsional yang berada pada lapisan yang sama sehingga tugas dan perannya tidak dapat dipisahkan.',
        'Protokol IP beroperasi aktif di lapisan Transport dengan tujuan untuk membantu TCP dalam menjamin keandalan pengiriman paket data ke tujuan.'
      ],
      correctAnswer: 2,
    }
  ] as TestQuestion[],
};

import { lesson1Stages } from './lesson1Stages';
import { lesson2Stages } from './lesson2Stages';
import { lesson3Stages } from './lesson3Stages';
import { lesson4Stages } from './lesson4Stages';

export const lessons: Record<string, Lesson> = {
  '1': {
    id: '1',
    title: 'Pertemuan 1',
    topic: 'Konsep Dasar TCP/IP',
    description: 'Konsep Dasar TCP/IP, Model Lapisan TCP/IP, dan Proses Transmisi Data (Encapsulation & Decapsulation)',
    objectives: ['X.TCP.1', 'X.TCP.2', 'X.TCP.3', 'X.TCP.4', 'X.TCP.5', 'X.TCP.6', 'X.TCP.7', 'X.TCP.8', 'X.TCP.9', 'X.TCP.10'],
    initialCompetencies: [
      'Peserta didik telah mengenal penggunaan komputer dan internet dalam kehidupan sehari-hari serta memahami secara umum fungsi jaringan komputer',
      'Peserta didik juga memiliki kemampuan dasar dalam mengikuti pembelajaran, berpikir logis sederhana, serta menunjukkan sikap disiplin dan tanggung jawab dalam penggunaan teknologi',
    ],
    materials: ['Konsep Dasar TCP/IP', 'Lapisan Protokol TCP/IP', 'Alur Transmisi Data (Encapsulation & Decapsulation)'],
    pretest: {
      questions: [
        {
          question: 'Apa kepanjangan dari TCP?',
          options: ['Transmission Control Protocol', 'Transfer Control Protocol', 'Technical Control Protocol', 'Transport Control Protocol'],
          correctAnswer: 0,
        },
        {
          question: 'TCP bekerja pada lapisan mana dalam model TCP/IP?',
          options: ['Network Access Layer', 'Internet Layer', 'Transport Layer', 'Application Layer'],
          correctAnswer: 2,
        },
        {
          question: 'Field TCP Header manakah yang digunakan untuk mendeteksi kerusakan data?',
          options: ['Sequence Number', 'Window Size', 'Checksum', 'Source Port'],
          correctAnswer: 2,
        },
      ],
    },
    stages: lesson1Stages,
    posttest: {
      questions: [
        {
          question: 'Manakah yang merupakan karakteristik utama TCP?',
          options: ['Connectionless', 'Connection-oriented', 'Stateless', 'Best-effort delivery'],
          correctAnswer: 1,
        },
        {
          question: 'Urutan lapisan TCP/IP dari atas ke bawah dalam proses encapsulation adalah...',
          options: [
            'Network Access → Internet → Transport → Application',
            'Application → Transport → Internet → Network Access',
            'Transport → Application → Network Access → Internet',
            'Internet → Transport → Application → Network Access',
          ],
          correctAnswer: 1,
        },
        {
          question: 'Field TCP Header yang berperan dalam menyusun ulang segmen yang tiba tidak berurutan adalah...',
          options: ['Checksum', 'Window Size', 'Sequence Number', 'Destination Port'],
          correctAnswer: 2,
        },
      ],
    },
  },
  '2': {
    id: '2',
    title: 'Pertemuan 2',
    topic: 'Mekanisme TCP',
    description: 'Mekanisme kerja TCP seperti TCP Header, TCP Sequence Number, dan TCP Theree-Way Handshake',
    objectives: ['X.TCP.4', 'X.TCP.5', 'X.TCP.8', 'X.TCP.9', 'X.TCP.10'],
    initialCompetencies: ['Konsep dasar TCP', 'Komponen TCP Header'],
    materials: ['Three-Way Handshake', 'Flow Control (Windowing)', 'Congestion Control'],
    pretest: {
      questions: [
        {
          question: 'Proses pembukaan koneksi pada TCP disebut...',
          options: ['Two-way handshake', 'Three-way handshake', 'Four-way handshake', 'Direct connection'],
          correctAnswer: 1,
        },
        {
          question: 'Flag TCP mana yang digunakan untuk memulai sinkronisasi nomor urut?',
          options: ['ACK', 'FIN', 'SYN', 'PSH'],
          correctAnswer: 2,
        },
        {
          question: 'Field Window Size digunakan untuk tujuan...',
          options: ['Routing paket', 'Deteksi error', 'Mengatur aliran data (Flow Control)', 'Enkripsi data'],
          correctAnswer: 2,
        },
      ],
    },
    stages: lesson2Stages,
    posttest: {
      questions: [
        {
          question: 'Urutan paket yang benar dalam three-way handshake adalah...',
          options: ['SYN, SYN-ACK, ACK', 'SYN, ACK, SYN-ACK', 'ACK, SYN, SYN-ACK', 'SYN, SYN, ACK'],
          correctAnswer: 0,
        },
        {
          question: 'Apa arti dari nilai Window Size = 0 dalam paket TCP?',
          options: [
            'Koneksi terputus',
            'Penerima tidak sanggup menerima data lagi sementara waktu',
            'Pengiriman data telah selesai',
            'Data yang dikirim rusak',
          ],
          correctAnswer: 1,
        },
        {
          question: 'Mekanisme Slow Start digunakan dalam tahap...',
          options: ['Error Detection', 'Congestion Control', 'Handshake', 'Decapsulation'],
          correctAnswer: 1,
        },
      ],
    },
  },
  '3': {
    id: '3',
    title: 'Pertemuan 3',
    topic: 'Internet Protocol Version 4 (IPv4)',
    description: 'IP Header, Struktur, Kelas, Range Kelas, dan Pengalamatan IPv4 pada TCP/IP',
    objectives: ['X.IP.1', 'X.IP.3', 'X.IP.4', 'X.IP.9', 'X.IP.10'],
    initialCompetencies: ['Dasar IP', 'Biner Dasar'],
    materials: ['Struktur IPv4', 'Kelas IP (A, B, C)', 'Konversi Biner-Desimal', 'Manajemen IP'],
    pretest: {
      questions: [
        {
          question: 'Berapa jumlah bit total dalam satu alamat IPv4?',
          options: ['16 bit', '32 bit', '64 bit', '128 bit'],
          correctAnswer: 1,
        },
        {
          question: 'Berapakah nilai desimal dari biner 11000000?',
          options: ['128', '192', '168', '224'],
          correctAnswer: 1,
        },
        {
          question: 'Alamat 10.1.1.1 termasuk dalam kelas IP...',
          options: ['Kelas A', 'Kelas B', 'Kelas C', 'Kelas D'],
          correctAnswer: 0,
        },
      ],
    },
    stages: lesson3Stages,
    posttest: {
      questions: [
        {
          question: 'Subnet mask standar untuk alamat IP Kelas C adalah...',
          options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'],
          correctAnswer: 2,
        },
        {
          question: 'Apa yang terjadi jika dua komputer dalam satu jaringan lokal menggunakan IP yang sama?',
          options: [
            'Keduanya akan saling berbagi bandwidth',
            'Terjadi konflik IP dan koneksi menjadi tidak stabil',
            'Router akan otomatis mengganti salah satu IP',
            'Kecepatan internet akan meningkat dua kali lipat',
          ],
          correctAnswer: 1,
        },
        {
          question: 'Alamat IP 172.16.0.100 termasuk dalam rentang kelas...',
          options: ['Kelas A', 'Kelas B', 'Kelas C', 'Kelas D'],
          correctAnswer: 1,
        },
      ],
    },
  },
  '4': {
    id: '4',
    title: 'Pertemuan 4',
    topic: 'Internet Protocol Version 6 (IPv6)',
    description: 'Struktur IPv6, Pembentukan IPv6 Link Local Address, Penyederhanaan IPv6, dan Hubungan IPv4/IPv6',
    objectives: ['X.IPv6.1', 'X.IPv6.3', 'X.IPv6.8', 'X.IPv6.9', 'X.IPv6.10'],
    initialCompetencies: ['Dasar IPv4', 'Heksadesimal Dasar'],
    materials: ['Krisis IPv4', 'Struktur 128-bit IPv6', 'Kompresi Alamat', 'Strategi Transisi'],
    pretest: {
      questions: [
        {
          question: 'Berapa jumlah bit total dalam satu alamat IPv6?',
          options: ['32 bit', '64 bit', '128 bit', '256 bit'],
          correctAnswer: 2,
        },
        {
          question: 'Sistem bilangan apa yang digunakan untuk menulis alamat IPv6?',
          options: ['Desimal', 'Biner', 'Oktal', 'Heksadesimal'],
          correctAnswer: 3,
        },
        {
          question: 'Simbol apa yang digunakan untuk memisahkan blok pada IPv6?',
          options: ['Titik (.)', 'Titik Dua (:)', 'Koma (,)', 'Strip (-)'],
          correctAnswer: 1,
        },
      ],
    },
    stages: lesson4Stages,
    posttest: {
      questions: [
        {
          question: 'Manakah penulisan kompresi IPv6 yang benar untuk "2001:0db8:0000:0000:0000:0000:0000:0001"?',
          options: ['2001:db8:1', '2001:db8::1', '2001:db8:0:1', '2001:db8::0::1'],
          correctAnswer: 1,
        },
        {
          question: 'Metode transisi yang menjalankan IPv4 dan IPv6 secara bersamaan dalam satu perangkat disebut...',
          options: ['Tunneling', 'NAT64', 'Dual Stack', 'Translation'],
          correctAnswer: 2,
        },
        {
          question: 'Alamat loopback pada IPv6 adalah...',
          options: ['::1', '127.0.0.1', 'fe80::1', 'ff00::1'],
          correctAnswer: 0,
        },
      ],
    },
  },
};
