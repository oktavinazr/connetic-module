import type { Stage } from './lessons';

export const lesson2Stages: Stage[] = [
  {
    type: 'constructivism',
    title: 'Constructivism',
    description:
      'Siswa membangun pemahaman awal tentang mekanisme pembukaan koneksi (handshake) melalui analogi percakapan sehari-hari.',
    objectiveCode: 'X.TCP.8',
    activityGuide: [
      'Tonton video, lalu susun potongan percakapan handshake dengan drag & drop hingga urutannya logis.',
      'Tulis alasan mengapa kesiapan kedua pihak harus dipastikan sebelum data dikirim.',
    ],
    apersepsi:
      'Pernahkah kamu menelepon teman, lalu langsung bicara panjang lebar tanpa memastikan dia sudah menjawab "Halo"? Apa yang terjadi jika ternyata dia belum siap mendengarkan? Dalam jaringan, komputer juga harus memastikan "kesiapan" lawan bicaranya sebelum mengirim data penting...',
    videoUrl: 'https://www.youtube.com/embed/F27P9S91Z0A', // TCP Three-way handshake explanation
    storyScramble: {
      instruction:
        'Dua orang, Budi dan Siti, ingin melakukan transaksi jual beli via telepon. Susun urutan percakapan yang paling aman agar tidak ada informasi yang terlewat.',
      fragments: [
        {
          id: 'f1',
          text: 'Budi: "Halo Siti, apakah kamu bisa mendengar saya? Saya ingin memesan kue."',
          order: 1,
        },
        {
          id: 'f2',
          text: 'Siti: "Halo Budi! Ya, saya dengar jelas. Apakah kamu juga bisa mendengar suara saya?"',
          order: 2,
        },
        {
          id: 'f3',
          text: 'Budi: "Ya Siti, suara kamu jelas. Oke, ini rincian pesanannya: 2 kue cokelat..."',
          order: 3,
        },
      ],
      successMessage:
        'Tepat! Inilah inti dari Three-Way Handshake: Pastikan pengirim siap, penerima siap, dan keduanya tahu bahwa mereka saling terhubung.',
    },
    constructivismEssay1:
      'Mengapa dalam jaringan komputer kita tidak boleh langsung mengirim data tanpa tahap "kenalan" (handshake) terlebih dahulu?',
  },
  {
    type: 'inquiry',
    title: 'Inquiry',
    description:
      'Siswa mengeksplorasi field TCP Flags (SYN, ACK) dan mekanisme Windowing untuk mengatur aliran data.',
    objectiveCode: 'X.TCP.4 & X.TCP.5',
    activityGuide: [
      'Pelajari fungsi TCP Flags (SYN, ACK, FIN) melalui panel eksplorasi interaktif.',
      'Cocokkan setiap jenis Flag dengan fungsinya menggunakan klik-pasangkan.',
      'Analisis bagaimana Window Size mengatur jumlah data yang boleh dikirim sekaligus.',
    ],
    material: {
      title: 'Mekanisme Kontrol TCP',
      content: [
        'TCP menggunakan Flags (bendera) kecil dalam headernya untuk memberi tanda khusus: SYN (Synchronize) untuk memulai, dan ACK (Acknowledgment) untuk mengonfirmasi.',
        'Flow Control dilakukan dengan field Window Size, yang memberi tahu pengirim: "Eh, jangan kirim terlalu cepat, gudang (buffer) saya cuma muat sekian!".',
      ],
      examples: [
        'SYN: "Ayo mulai koneksi!"',
        'ACK: "Oke, data paket nomor sekian sudah saya terima."',
        'Window Size: "Saya cuma bisa terima 1000 byte lagi."',
      ],
    },
    explorationSections: [
      {
        id: 'e1',
        title: 'SYN Flag (Synchronize)',
        content:
          'Digunakan saat langkah pertama pembukaan koneksi. Pengirim mengirimkan paket dengan Flag SYN aktif untuk mengajak sinkronisasi nomor urut.',
      },
      {
        id: 'e2',
        title: 'ACK Flag (Acknowledgment)',
        content:
          'Digunakan untuk mengonfirmasi bahwa paket telah diterima dengan sukses. Hampir semua paket setelah SYN pertama akan memiliki Flag ACK yang aktif.',
      },
      {
        id: 'e3',
        title: 'Window Size (Aliran Data)',
        content:
          'Mekanisme Flow Control. Jika penerima merasa kewalahan (buffer penuh), ia akan memperkecil nilai Window Size agar pengirim melambatkan kirimannya.',
      },
    ],
    matchingPairs: [
      { left: 'SYN', right: 'Mengajak memulai koneksi baru.' },
      { left: 'ACK', right: 'Mengonfirmasi penerimaan data.' },
      { left: 'FIN', right: 'Meminta penutupan koneksi secara normal.' },
      { left: 'Window Size', right: 'Mengatur jumlah data yang boleh dikirim tanpa konfirmasi.' },
    ],
    inquiryReflection1:
      'Apa yang akan terjadi jika nilai Window Size diatur menjadi 0 oleh pihak penerima?',
  },
  {
    type: 'questioning',
    title: 'Questioning',
    description:
      'Siswa menganalisis masalah Flow Control ketika terjadi penumpukan data di sisi penerima.',
    objectiveCode: 'X.TCP.5',
    activityGuide: [
      'Amati skenario "Receiver Overflow": data datang lebih cepat dari kemampuan proses penerima.',
      'Pilih field header TCP yang harus disesuaikan untuk menyelamatkan koneksi.',
      'Jelaskan alasan mengapa solusi flow control lebih baik daripada memutus koneksi.',
    ],
    problemVisual: {
      icon: '⚠️',
      title: 'Receiver Buffer Overload',
      description:
        'Server menerima ribuan baris data per detik, namun aplikasi pengolah data di server sedang sibuk (lag). Buffer (memori sementara) server hampir penuh.',
      problemType: 'delay',
    },
    teacherQuestion:
      'Jika server sudah tidak sanggup menerima data lagi karena memorinya penuh, pesan apa yang harus dikirim balik ke pengirim?',
    scenario:
      'Sebuah komputer pengirim (Client) mengirimkan file video besar ke Server. Di tengah jalan, Server mengalami beban kerja tinggi sehingga proses penyimpanan ke disk melambat. Jika Client terus mengirim dengan kecepatan tinggi, paket data akan mulai dibuang (dropped).',
    whyQuestion:
      'Mekanisme TCP manakah yang paling tepat digunakan server untuk mencegah kehilangan data dalam situasi ini?',
    reasonOptions: [
      {
        id: 'r1',
        text: 'Mengirimkan paket Reset (RST) untuk memutuskan koneksi seketika.',
        isCorrect: false,
        feedback:
          'Memutus koneksi (RST) akan menggagalkan seluruh transfer file. Ini bukan solusi untuk aliran data yang terlalu cepat, melainkan untuk error fatal.',
      },
      {
        id: 'r2',
        text: 'Mengirimkan nilai Window Size yang lebih kecil (atau 0) dalam paket ACK.',
        isCorrect: true,
        feedback:
          'Tepat! Dengan memperkecil Window Size, server memberi tahu pengirim untuk mengerem kecepatannya sampai buffer server kosong kembali. Inilah inti Flow Control.',
      },
      {
        id: 'r3',
        text: 'Mengabaikan semua paket yang datang (silent drop) sampai server siap.',
        isCorrect: false,
        feedback:
          'Mengabaikan paket akan memicu pengirim untuk mengirim ulang paket yang sama (retransmission), yang justru menambah beban jaringan.',
      },
    ],
  },
  {
    type: 'learning-community',
    title: 'Learning Community',
    description:
      'Siswa berdiskusi dalam kelompok untuk menentukan strategi terbaik dalam menangani kemacetan jaringan (Congestion Control).',
    objectiveCode: 'X.TCP.5',
    activityGuide: [
      'Baca skenario kemacetan pada jalur uplink internet sekolah.',
      'Pilih jawaban strategi pengiriman, tulis argumen, lalu kirim ke kelompok.',
      'Diskusikan dan beri vote pada argumen terbaik di papan diskusi kelompok.',
    ],
    encapsulationCase: {
      id: 'X.TCP.5.B',
      title: 'Studi Kasus: Kemacetan Jalur (Congestion)',
      scenario: 'Jalur internet di Lab Komputer sedang sangat padat karena banyak yang melakukan update software bersamaan. Paket data mulai hilang di router pusat.',
      question: 'Bagaimana seharusnya perilaku TCP pada laptop siswa saat mendeteksi adanya paket yang hilang di tengah jaringan?',
      options: [
        {
          id: 'A',
          text: 'Langsung membagi dua kecepatan pengiriman (Slow Start/Congestion Avoidance) untuk memberi ruang pada jaringan agar pulih.',
          description: 'Fokus pada kesehatan jaringan secara umum.'
        },
        {
          id: 'B',
          text: 'Tetap mengirim dengan kecepatan tinggi dan melakukan retransmisi agresif agar data cepat sampai meskipun macet.',
          description: 'Fokus pada prioritas data sendiri.'
        },
        {
          id: 'C',
          text: 'Menunggu selama 10 detik tanpa mengirim apa-apa, baru kemudian mencoba lagi dengan kecepatan penuh.',
          description: 'Fokus pada penghentian total sementara.'
        }
      ]
    },
    decapsulationCase: {
      id: 'X.TCP.5.C',
      title: 'Studi Kasus: Efisiensi vs Keandalan',
      scenario: 'Aplikasi streaming video butuh data cepat. Namun, TCP selalu menunggu konfirmasi (ACK) sebelum mengirim data berikutnya jika Window sudah habis.',
      question: 'Apa dampak positif dari mekanisme "menunggu konfirmasi" ini bagi kualitas video yang ditonton pengguna?',
      options: [
        {
          id: 'A',
          text: 'Memastikan tidak ada potongan gambar (frame) yang hilang atau berantakan, meskipun mungkin terjadi buffering sejenak.',
          description: 'Mengutamakan keutuhan gambar.'
        },
        {
          id: 'B',
          text: 'Membuat video lebih cerah warnanya karena TCP mengoptimalkan kualitas bit warna di setiap paket.',
          description: 'Asumsi optimasi konten (kurang tepat).'
        },
        {
          id: 'C',
          text: 'Mengurangi penggunaan baterai laptop karena prosesor tidak perlu bekerja keras saat menunggu ACK.',
          description: 'Efisiensi daya.'
        }
      ]
    },
    groupActivity: {
      groupNames: ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'],
      discussionPrompt: 'Diskusikan mengapa TCP harus "mengalah" saat jaringan macet. Berikan vote pada argumen yang paling logis.',
    }
  },
  {
    type: 'modeling',
    title: 'Modeling',
    description:
      'Siswa mensimulasikan proses Three-Way Handshake antara Client dan Server langkah demi langkah.',
    objectiveCode: 'X.TCP.8',
    activityGuide: [
      'Ikuti simulasi Three-Way Handshake langkah demi langkah secara runtut.',
      'Klik untuk mengirim SYN, balas dengan SYN-ACK, lalu kirim ACK final.',
      'Amati perubahan status koneksi dari CLOSED → ESTABLISHED.',
    ],
    practiceInstructions: {
      forTeacher: [
        'Tunjukkan bagaimana Client memulai dengan nomor urut acak (Initial Sequence Number).',
        'Jelaskan bahwa SYN-ACK adalah satu-satunya paket di mana dua flag aktif sekaligus untuk efisiensi.',
        'Tekankan bahwa data aplikasi hanya boleh dikirim SETELAH langkah ketiga (ACK) selesai.',
      ],
      forStudent: [
        'Klik tombol untuk mengirim SYN dari sisi Client.',
        'Klik tombol untuk merespons dengan SYN-ACK dari sisi Server.',
        'Selesaikan jabat tangan dengan mengirim ACK terakhir.',
      ],
    },
    modelingSteps: [
      {
        id: 'tm1',
        type: 'example',
        title: 'Langkah 1: Client mengirim SYN',
        content:
          'Client ingin terhubung. Ia mengirim paket dengan flag SYN=1 dan nomor urut (misalnya: 100). Ini artinya: "Saya ingin sinkronisasi mulai dari nomor 100".',
        interactiveAction: 'Kirim SYN dari Client ke Server.',
      },
      {
        id: 'tm2',
        type: 'example',
        title: 'Langkah 2: Server membalas SYN-ACK',
        content:
          'Server menerima SYN. Ia setuju dan mengirim balik flag SYN=1 (untuk sinkronisasinya sendiri) dan ACK=1 (mengonfirmasi ia menerima nomor 100 dengan mengirim ACK=101).',
        interactiveAction: 'Balas dengan SYN-ACK dari Server.',
      },
      {
        id: 'tm3',
        type: 'practice',
        title: 'Langkah 3: Client mengirim ACK',
        content:
          'Client menerima konfirmasi server. Sekarang Client mengirim flag ACK=1 untuk mengonfirmasi SYN milik server. Koneksi kini resmi TERBUKA (Established).',
        interactiveAction: 'Klik "Jalankan Proses" untuk mengirim ACK terakhir dan membuka jalur data.',
      },
    ],
  },
  {
    type: 'reflection',
    title: 'Reflection',
    description:
      'Siswa merangkum mekanisme keandalan TCP melalui peta konsep dan refleksi kritis.',
    objectiveCode: 'X.TCP.9',
    activityGuide: [
      'Hubungkan konsep Flags, Handshake, dan Flow Control dengan memilih label yang tepat.',
      'Tulis refleksi: mengapa TCP disebut protokol yang andal (reliable)?',
      'Nilai pemahamanmu tentang perbedaan mekanisme kontrol dalam TCP.',
    ],
    conceptMapNodes: [
      { id: 'cn1', label: 'Handshake', description: 'Proses pembukaan koneksi.', colorClass: 'blue' },
      { id: 'cn2', label: 'SYN', description: 'Flag untuk sinkronisasi awal.', colorClass: 'purple' },
      { id: 'cn3', label: 'ACK', description: 'Flag untuk konfirmasi paket.', colorClass: 'purple' },
      { id: 'cn4', label: 'Flow Control', description: 'Pengaturan kecepatan aliran data.', colorClass: 'green' },
      { id: 'cn5', label: 'Window Size', description: 'Field yang menentukan kuota data.', colorClass: 'amber' },
      { id: 'cn6', label: 'Congestion Control', description: 'Pencegahan kemacetan jaringan.', colorClass: 'pink' },
    ],
    conceptMapConnections: [
      { from: 'cn1', to: 'cn2', label: 'dimulai dengan', options: ['dimulai dengan', 'menghapus', 'mengabaikan', 'mengakhiri'] },
      { from: 'cn1', to: 'cn3', label: 'membutuhkan', options: ['membutuhkan', 'menolak', 'menyembunyikan', 'mempercepat'] },
      { from: 'cn4', to: 'cn5', label: 'menggunakan', options: ['menggunakan', 'menghindari', 'mengganti', 'merusak'] },
      { from: 'cn6', to: 'cn4', label: 'bekerja sama dengan', options: ['bekerja sama dengan', 'berlawanan dengan', 'tidak terkait dengan', 'menghambat'] },
    ],
    essayReflection: {
      materialSummaryPrompt:
        'Jelaskan secara singkat bagaimana Three-Way Handshake dan Windowing memastikan data terkirim dengan aman dan tidak membuat server kewalahan.',
      easyPartPrompt:
        'Antara mekanisme Handshake dan Flow Control, mana yang lebih mudah kamu bayangkan analoginya? Jelaskan!',
      hardPartPrompt:
        'Apa yang masih membuatmu bingung tentang cara kerja bendera (Flags) SYN dan ACK?',
    },
    selfEvaluationCriteria: [
      { id: 'sc1', label: 'Saya memahami urutan Three-Way Handshake.' },
      { id: 'sc2', label: 'Saya dapat menjelaskan fungsi SYN dan ACK flags.' },
      { id: 'sc3', label: 'Saya memahami cara kerja Flow Control menggunakan Window Size.' },
      { id: 'sc4', label: 'Saya mampu menganalisis dampak buffer penuh pada sisi penerima.' },
      { id: 'sc5', label: 'Saya dapat berargumen tentang strategi penanganan kemacetan jaringan.' },
    ],
  },
  {
    type: 'authentic-assessment',
    title: 'Authentic Assessment',
    description:
      'Siswa mendiagnosis masalah koneksi "Slow Connection" pada server web perusahaan.',
    objectiveCode: 'X.TCP.10',
    activityGuide: [
      'Analisis log trafik: banyak retransmisi dan window size kecil — baca dengan teliti.',
      'Pilih diagnosis: masalah handshake gagal atau aliran data tersumbat.',
      'Jelaskan alasan dan berikan rekomendasi perbaikan teknis yang paling tepat.',
    ],
    branchingScenario: {
      context:
        'Kamu bekerja sebagai tim IT Support. Pengguna mengeluh aplikasi web internal sangat lambat. Hasil tangkapan paket (Wireshark) menunjukkan: SYN dikirim, SYN-ACK diterima, tapi ACK terakhir sering terlambat. Selain itu, nilai Window Size dari server terus menurun hingga mendekati 0 saat banyak user login.',
      initialQuestion:
        'Berdasarkan data "Window Size mendekati 0", apa kesimpulan awalmu mengenai letak masalahnya?',
      choices: [
        {
          id: 'c1',
          text: 'Masalah ada di kapasitas pemrosesan Server (Server-side bottleneck).',
          isOptimal: true,
          consequence:
            'Analisis cerdas! Window Size 0 adalah cara Server berkata "Tunggu, saya sedang sibuk memproses data sebelumnya". Ini berarti server kewalahan.',
          followUpQuestion:
            'Apa langkah perbaikan yang paling logis untuk jangka panjang agar Window Size tidak sering nol?',
          followUpChoices: [
            {
              id: 'f1a',
              text: 'Meningkatkan spek RAM/CPU server atau optimasi database aplikasi agar buffer cepat kosong.',
              isCorrect: true,
              explanation: 'Tepat. Jika aplikasi memproses data lebih cepat, buffer akan cepat kosong dan Window Size akan kembali besar.',
            },
            {
              id: 'f1b',
              text: 'Mengganti kabel jaringan dengan serat optik agar paket SYN sampai lebih cepat.',
              isCorrect: false,
              explanation: 'Kabel jaringan tidak akan membantu jika masalahnya adalah buffer aplikasi server yang penuh.',
            }
          ],
        },
        {
          id: 'c2',
          text: 'Masalah ada di kabel jaringan yang putus-nyambung di sisi Client.',
          isOptimal: false,
          consequence:
            'Kurang tepat. Jika kabel putus-nyambung, biasanya gejalanya adalah Timeout atau SYN tidak terbalas, bukan Window Size yang menurun perlahan hingga 0.',
          followUpQuestion:
            'Setelah menyadari bahwa koneksi fisik client normal, ke mana kamu akan mengalihkan fokus investigasi?',
          followUpChoices: [
            {
               id: 'f2a',
               text: 'Memeriksa statistik penggunaan resource (CPU/RAM) pada Server.',
               isCorrect: true,
               explanation: 'Ini langkah yang benar untuk melihat apakah server kewalahan memproses antrean data TCP.'
            }
          ]
        },
      ],
      finalEvaluation:
        'Gunakan pemahaman mekanisme TCP untuk membedakan antara gangguan fisik (kabel) dan gangguan logis (buffer/aliran data).',
    },
  },
];
