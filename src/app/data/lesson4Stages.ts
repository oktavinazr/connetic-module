import type { Stage } from './lessons';

export const lesson4Stages: Stage[] = [
  {
    type: 'constructivism',
    title: 'Constructivism',
    description:
      'Siswa menyadari keterbatasan sumber daya alamat digital melalui analogi pertumbuhan penduduk.',
    objectiveCode: 'X.IPv6.1',
    activityGuide: [
      'Tonton video krisis IPv4, lalu susun tahapan pertumbuhan perangkat internet dengan drag & drop.',
      'Tulis pendapatmu: apa yang terjadi jika alamat habis tapi perangkat terus bertambah?',
    ],
    apersepsi:
      'Pernahkah kamu membayangkan apa yang terjadi jika semua orang di dunia punya 10 gadget yang butuh internet? IPv4 hanya punya 4 miliar alamat. Penduduk bumi saja sudah 8 miliar. Kita butuh "gudang alamat" yang jauh lebih besar agar semua perangkat bisa terhubung...',
    videoUrl: 'https://www.youtube.com/embed/a7S-H6_Xyv0', // IPv6 intro
    storyScramble: {
      instruction:
        'Susun tahapan bagaimana dunia menyadari kebutuhan IPv6.',
      fragments: [
        { id: 'f1', text: 'Internet diciptakan dengan IPv4 (4 miliar alamat).', order: 1 },
        { id: 'f2', text: 'Perangkat mobile dan IoT meledak jumlahnya.', order: 2 },
        { id: 'f3', text: 'Alamat IPv4 mulai habis di berbagai wilayah dunia.', order: 3 },
        { id: 'f4', text: 'IPv6 diperkenalkan dengan jumlah alamat hampir tak terbatas.', order: 4 },
      ],
      successMessage:
        'Tepat! IPv6 lahir bukan karena gaya-gayaan, tapi karena kebutuhan mendesak akan ruang alamat.',
    },
    constructivismEssay1:
      'Jika IPv4 hanya punya 4,3 miliar alamat, mengapa kita baru merasa "kurang" sekarang, bukan 20 tahun yang lalu?',
  },
  {
    type: 'inquiry',
    title: 'Inquiry',
    description:
      'Siswa mengeksplorasi format 128-bit Heksadesimal pada IPv6 dan teknik penyederhanaannya.',
    objectiveCode: 'X.IPv6.3',
    activityGuide: [
      'Pelajari struktur IPv6 128-bit dengan 8 blok heksadesimal melalui panel eksplorasi.',
      'Praktikkan aturan kompresi: hapus leading zero dan ganti blok nol berurutan dengan ::.',
      'Identifikasi jenis alamat khusus IPv6 seperti Loopback (::1) dan Link-Local.',
    ],
    material: {
      title: 'Struktur Alamat IPv6',
      content: [
        'IPv6 menggunakan 128-bit yang ditulis dalam 8 blok heksadesimal, dipisahkan oleh titik dua (contoh: 2001:0db8:85a3:0000:0000:8a2e:0370:7334).',
        'Karena sangat panjang, ada aturan kompresi: Nol di depan boleh dihapus, dan blok nol berurutan bisa diganti dengan titik dua ganda (::) satu kali.',
      ],
      examples: [
        '2001:db8::1 (Alamat Global)',
        'fe80:: (Alamat Link-Local)',
        '::1 (Alamat Loopback)',
      ],
    },
    explorationSections: [
      {
        id: 'e1',
        title: 'Format Heksadesimal',
        content:
          'Berbeda dengan IPv4 yang pakai angka 0-9, IPv6 pakai angka 0-9 dan huruf A-F. Ini memberikan kombinasi yang jauh lebih masif.',
      },
      {
        id: 'e2',
        title: 'Zero Compression (Rule 1)',
        content:
          'Nol di posisi paling depan setiap blok bisa dihilangkan. Contoh: 0db8 jadi db8.',
      },
      {
        id: 'e3',
        title: 'Double Colon (Rule 2)',
        content:
          'Kumpulan blok yang isinya nol semua bisa disingkat jadi "::". Tapi ingat, "::" cuma boleh muncul satu kali dalam satu alamat!',
      },
    ],
    matchingPairs: [
      { left: '2001::/3', right: 'Global Unicast (Internet Publik)' },
      { left: 'fe80::/10', right: 'Link-Local (Hanya jaringan lokal)' },
      { left: 'fc00::/7', right: 'Unique Local (Seperti Private IP)' },
      { left: '::1', right: 'Loopback Address' },
    ],
  },
  {
    type: 'questioning',
    title: 'Questioning',
    description:
      'Siswa menganalisis tantangan transisi dari IPv4 ke IPv6 dalam infrastruktur sekolah.',
    objectiveCode: 'X.IPv6.8',
    activityGuide: [
      'Amati skenario "Incompatibility": Laptop IPv6 tidak bisa akses Server IPv4 langsung.',
      'Pilih strategi transisi (Dual Stack vs Tunneling) yang paling tepat.',
      'Jelaskan alasan teknis mengapa strategi tersebut paling masuk akal.',
    ],
    problemVisual: {
      icon: '🔌',
      title: 'The Language Barrier',
      description:
        'Server Web sekolah sudah pakai IPv6, tapi beberapa PC lama di ruang Guru masih pakai Windows XP yang cuma paham IPv4.',
      problemType: 'delay',
    },
    teacherQuestion:
      'Dapatkah sebuah kabel jaringan yang sama membawa trafik IPv4 dan IPv6 secara bersamaan?',
    scenario:
      'Sebuah ISP memberikan layanan internet berbasis IPv6. Namun, router di rumah pelanggan hanya mendukung IPv4. Pelanggan tersebut tidak bisa browsing ke website yang hanya tersedia di IPv6.',
    whyQuestion:
      'Manakah metode yang paling disarankan agar perangkat IPv4 tetap bisa berkomunikasi di era IPv6?',
    reasonOptions: [
      {
        id: 'r1',
        text: 'Dual Stack, di mana perangkat menjalankan kedua protokol secara berdampingan.',
        isCorrect: true,
        feedback:
          'Tepat. Dual Stack adalah cara paling aman karena perangkat punya "dua identitas" dan bisa bicara dalam dua bahasa sekaligus.',
      },
      {
        id: 'r2',
        text: 'Mematikan seluruh jaringan IPv4 di dunia dalam satu malam.',
        isCorrect: false,
        feedback:
          'Mustahil dilakukan karena miliaran perangkat lama masih bergantung pada IPv4.',
      },
      {
        id: 'r3',
        text: 'Tunneling, membungkus paket IPv6 di dalam paket IPv4.',
        isCorrect: true, // Also technically correct for specific scenarios
        feedback:
          'Benar, ini solusi bagus untuk menghubungkan "pulau IPv6" melewati "samudra IPv4".',
      },
    ],
  },
  {
    type: 'learning-community',
    title: 'Learning Community',
    description:
      'Siswa berdiskusi tentang masa depan internet dengan IPv6 dan IoT (Internet of Things).',
    objectiveCode: 'X.IPv6.8',
    activityGuide: [
      'Baca artikel Smart City: jutaan sensor IoT butuh alamat unik.',
      'Pilih jawaban, tulis argumen mengapa IPv6 kunci Smart City, lalu kirim ke kelompok.',
      'Diskusikan dan beri vote pada argumen paling visioner dan logis secara teknis.',
    ],
    encapsulationCase: {
      id: 'X.IPv6.8.B',
      title: 'Studi Kasus: Smart Agriculture',
      scenario: 'Seorang petani ingin memasang 1000 sensor kelembapan tanah di kebunnya. Semua sensor butuh koneksi internet mandiri.',
      question: 'Apa keuntungan menggunakan IPv6 murni (tanpa NAT) untuk ribuan sensor ini?',
      options: [
        {
          id: 'A',
          text: 'Setiap sensor punya IP publik unik sehingga bisa dipantau langsung dari manapun tanpa settingan router yang rumit.',
          description: 'Fokus pada end-to-end connectivity.'
        },
        {
          id: 'B',
          text: 'Sensor jadi lebih tahan air karena protokol IPv6 memiliki lapisan perlindungan fisik.',
          description: 'Asumsi salah (protokol tidak berpengaruh pada fisik perangkat).'
        },
        {
          id: 'C',
          text: 'Sinyal WiFi sensor jadi lebih kuat karena IPv6 memancarkan gelombang yang lebih tajam.',
          description: 'Asumsi salah (protokol tidak mengubah daya pancar radio).'
        }
      ]
    },
    decapsulationCase: {
      id: 'X.IPv6.8.C',
      title: 'Studi Kasus: Keamanan Header',
      scenario: 'Header IPv6 dirancang lebih simpel namun memiliki dukungan IPsec (keamanan) yang lebih kuat sejak awal.',
      question: 'Bagaimana hal ini membantu transaksi perbankan di masa depan?',
      options: [
        {
          id: 'A',
          text: 'Mempermudah enkripsi data dari ujung ke ujung (end-to-end encryption) secara standar.',
          description: 'Fokus pada integrasi keamanan.'
        },
        {
          id: 'B',
          text: 'Bank tidak perlu lagi menggunakan password karena IP sudah cukup membuktikan identitas.',
          description: 'Berbahaya (IP bisa dipalsukan/spoofed).'
        },
        {
          id: 'C',
          text: 'Saldo nasabah otomatis bertambah karena efisiensi pengiriman data paket.',
          description: 'Tidak logis.'
        }
      ]
    },
    groupActivity: {
      groupNames: ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'],
      discussionPrompt: 'Diskusikan apakah kita harus segera migrasi total ke IPv6 atau tetap menggunakan IPv4 selama mungkin. Berikan vote pada solusi yang paling realistis.',
    }
  },
  {
    type: 'modeling',
    title: 'Modeling',
    description:
      'Siswa mensimulasikan teknik kompresi alamat IPv6 agar lebih ringkas dan mudah dikelola.',
    objectiveCode: 'X.IPv6.3',
    activityGuide: [
      'Amati alamat IPv6 panjang penuh nol, lalu hapus leading zero di setiap blok.',
      'Terapkan aturan :: (double colon) untuk menyingkat blok nol berurutan.',
      'Verifikasi hasil kompresi: pastikan alamat tetap valid dan tidak ambigu.',
    ],
    practiceInstructions: {
      forTeacher: [
        'Tunjukkan alamat: 2001:0db8:0000:0000:0000:0000:0000:0001.',
        'Hapus nol depan: 2001:db8:0:0:0:0:0:1.',
        'Gunakan :: untuk blok tengah: 2001:db8::1.',
        'Peringatkan siswa: Jangan gunakan :: dua kali!',
      ],
      forStudent: [
        'Ketik ulang alamat yang sudah dikompres sesuai aturan.',
        'Verifikasi apakah jumlah blok tetap logis (maksimal 8 blok tersembunyi).',
        'Klik "Jalankan Proses" untuk cek validitas kompresimu.',
      ],
    },
    modelingSteps: [
      {
        id: 'v6m1',
        type: 'example',
        title: 'Langkah 1: Menghapus Nol Depan',
        content:
          'Alamat: 2001:0001:00ab:0000:... menjadi 2001:1:ab:0:... Cukup hapus angka 0 yang berada di posisi paling kiri dalam satu blok.',
        interactiveAction: 'Simak animasi penghapusan nol.',
      },
      {
        id: 'v6m2',
        type: 'example',
        title: 'Langkah 2: Menyingkat Blok Kosong',
        content:
          'Jika ada :0:0:0:, kita bisa ganti dengan ::. Contoh: fe80:0:0:0:1 menjadi fe80::1.',
        interactiveAction: 'Simak penggunaan simbol ::.',
      },
      {
        id: 'v6m3',
        type: 'practice',
        title: 'Langkah 3: Tantangan Kompresi',
        content:
          'Singkatlah alamat ini: 2001:0db8:0000:0000:1234:0000:0000:0567.',
        interactiveAction: 'Klik "Jalankan Proses" setelah kamu memikirkan bentuk paling singkatnya.',
      },
    ],
  },
  {
    type: 'reflection',
    title: 'Reflection',
    description:
      'Siswa merangkum perbedaan IPv4 dan IPv6 serta mengevaluasi kesiapan migrasi.',
    objectiveCode: 'X.IPv6.9',
    activityGuide: [
      'Hubungkan konsep Bit Length, Format Heksadesimal, dan Fitur Keamanan dengan label yang tepat.',
      'Tulis refleksi: apa kendala utama migrasi IPv6 di Indonesia?',
      'Nilai pemahamanmu tentang teknik kompresi alamat IPv6.',
    ],
    conceptMapNodes: [
      { id: 'cn1', label: 'IPv6', description: 'Alamat 128-bit.', colorClass: 'blue' },
      { id: 'cn2', label: 'Heksadesimal', description: 'Basis bilangan 16.', colorClass: 'purple' },
      { id: 'cn3', label: 'Kompresi', description: 'Aturan penyederhanaan.', colorClass: 'green' },
      { id: 'cn4', label: 'Dual Stack', description: 'Metode transisi.', colorClass: 'amber' },
      { id: 'cn5', label: 'IoT', description: 'Masa depan perangkat internet.', colorClass: 'pink' },
    ],
    conceptMapConnections: [
      { from: 'cn1', to: 'cn2', label: 'menggunakan format', options: ['menggunakan format', 'menghapus', 'mengabaikan', 'mengakhiri'] },
      { from: 'cn1', to: 'cn3', label: 'memerlukan teknik', options: ['memerlukan teknik', 'menolak', 'menyembunyikan', 'mempercepat'] },
      { from: 'cn1', to: 'cn4', label: 'memiliki metode', options: ['memiliki metode', 'menghindari', 'mengganti', 'merusak'] },
      { from: 'cn5', to: 'cn1', label: 'sangat membutuhkan', options: ['sangat membutuhkan', 'berlawanan dengan', 'tidak terkait dengan', 'menghambat'] },
    ],
    essayReflection: {
      materialSummaryPrompt:
        'Sebutkan 3 perbedaan utama antara IPv4 dan IPv6 yang paling krusial bagi perkembangan internet.',
      easyPartPrompt:
        'Bagian mana yang lebih menyenangkan: Menghitung biner IPv4 atau mengompres heksa IPv6?',
      hardPartPrompt:
        'Mengapa teknik Dual Stack dianggap paling aman meskipun boros penggunaan resource?',
    },
    selfEvaluationCriteria: [
      { id: 'sc1', label: 'Saya memahami struktur 128-bit IPv6.' },
      { id: 'sc2', label: 'Saya mahir melakukan kompresi nol pada IPv6.' },
      { id: 'sc3', label: 'Saya memahami perbedaan Global Unicast dan Link-Local.' },
      { id: 'sc4', label: 'Saya dapat menjelaskan tantangan migrasi IPv4 ke IPv6.' },
    ],
  },
  {
    type: 'authentic-assessment',
    title: 'Authentic Assessment',
    description:
      'Siswa merancang strategi implementasi IPv6 pada jaringan sekolah menengah.',
    objectiveCode: 'X.IPv6.10',
    activityGuide: [
      'Analisis kondisi sekolah: 50% perangkat IPv4 lama, 50% perangkat baru IPv6-ready.',
      'Pilih metode transisi (Dual Stack / Tunneling / Translation) yang paling aman.',
      'Jelaskan rencana bertahap: dari testing → migrasi bertahap → IPv6 penuh.',
    ],
    branchingScenario: {
      context:
        'Sekolahmu mendapat hibah bandwith internet 1Gbps murni IPv6. Kamu sebagai admin harus merancang agar Lab Komputer yang berisi PC Windows 7 dan Laptop Windows 11 tetap bisa internetan.',
      initialQuestion:
        'Strategi mana yang pertama kali kamu terapkan di Router utama sekolah?',
      choices: [
        {
          id: 'c1',
          text: 'Mengaktifkan Dual Stack (Router menangani IPv4 dan IPv6 sekaligus).',
          isOptimal: true,
          consequence:
            'Keputusan yang sangat tepat. Perangkat lama tetap pakai IPv4, perangkat baru bisa mulai pakai IPv6. Transisi berjalan mulus tanpa downtime.',
          followUpQuestion:
            'Jika ada website penting yang HANYA bisa diakses via IPv4, sedangkan ISP sekolah HANYA kasih IPv6, teknik apa yang kamu pakai?',
          followUpChoices: [
            {
              id: 'f1a',
              text: 'NAT64 / DNS64 (Menerjemahkan alamat IPv6 ke IPv4 agar bisa "tembus" ke website lama).',
              isCorrect: true,
              explanation: 'Sangat profesional. NAT64 adalah standar industri untuk menjembatani dunia IPv6 ke website-website IPv4 yang masih ada.',
            },
            {
              id: 'f1b',
              text: 'Meminta pemilik website tersebut untuk segera ganti server.',
              isCorrect: false,
              explanation: 'Bukan wewenangmu dan tidak menyelesaikan masalah akses segera bagi siswa.',
            }
          ],
        },
        {
          id: 'c2',
          text: 'Langsung mematikan IPv4 dan memaksa semua PC pakai IPv6.',
          isOptimal: false,
          consequence:
            'Kacau! PC Windows 7 lama milik guru-guru tidak bisa konek sama sekali karena driver kartunya belum support IPv6 dengan baik. Komplain bermunculan.',
          followUpQuestion:
            'Setelah terjadi kekacauan, apa langkah mitigasi tercepatmu?',
          followUpChoices: [
            {
               id: 'f2a',
               text: 'Menghidupkan kembali IPv4 dan mulai merancang Dual Stack.',
               isCorrect: true,
               explanation: 'Mengakui kesalahan dan kembali ke jalur yang lebih aman adalah langkah teknisi yang bijak.'
            }
          ]
        },
      ],
      finalEvaluation:
        'Tunjukkan bahwa kamu mampu menjaga stabilitas jaringan sambil mengadopsi teknologi terbaru.',
    },
  },
];
