import type { Stage } from './lessons';

export const lesson3Stages: Stage[] = [
  {
    type: 'constructivism',
    title: 'Constructivism',
    description:
      'Siswa memahami kebutuhan alamat unik dalam jaringan melalui analogi sistem pengiriman surat.',
    objectiveCode: 'X.IP.1',
    activityGuide: [
      'Tonton video, lalu susun hierarki alamat surat dengan drag & drop dari paling umum ke paling spesifik.',
      'Tulis alasan mengapa alamat IP harus unik — tidak boleh ada dua perangkat dengan IP sama.',
    ],
    apersepsi:
      'Bayangkan kamu mengirim surat ke teman, tapi kamu hanya menuliskan nama "Budi" tanpa nomor rumah, nama jalan, atau nama kota. Apakah surat itu akan sampai? Begitu juga di internet, miliaran perangkat butuh alamat yang sangat spesifik dan unik agar data tidak salah kirim.',
    videoUrl: 'https://www.youtube.com/embed/8K4H-S-5Dls', // IPv4 explanation
    storyScramble: {
      instruction:
        'Susun urutan hierarki alamat di bawah ini mulai dari yang paling umum (luas) ke yang paling spesifik (detail).',
      fragments: [
        { id: 'f1', text: 'Nama Negara (Indonesia)', order: 1 },
        { id: 'f2', text: 'Nama Kota (Bandung)', order: 2 },
        { id: 'f3', text: 'Nama Jalan (Jl. Merdeka)', order: 3 },
        { id: 'f4', text: 'Nomor Rumah (No. 10)', order: 4 },
        { id: 'f5', text: 'Nama Penerima (Dina)', order: 5 },
      ],
      successMessage:
        'Hebat! Alamat IP juga memiliki hierarki yang mirip: ada bagian Jaringan (Network) dan bagian Perangkat (Host).',
    },
    constructivismEssay1:
      'Menurutmu, mengapa sebuah alamat IP harus unik dan tidak boleh ada dua perangkat dengan IP yang sama di jaringan yang sama?',
  },
  {
    type: 'inquiry',
    title: 'Inquiry',
    description:
      'Siswa mengeksplorasi struktur 32-bit IPv4 dan pembagian kelas alamat (A, B, C).',
    objectiveCode: 'X.IP.3',
    activityGuide: [
      'Gunakan IPv4 Analyzer untuk melihat konversi IP dari desimal ke biner 32-bit.',
      'Pelajari rentang angka setiap kelas IP (A, B, C) melalui panel eksplorasi.',
      'Kelompokkan contoh alamat IP ke dalam kelas yang sesuai dengan drag & drop.',
    ],
    material: {
      title: 'Struktur Alamat IPv4',
      content: [
        'IPv4 terdiri dari 32-bit biner yang dibagi menjadi 4 bagian (oktet). Untuk memudahkan manusia, biner ini diubah menjadi angka desimal bertitik (contoh: 192.168.1.1).',
        'Alamat IP dibagi menjadi kelas-kelas berdasarkan angka di oktet pertama: Kelas A (1-126), Kelas B (128-191), dan Kelas C (192-223).',
      ],
      examples: [
        '10.0.0.1 (Kelas A - Jaringan Sangat Besar)',
        '172.16.0.1 (Kelas B - Jaringan Menengah)',
        '192.168.1.1 (Kelas C - Jaringan Kecil/Lokal)',
      ],
    },
    explorationSections: [
      {
        id: 'e1',
        title: 'Format Dotted Decimal',
        content:
          'Setiap oktet (8-bit) memiliki rentang nilai 0 sampai 255. Jika ada IP 256.0.0.1, maka itu bukan alamat IPv4 yang valid.',
      },
      {
        id: 'e2',
        title: 'Network ID vs Host ID',
        content:
          'Network ID menunjukkan "ID Jalan/Perumahan", sedangkan Host ID menunjukkan "Nomor Rumah" perangkat tersebut.',
      },
      {
        id: 'e3',
        title: 'Subnet Mask',
        content:
          'Alat bantu untuk membedakan mana bagian Network dan mana bagian Host. Contoh standar: Kelas C menggunakan 255.255.255.0.',
      },
    ],
    groups: [
      { id: 'clA', label: 'Kelas A (1-126)', colorClass: 'blue' },
      { id: 'clB', label: 'Kelas B (128-191)', colorClass: 'green' },
      { id: 'clC', label: 'Kelas C (192-223)', colorClass: 'purple' },
    ],
    groupItems: [
      { id: 'i1', text: '10.10.10.1', correctGroup: 'clA' },
      { id: 'i2', text: '172.16.50.10', correctGroup: 'clB' },
      { id: 'i3', text: '192.168.1.100', correctGroup: 'clC' },
      { id: 'i4', text: '8.8.8.8', correctGroup: 'clA' },
      { id: 'i5', text: '191.255.255.255', correctGroup: 'clB' },
      { id: 'i6', text: '200.1.1.1', correctGroup: 'clC' },
    ],
  },
  {
    type: 'questioning',
    title: 'Questioning',
    description:
      'Siswa menganalisis kegagalan koneksi akibat konflik IP atau kesalahan identitas jaringan.',
    objectiveCode: 'X.IP.4',
    activityGuide: [
      'Amati skenario "Duplicate IP Address" pada dua komputer di lab.',
      'Pilih field header atau mekanisme yang paling relevan untuk mendeteksi konflik.',
      'Jelaskan solusi teknis untuk memperbaiki konflik tanpa mematikan router.',
    ],
    problemVisual: {
      icon: '🚫',
      title: 'IP Address Conflict',
      description:
        'Laptop A dan Laptop B sama-masing memiliki alamat 192.168.1.5. Saat keduanya aktif, koneksi internet mereka terputus secara bergantian.',
      problemType: 'collision',
    },
    teacherQuestion:
      'Jika terjadi konflik IP, perangkat mana yang akan menang dan mendapatkan koneksi? Atau apakah keduanya gagal?',
    scenario:
      'Di sebuah kantor, seorang karyawan baru menyeting IP laptopnya secara manual menjadi 192.168.1.10. Ternyata, alamat tersebut sudah digunakan oleh Printer Server kantor. Akibatnya, Printer tidak bisa diakses oleh karyawan lain.',
    whyQuestion:
      'Mengapa Router bingung saat ada dua perangkat menggunakan IP yang sama?',
    reasonOptions: [
      {
        id: 'r1',
        text: 'Router tidak tahu harus mengirimkan data balik ke MAC Address yang mana karena tujuannya ambigu.',
        isCorrect: true,
        feedback:
          'Tepat! Router mengirim data berdasarkan tabel ARP. Jika ada dua perangkat dengan satu IP, Router akan kebingungan menentukan tujuan pengiriman fisik (MAC).',
      },
      {
        id: 'r2',
        text: 'Router akan meledak jika menerima dua sinyal dari IP yang sama.',
        isCorrect: false,
        feedback:
          'Tentu tidak. Router hanya akan mengalami kegagalan logika pengiriman, bukan kerusakan fisik.',
      },
      {
        id: 'r3',
        text: 'Router akan otomatis menggabungkan kedua perangkat tersebut menjadi satu perangkat super.',
        isCorrect: false,
        feedback:
          'Tidak mungkin. Setiap perangkat tetap independen, namun koneksi mereka akan saling bertabrakan.',
      },
    ],
  },
  {
    type: 'learning-community',
    title: 'Learning Community',
    description:
      'Siswa berkolaborasi merancang pengalamatan IP untuk jaringan Lab Komputer baru.',
    objectiveCode: 'X.IP.4',
    activityGuide: [
      'Baca kebutuhan Lab: 20 PC siswa, 1 PC guru, 1 server — total 22 host.',
      'Pilih rentang IP Kelas C paling efisien, tulis argumen, lalu kirim ke kelompok.',
      'Diskusikan dan beri vote: apakah rentang ini cukup untuk pengembangan masa depan?',
    ],
    encapsulationCase: {
      id: 'X.IP.4.B',
      title: 'Studi Kasus: Desain Jaringan Lab',
      scenario: 'Sekolah ingin membangun Lab Komputer baru dengan 30 PC. Teknisi menyarankan menggunakan blok IP 192.168.10.0/24.',
      question: 'Manakah strategi pemberian IP yang paling rapi dan mudah dikelola menurut kelompokmu?',
      options: [
        {
          id: 'A',
          text: 'Memberikan IP secara urut: Server (1), Guru (2), lalu Siswa (11-40).',
          description: 'Fokus pada kerapian urutan.'
        },
        {
          id: 'B',
          text: 'Memberikan IP secara acak agar tidak mudah ditebak oleh orang luar.',
          description: 'Fokus pada asumsi keamanan (kurang tepat untuk manajemen).'
        },
        {
          id: 'C',
          text: 'Menggunakan DHCP (otomatis) sepenuhnya tanpa ada reservasi untuk server.',
          description: 'Fokus pada kepraktisan total.'
        }
      ]
    },
    decapsulationCase: {
      id: 'X.IP.4.C',
      title: 'Studi Kasus: Subnetting Sederhana',
      scenario: 'Lab A dan Lab B ingin dipisahkan agar trafiknya tidak saling mengganggu, meskipun menggunakan satu router yang sama.',
      question: 'Bagaimana cara terbaik memisahkan identitas jaringan kedua lab tersebut?',
      options: [
        {
          id: 'A',
          text: 'Menggunakan Subnet Mask yang berbeda atau segmen Network ID yang berbeda (misal: 192.168.1.x dan 192.168.2.x).',
          description: 'Fokus pada isolasi logika jaringan.'
        },
        {
          id: 'B',
          text: 'Mengecat kabel LAN Lab A warna merah dan Lab B warna biru.',
          description: 'Hanya identitas fisik, tidak berpengaruh pada logika IP.'
        },
        {
          id: 'C',
          text: 'Membatasi jam operasional Lab A dan Lab B agar tidak bersamaan.',
          description: 'Solusi manajemen waktu, bukan teknis jaringan.'
        }
      ]
    },
    groupActivity: {
      groupNames: ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'],
      discussionPrompt: 'Tentukan apakah membagi jaringan menjadi beberapa segmen kecil lebih baik daripada satu jaringan besar. Berikan vote pada alasan teknis terbaik.',
    }
  },
  {
    type: 'modeling',
    title: 'Modeling',
    description:
      'Siswa mempraktikkan pengubahan format IPv4 dari desimal ke biner untuk memahami cara komputer membaca alamat.',
    objectiveCode: 'X.IP.3',
    activityGuide: [
      'Ikuti demonstrasi konversi satu oktet (8-bit) dari desimal ke biner.',
      'Selesaikan tantangan: ubah angka 192 dan 168 ke bentuk biner (0 dan 1).',
      'Gabungkan bit-bit tersebut menjadi alamat IP 32-bit yang utuh.',
    ],
    practiceInstructions: {
      forTeacher: [
        'Gunakan papan tulis digital untuk menunjukkan bobot bit (128, 64, 32, 16, 8, 4, 2, 1).',
        'Demokan cara menghitung: 192 = 128 + 64 (bit 1 dan 2 aktif, sisanya 0).',
        'Jelaskan bahwa 255 berarti seluruh 8 bit bernilai 1.',
      ],
      forStudent: [
        'Aktifkan bit-bit yang sesuai untuk membentuk angka desimal yang diminta.',
        'Verifikasi apakah total jumlah bit selalu 32 untuk satu alamat IPv4.',
        'Klik "Jalankan Proses" untuk melihat hasil konversi otomatis.',
      ],
    },
    modelingSteps: [
      {
        id: 'ipm1',
        type: 'example',
        title: 'Langkah 1: Memahami Bobot Oktet',
        content:
          'Setiap bagian IP (oktet) terdiri dari 8 kotak biner. Kotak paling kiri bernilai 128, kotak berikutnya 64, dan seterusnya sampai kotak paling kanan bernilai 1.',
        interactiveAction: 'Lihat tabel referensi bobot bit.',
      },
      {
        id: 'ipm2',
        type: 'example',
        title: 'Langkah 2: Konversi Angka 192',
        content:
          'Untuk mendapatkan 192, kita butuh 128 + 64. Maka bit 128 diisi "1", bit 64 diisi "1", sisanya "0". Hasilnya: 11000000.',
        interactiveAction: 'Simak peragaan aktivasi bit.',
      },
      {
        id: 'ipm3',
        type: 'practice',
        title: 'Langkah 3: Tantangan Biner',
        content:
          'Sekarang giliranmu. Jika oktet ketiga adalah "10", bit mana saja yang harus bernilai "1"? (Petunjuk: 8 + 2).',
        interactiveAction: 'Klik "Jalankan Proses" setelah kamu menentukan posisi bit 8 dan 2.',
      },
    ],
  },
  {
    type: 'reflection',
    title: 'Reflection',
    description:
      'Siswa menyusun struktur hierarki IPv4 dan mengevaluasi keterbatasan jumlah alamat IPv4.',
    objectiveCode: 'X.IP.9',
    activityGuide: [
      'Hubungkan konsep Kelas IP, Subnet Mask, dan Host dengan memilih label yang tepat.',
      'Tulis refleksi: mengapa dunia mulai kehabisan alamat IPv4?',
      'Nilai kemampuanmu dalam menentukan kelas IP secara cepat.',
    ],
    conceptMapNodes: [
      { id: 'cn1', label: 'IPv4', description: 'Alamat 32-bit.', colorClass: 'blue' },
      { id: 'cn2', label: 'Oktet', description: 'Bagian 8-bit dari IP.', colorClass: 'purple' },
      { id: 'cn3', label: 'Kelas C', description: 'Untuk jaringan kecil.', colorClass: 'green' },
      { id: 'cn4', label: 'Subnet Mask', description: 'Pemisah Network dan Host.', colorClass: 'amber' },
      { id: 'cn5', label: 'Private IP', description: 'Digunakan di jaringan lokal.', colorClass: 'pink' },
    ],
    conceptMapConnections: [
      { from: 'cn1', to: 'cn2', label: 'terdiri dari 4', options: ['terdiri dari 4', 'menghapus', 'mengabaikan', 'mengakhiri'] },
      { from: 'cn3', to: 'cn4', label: 'memiliki standar', options: ['memiliki standar', 'menolak', 'menyembunyikan', 'mempercepat'] },
      { from: 'cn1', to: 'cn5', label: 'memiliki jenis', options: ['memiliki jenis', 'menghindari', 'mengganti', 'merusak'] },
    ],
    essayReflection: {
      materialSummaryPrompt:
        'Jelaskan perbedaan mendasar antara Kelas A, B, dan C berdasarkan jumlah maksimal perangkat (host) yang bisa ditampung.',
      easyPartPrompt:
        'Apakah konversi desimal ke biner terasa sulit? Bagian mana yang paling menantang?',
      hardPartPrompt:
        'Mengapa kita butuh Subnet Mask? Bisakah komputer bekerja hanya dengan IP saja?',
    },
    selfEvaluationCriteria: [
      { id: 'sc1', label: 'Saya memahami struktur 32-bit IPv4.' },
      { id: 'sc2', label: 'Saya dapat membedakan Kelas A, B, dan C.' },
      { id: 'sc3', label: 'Saya dapat mengubah angka desimal sederhana ke biner.' },
      { id: 'sc4', label: 'Saya memahami dampak jika IP perangkat tidak unik (konflik).' },
    ],
  },
  {
    type: 'authentic-assessment',
    title: 'Authentic Assessment',
    description:
      'Siswa merancang skema pengalamatan IP untuk sebuah jaringan UMKM.',
    objectiveCode: 'X.IP.10',
    activityGuide: [
      'Baca data aset UMKM: 5 Laptop, 1 Server Kasir, 1 WiFi Router — total 7 perangkat.',
      'Rancang alamat IP masing-masing perangkat menggunakan standar Kelas C.',
      'Jelaskan alasan pemilihan angka untuk kemudahan maintenance.',
    ],
    branchingScenario: {
      context:
        'Sebuah kedai kopi butuh bantuanmu menyeting jaringan. Mereka punya 1 WiFi Router (Gateway), 1 Server Kasir, dan 3 Tablet untuk pelayan. Teknisi sebelumnya meninggalkan catatan: "Gunakan segmen 192.168.1.0/24".',
      initialQuestion:
        'Berapakah alamat IP yang paling standar dan logis untuk diberikan pada WiFi Router sebagai pintu keluar (Gateway)?',
      choices: [
        {
          id: 'c1',
          text: '192.168.1.1',
          isOptimal: true,
          consequence:
            'Pilihan yang sangat umum dan profesional. Angka pertama (.1) biasanya dicadangkan untuk gateway agar mudah diingat.',
          followUpQuestion:
            'Jika Server Kasir harus memiliki IP statis (tetap), berapakah alamat yang cocok agar tidak tertukar dengan tablet pelayan?',
          followUpChoices: [
            {
              id: 'f1a',
              text: '192.168.1.10 (Memberi jarak dari gateway untuk perangkat infrastruktur penting).',
              isCorrect: true,
              explanation: 'Sangat bagus. Memberi jarak (range) antara gateway, server, dan client adalah praktik manajemen IP yang baik.',
            },
            {
              id: 'f1b',
              text: '192.168.1.255',
              isCorrect: false,
              explanation: 'Salah. Alamat .255 adalah alamat Broadcast, tidak bisa diberikan pada perangkat tunggal.',
            }
          ],
        },
        {
          id: 'c2',
          text: '192.168.1.50',
          isOptimal: false,
          consequence:
            'Boleh saja, tapi tidak lazim. Biasanya gateway berada di angka awal (.1) atau angka akhir (.254). Ini bisa membingungkan teknisi lain nantinya.',
          followUpQuestion:
            'Setelah menyadari .50 tidak umum, apakah kamu ingin memindahkannya ke .1?',
          followUpChoices: [
            {
               id: 'f2a',
               text: 'Ya, pindahkan ke 192.168.1.1 untuk mengikuti standar industri.',
               isCorrect: true,
               explanation: 'Konsistensi dengan standar memudahkan proses troubleshooting di masa depan.'
            }
          ]
        },
      ],
      finalEvaluation:
        'Tunjukkan kemampuanmu dalam merancang jaringan yang tidak hanya jalan, tapi juga rapi dan mengikuti standar industri.',
    },
  },
];
