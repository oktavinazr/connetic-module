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
    colorClass: 'blue' | 'green' | 'purple' | 'amber';
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
  description: 'Tes ini mengukur pemahaman awal Anda tentang jaringan komputer',
  questions: [
    {
      question: 'Apa kepanjangan dari TCP/IP?',
      options: [
        'Transmission Control Protocol/Internet Protocol',
        'Transfer Control Protocol/Internet Protocol',
        'Technical Control Protocol/Internet Protocol',
        'Transmission Connection Protocol/Internet Protocol',
      ],
      correctAnswer: 0,
    },
    {
      question: 'Apa fungsi utama IP Address?',
      options: [
        'Mengidentifikasi perangkat dalam jaringan',
        'Mempercepat koneksi internet',
        'Mengenkripsi data',
        'Menyimpan data',
      ],
      correctAnswer: 0,
    },
    {
      question: 'Berapa bit yang digunakan dalam IPv4?',
      options: ['16 bit', '32 bit', '64 bit', '128 bit'],
      correctAnswer: 1,
    },
    {
      question: 'Apa perbedaan utama IPv4 dan IPv6?',
      options: [
        'Jumlah bit dan kapasitas alamat',
        'Kecepatan koneksi',
        'Tingkat keamanan',
        'Tidak ada perbedaan',
      ],
      correctAnswer: 0,
    },
    {
      question: 'Protokol manakah yang connection-oriented?',
      options: ['UDP', 'TCP', 'HTTP', 'FTP'],
      correctAnswer: 1,
    },
  ] as TestQuestion[],
};

export const globalPosttest = {
  title: 'Post-Test Umum',
  description: 'Tes ini mengukur pemahaman akhir Anda setelah menyelesaikan semua pertemuan',
  questions: [
    {
      question: 'Dalam three-way handshake TCP, urutan paket yang benar adalah...',
      options: ['SYN, ACK, SYN-ACK', 'SYN, SYN-ACK, ACK', 'ACK, SYN, SYN-ACK', 'SYN-ACK, SYN, ACK'],
      correctAnswer: 1,
    },
    {
      question: 'IP Address 172.16.50.10 termasuk kelas...',
      options: ['Kelas A', 'Kelas B', 'Kelas C', 'Kelas D'],
      correctAnswer: 1,
    },
    {
      question: 'Alamat loopback IPv6 adalah...',
      options: ['::1', '127.0.0.1', 'fe80::1', 'ff00::1'],
      correctAnswer: 0,
    },
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
