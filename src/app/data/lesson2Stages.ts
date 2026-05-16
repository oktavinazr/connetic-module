import type { Stage } from './lessons';

export const lesson2Stages: Stage[] = [
  {
    type: 'constructivism',
    title: 'Constructivism',
    description:
      'Siswa membangun pemahaman awal tentang cara TCP memastikan data tiba utuh dan berurutan melalui mekanisme handshake dan sequence number.',
    objectiveCode: 'X.TCP.9',
    activityGuide: [
      'Susun 6 potongan cerita tentang pengiriman data TCP menjadi urutan yang logis menggunakan drag & drop.',
      'Tulis refleksi mandiri: mengapa kesiapan kedua pihak harus dipastikan sebelum data dikirim.',
      'Lanjutkan ke aktivitas Process Chain untuk mengurutkan tahapan TCP Three-Way Handshake.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mengidentifikasi TCP Header beserta fungsinya pada protokol TCP',
      condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif pada CONNETIC Module',
      degree: 'dengan tepat',
    },
    apersepsi:
      'Pernahkah kamu menelepon teman, lalu langsung bicara panjang lebar tanpa memastikan dia sudah menjawab "Halo"? Apa yang terjadi jika ternyata dia belum siap mendengarkan? Dalam jaringan, komputer juga harus memastikan "kesiapan" lawan bicaranya sebelum mengirim data penting. Inilah inti dari mekanisme TCP!',
    storyScramble: {
      instruction:
        'Sebuah komputer ingin mengirim file video besar ke server melalui jaringan internet. Bagaimana TCP memastikan seluruh bagian file sampai dengan utuh dan berurutan? Susun 6 potongan cerita berikut menjadi alur yang logis.',
      fragments: [
        {
          id: 'f1',
          text: 'Komputer pengirim (Client) memulai koneksi dengan mengirim sinyal SYN kepada server tujuan untuk memastikan server siap menerima data.',
          order: 1,
        },
        {
          id: 'f2',
          text: 'Server menerima SYN dan menjawab dengan sinyal SYN-ACK sebagai tanda bahwa ia siap terhubung dan siap menerima data.',
          order: 2,
        },
        {
          id: 'f3',
          text: 'Client mengirim sinyal ACK terakhir untuk mengkonfirmasi, sehingga koneksi TCP resmi terbuka — Three-Way Handshake selesai.',
          order: 3,
        },
        {
          id: 'f4',
          text: 'File video dipecah menjadi banyak segmen; setiap segmen diberi Sequence Number agar penerima bisa menyusun kembali data dengan urutan yang benar.',
          order: 4,
        },
        {
          id: 'f5',
          text: 'Setiap kali segmen berhasil diterima, server mengirim ACK (Acknowledgment) untuk mengonfirmasi nomor segmen berikutnya yang diharapkan.',
          order: 5,
        },
        {
          id: 'f6',
          text: 'Jika ada segmen yang tidak mendapat ACK dalam batas waktu tertentu, TCP secara otomatis mengirim ulang segmen tersebut hingga terkonfirmasi.',
          order: 6,
        },
      ],
      successMessage:
        'Tepat! Inilah cara TCP bekerja: Three-Way Handshake membuka koneksi, Sequence Number menjaga urutan, dan ACK memastikan tidak ada data yang hilang.',
    },
    constructivismEssay1:
      'Berdasarkan alur cerita yang baru saja kamu susun, jelaskan mengapa TCP harus melakukan "jabat tangan" (Three-Way Handshake) sebelum mengirim data! Tulis dengan kata-katamu sendiri.',
    analogySortGroups: [
      { id: 'twh', label: 'Tahapan Three-Way Handshake TCP', colorClass: 'blue' },
    ],
    analogySortItems: [
      {
        id: 'ap1',
        text: 'Client mengirim paket SYN dengan Sequence Number acak (ISN) untuk memulai koneksi.',
        courierAnalogy: 'Seperti kamu menelepon teman: "Halo, bisa dengar aku? Percakapan dimulai dari nomor ini."',
        correctGroup: 'twh',
        correctOrder: 1,
      },
      {
        id: 'ap2',
        text: 'Server membalas dengan SYN-ACK: mengkonfirmasi ISN Client dan mengirim ISN miliknya sendiri.',
        courierAnalogy: 'Teman menjawab: "Ya, aku dengar kamu. Ini giliran aku, sambungan dari nomor ini."',
        correctGroup: 'twh',
        correctOrder: 2,
      },
      {
        id: 'ap3',
        text: 'Client mengirim ACK untuk mengkonfirmasi ISN server, dan koneksi TCP resmi terbuka (ESTABLISHED).',
        courierAnalogy: 'Kamu balas: "Oke, aku juga dengar kamu. Siap, kita bisa mulai bicara sekarang!"',
        correctGroup: 'twh',
        correctOrder: 3,
      },
      {
        id: 'ap4',
        text: 'Data mulai dikirim dalam segmen-segmen dengan Sequence Number yang meningkat; penerima mengkonfirmasi setiap segmen dengan ACK.',
        courierAnalogy: 'Percakapan dimulai: kamu bicara poin demi poin, teman mengkonfirmasi setiap poin yang dipahami.',
        correctGroup: 'twh',
        correctOrder: 4,
      },
      {
        id: 'ap5',
        text: 'Jika ada segmen yang timeout tanpa mendapat ACK, TCP mengirim ulang segmen tersebut secara otomatis.',
        courierAnalogy: 'Jika teman tiba-tiba diam dan tidak konfirmasi, kamu ulangi apa yang kamu katakan sebelumnya.',
        correctGroup: 'twh',
        correctOrder: 5,
      },
      {
        id: 'ap6',
        text: 'Setelah semua data terkirim, koneksi ditutup dengan proses FIN-ACK secara bertahap dan aman.',
        courierAnalogy: 'Percakapan diakhiri dengan sopan: "Oke, semuanya sudah. Kita tutup sambungan. Sampai jumpa!"',
        correctGroup: 'twh',
        correctOrder: 6,
      },
    ],
    constructivismEssay2:
      'Berdasarkan tahapan Three-Way Handshake yang baru saja kamu urutkan, jelaskan apa yang terjadi jika salah satu tahapan terlewat! Mengapa ketiga langkah itu harus dilakukan secara berurutan?',
    conclusionPrompt: 'Berdasarkan aktivitas Story Scramble dan Analogy Sorting tentang Three-Way Handshake yang telah kamu lakukan, jelaskan bagaimana kamu mampu mengidentifikasi TCP Header beserta fungsinya pada protokol TCP. Tuliskan dengan tepat menggunakan kata-katamu sendiri.',
  },

  {
    type: 'inquiry',
    title: 'Inquiry',
    description:
      'Siswa mengeksplorasi field-field penting pada TCP Header dan memahami fungsi teknis masing-masing dalam menjaga keandalan pengiriman data.',
    objectiveCode: 'X.TCP.10',
    activityGuide: [
      'Buka dan pelajari tiap field TCP Header melalui panel eksplorasi interaktif.',
      'Urutkan 5 field TCP Header dari yang paling fundamental ke yang paling spesifik.',
      'Cocokkan setiap TCP Flag dengan fungsi teknisnya menggunakan klik-pasangkan.',
      'Tulis refleksi untuk memperkuat pemahaman tentang peran setiap field.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengurutkan field TCP Header berdasarkan peran fungsionalnya dalam siklus komunikasi.',
      'Analisis Fungsi: menghubungkan setiap flag TCP dengan kondisi jaringan yang memerlukannya.',
      'Refleksi Konsep: menjelaskan mengapa TCP Header lebih kompleks dibanding protokol tanpa mekanisme keandalan.',
    ],
    facilitatorNotes: [
      'Guru menekankan perbedaan antara field pengalamatan (Port) dan field kontrol aliran (Window Size, Flags).',
      'Guru mendorong siswa membayangkan kondisi jaringan yang memerlukan setiap flag: SYN saat pembukaan, FIN saat penutupan, RST saat error kritis.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menguraikan mekanisme TCP Sequence Number dalam memastikan urutan pengiriman',
      condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
      degree: 'secara runtut',
    },
    material: {
      title: 'Anatomi TCP Header',
      content: [
        'TCP Header adalah "amplop pintar" yang membungkus setiap segmen data. Di dalamnya terdapat informasi yang memungkinkan komunikasi andal, berurutan, dan terkontrol antara dua perangkat.',
        'Setiap field dalam TCP Header punya peran khusus: ada yang mengidentifikasi aplikasi (Port), ada yang menjaga urutan (Sequence Number), dan ada yang mengontrol aliran data (Window Size, Flags).',
      ],
      examples: [
        'Source Port & Destination Port: Mengidentifikasi aplikasi pengirim dan penerima (nilai 0–65535).',
        'Sequence Number: Nomor urut byte pertama dalam segmen ini.',
        'Acknowledgment Number: Nomor byte berikutnya yang diharapkan penerima.',
        'Flags (SYN/ACK/FIN/RST): Bit penanda fase dan status koneksi.',
        'Window Size: Jumlah byte yang boleh dikirim sebelum menunggu ACK (Flow Control).',
      ],
    },
    explorationSections: [
      {
        id: 'e1',
        title: 'Source Port & Destination Port',
        content:
          'Source Port (16-bit) adalah nomor port aplikasi pengirim, sedangkan Destination Port adalah nomor port aplikasi penerima. Port membedakan koneksi ke aplikasi yang berbeda di perangkat yang sama. Port 80 untuk HTTP, 443 untuk HTTPS, 22 untuk SSH.',
        example:
          'Bayangkan browser membuka dua tab ke server yang sama. Port memastikan respons tab pertama tidak masuk ke tab kedua — setiap tab punya "nomor loket" sendiri.',
      },
      {
        id: 'e2',
        title: 'Sequence Number (Nomor Urut)',
        content:
          'Sequence Number adalah nomor urut byte pertama dalam segmen ini. TCP tidak menomori segmen, melainkan menomori setiap byte. Jika ISN=1000 dan segmen membawa 500 byte, segmen berikutnya dimulai dari Seq#=1500.',
        example:
          'Seperti mengirim buku 1000 halaman via email: "Ini halaman 1–50", "Ini halaman 51–100". Penerima tahu persis cara menyusun semua halaman kembali meski tiba tidak berurutan.',
      },
      {
        id: 'e3',
        title: 'Acknowledgment Number (Nomor Konfirmasi)',
        content:
          'ACK Number adalah nomor byte berikutnya yang diharapkan penerima. Jika penerima mendapat byte 1–500 dengan benar, ia mengirim ACK=501, artinya "Kirim byte 501 berikutnya." Ini adalah konfirmasi bertahap TCP.',
        example:
          'Seperti kasir yang berteriak: "Nomor 47 selesai, silakan nomor 48!" — penerima memberi tahu pengirim tepat di mana harus melanjutkan.',
      },
      {
        id: 'e4',
        title: 'TCP Flags (SYN, ACK, FIN, RST)',
        content:
          'Flags adalah bit-bit kecil (1-bit per flag) yang menandai jenis segmen. SYN=1 saat pembukaan koneksi, ACK=1 sebagai konfirmasi, FIN=1 untuk menutup koneksi secara aman, RST=1 untuk menghentikan koneksi mendadak karena error kritis.',
        example:
          'Flags seperti sinyal tangan saat meeting: Angkat tangan (SYN) = ingin mulai, Angguk (ACK) = mengerti, Lambaikan tangan (FIN) = selesai dan pamit, Acungkan stop (RST) = hentikan sekarang!',
      },
      {
        id: 'e5',
        title: 'Window Size & Flow Control',
        content:
          'Window Size adalah jumlah byte yang boleh dikirim pengirim sebelum harus menunggu ACK. Ini adalah mekanisme Flow Control TCP. Jika penerima kewalahan, ia mengecilkan Window Size atau mengatur ke 0 (zero window) untuk meminta pengirim berhenti sementara.',
        example:
          'Seperti nampan kasir: "Aku hanya bisa terima 10 barang sekaligus." Kalau nampan penuh, kasir bilang "Tunggu dulu, jangan tambah lagi!" — Window Size=0 berarti "nampan penuh total."',
      },
    ],
    flowInstruction:
      'Urutkan 5 field TCP Header berikut berdasarkan perannya dalam siklus komunikasi TCP, dari field yang paling pertama diperlukan saat koneksi dimulai hingga yang mengatur aliran data aktif.',
    flowItems: [
      { id: 'fl1', text: 'Source & Destination Port', correctOrder: 1, description: 'Mengidentifikasi aplikasi pengirim dan penerima.', colorClass: 'purple' },
      { id: 'fl2', text: 'Sequence Number', correctOrder: 2, description: 'Menomori byte data agar bisa disusun ulang.', colorClass: 'blue' },
      { id: 'fl3', text: 'Acknowledgment Number', correctOrder: 3, description: 'Mengkonfirmasi byte berikutnya yang diharapkan.', colorClass: 'green' },
      { id: 'fl4', text: 'TCP Flags (SYN/ACK/FIN)', correctOrder: 4, description: 'Menandai fase koneksi: buka, konfirmasi, tutup.', colorClass: 'amber' },
      { id: 'fl5', text: 'Window Size', correctOrder: 5, description: 'Mengontrol kecepatan pengiriman (Flow Control).', colorClass: 'pink' },
    ],
    inquiryReflection1:
      'Jelaskan pemahamanmu tentang urutan peran 5 field TCP Header tersebut. Mengapa Sequence Number harus ditetapkan terlebih dahulu sebelum data bisa mengalir?',
    matchingPairs: [
      { left: 'SYN', right: 'Memulai sinkronisasi koneksi baru (Three-Way Handshake).' },
      { left: 'ACK', right: 'Mengkonfirmasi penerimaan data atau sinyal dari pihak lain.' },
      { left: 'FIN', right: 'Meminta penutupan koneksi secara aman dan bertahap.' },
      { left: 'RST', right: 'Menghentikan koneksi mendadak karena kondisi error kritis.' },
      { left: 'Window Size = 0', right: 'Meminta pengirim berhenti sementara karena buffer penuh.' },
    ],
    inquiryReflection2:
      'Setelah mempelajari semua field TCP Header, jelaskan mengapa TCP dianggap protokol yang "andal" (reliable) dibandingkan UDP yang tidak memiliki field Sequence Number, ACK, dan Window Size!',
    conclusionPrompt: 'Berdasarkan eksplorasi materi TCP Header dan aktivitas penyusunan field yang telah kamu lakukan, jelaskan bagaimana kamu mampu menguraikan mekanisme TCP Sequence Number dalam memastikan urutan pengiriman. Tuliskan secara runtut dengan kata-katamu sendiri.',
  },

  {
    type: 'questioning',
    title: 'Questioning',
    description:
      'Siswa menganalisis skenario segmen TCP tiba tidak berurutan dan mengidentifikasi field TCP Header yang paling berperan dalam menanganinya.',
    objectiveCode: 'X.TCP.11',
    activityGuide: [
      'Amati skenario "Out-of-Order Packets": segmen-segmen tiba di penerima dengan urutan yang kacau.',
      'Pilih field TCP Header yang paling bertanggung jawab memastikan data tetap bisa direkonstruksi.',
      'Jelaskan alasan teknis mengapa field tersebut lebih relevan dari pilihan lainnya.',
    ],
    logicalThinkingIndicators: [
      'Kemampuan Berargumen: memilih alasan teknis yang tepat berdasarkan bukti skenario.',
      'Penarikan Kesimpulan: menghubungkan gejala (segmen tidak berurutan) dengan mekanisme TCP yang tepat.',
    ],
    facilitatorNotes: [
      'Guru memancing pertanyaan: "Bagaimana komputer penerima tahu segmen mana yang seharusnya datang lebih dulu?"',
      'Guru menekankan bahwa Sequence Number adalah nomor byte, bukan nomor segmen — sehingga penerima tahu persis posisi setiap segmen dalam data asli.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu membedakan kondisi pengiriman data normal dengan kondisi yang memerlukan error recovery pada TCP berdasarkan nilai Sequence Number',
      condition: 'melalui aktivitas questioning berupa tanya jawab dua arah pada CONNETIC Module',
      degree: 'secara tepat',
    },
    problemVisual: {
      icon: '!',
      title: 'Segmen TCP Tiba Tidak Berurutan',
      description:
        'Server menerima segmen 1, 3, 5, 2, 4 — tidak berurutan! Bagaimana penerima bisa merekonstruksi data aslinya dengan benar meski urutan kedatangan kacau?',
      problemType: 'corruption',
    },
    teacherQuestion:
      'Jika gejalanya adalah segmen tiba tidak berurutan, field TCP Header mana yang paling berperan dalam memastikan data tetap bisa direkonstruksi dengan benar?',
    scenario:
      'Seorang siswa mengunduh file presentasi 50MB melalui jaringan sekolah. TCP memecah file menjadi ratusan segmen. Karena jaringan padat, segmen-segmen mengambil rute berbeda dan tiba tidak berurutan: segmen ke-50 tiba sebelum segmen ke-49, segmen ke-75 datang setelah segmen ke-80. Namun, file yang diunduh tetap utuh sempurna.',
    whyQuestion:
      'Field TCP Header mana yang memungkinkan penerima merekonstruksi file dengan benar meskipun segmen tiba tidak berurutan?',
    hint:
      'Cari field yang berisi nomor urut byte pertama dalam setiap segmen, sehingga penerima selalu tahu "ini byte ke-berapa dari data asli" tanpa perlu melihat urutan kedatangan.',
    reasonOptions: [
      {
        id: 'r1',
        text: 'Sequence Number, karena setiap segmen membawa nomor urut byte sehingga penerima tahu cara menyusun kembali seluruh data terlepas dari urutan kedatangan.',
        isCorrect: true,
        feedback:
          'Tepat! Sequence Number memungkinkan penerima merekonstruksi data dengan benar. Penerima menyimpan semua segmen di buffer, lalu menyusunnya berdasarkan Sequence Number — bukan berdasarkan urutan tiba.',
      },
      {
        id: 'r2',
        text: 'Checksum, karena field ini menjaga integritas sehingga data yang tidak berurutan tidak akan rusak.',
        isCorrect: false,
        feedback:
          'Checksum memverifikasi apakah isi segmen berubah selama transmisi, bukan tentang urutan. Segmen yang tiba tidak berurutan tetap valid checksumnya — masalah urutan adalah tanggung jawab Sequence Number.',
      },
      {
        id: 'r3',
        text: 'Window Size, karena field ini mengatur berapa segmen yang boleh dikirim sekaligus sehingga tidak akan kacau.',
        isCorrect: false,
        feedback:
          'Window Size mengatur kecepatan pengiriman (Flow Control), bukan urutan. Meskipun Window Size mengontrol jumlah segmen dalam perjalanan, ia tidak bisa mencegah segmen tiba tidak berurutan akibat routing berbeda.',
      },
      {
        id: 'r4',
        text: 'Source Port, karena port yang berbeda memisahkan aliran data dari segmen yang berbeda.',
        isCorrect: false,
        feedback:
          'Source Port mengidentifikasi aplikasi pengirim, bukan posisi byte dalam data. Satu koneksi TCP memiliki satu Source Port untuk semua segmennya — port tidak berperan dalam pengurutan data.',
      },
    ],
    questionBank: [
      {
        id: 'q1',
        text: 'Apa perbedaan Sequence Number dan Acknowledgment Number?',
        response:
          'Sequence Number adalah nomor byte pertama yang dikirim dalam segmen ini (dari sudut pandang pengirim). Acknowledgment Number adalah nomor byte berikutnya yang diharapkan penerima — artinya semua byte sebelum nomor ini sudah diterima dengan benar.',
      },
      {
        id: 'q2',
        text: 'Bagaimana TCP menangani segmen yang tiba lebih awal dari urutan seharusnya?',
        response:
          'Segmen yang tiba terlalu awal (out-of-order) disimpan di buffer penerima. TCP mengirim ACK untuk segmen terakhir yang berurutan, bukan segmen terbaru yang tiba. Saat segmen yang hilang akhirnya datang, semua segmen yang sudah di buffer langsung tersusun.',
      },
      {
        id: 'q3',
        text: 'Apakah TCP menomori setiap segmen atau setiap byte?',
        response:
          'TCP menomori setiap byte, bukan setiap segmen! Jika ISN=1 dan setiap segmen membawa 500 byte, maka Seq# segmen pertama=1, segmen kedua=501, segmen ketiga=1001. Ini yang membuat rekonstruksi data begitu presisi.',
      },
    ],
    conclusionPrompt: 'Berdasarkan analisis skenario out-of-order packets dan tanya jawab yang telah kamu lakukan, jelaskan bagaimana kamu mampu membedakan kondisi pengiriman data normal dengan kondisi yang memerlukan error recovery pada TCP berdasarkan nilai Sequence Number. Tuliskan secara tepat dengan kata-katamu sendiri.',
  },

  {
    type: 'learning-community',
    title: 'Learning Community',
    description:
      'Siswa berdiskusi dalam kelompok tentang pengambilan keputusan teknis dalam mekanisme Three-Way Handshake dan Flow Control TCP.',
    objectiveCode: 'X.TCP.12',
    activityGuide: [
      'Simak visualisasi alur Three-Way Handshake sebagai fondasi diskusi kelompok.',
      'Analisis Studi Kasus 1 (TCP Handshake): pilih strategi, tulis argumen, kirim ke kelompok.',
      'Analisis Studi Kasus 2 (TCP Flow Control): pilih strategi, tulis argumen, kirim ke kelompok.',
      'Diskusikan dan beri vote pada argumen terbaik di papan diskusi kelompok.',
    ],
    logicalThinkingIndicators: [
      'Kemampuan Berargumen: menyampaikan alasan teknis yang jelas berdasarkan mekanisme TCP.',
      'Validasi Komunal: mengevaluasi argumen rekan dan memberikan vote berdasarkan logika teknis terkuat.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menerapkan proses TCP Three-Way Handshake untuk menentukan nilai SYN, SYN-ACK, dan ACK pada setiap langkah pembentukan koneksi',
      condition: 'melalui aktivitas learning community berupa papan kolaboratif studi kasus pada CONNETIC Module',
      degree: 'secara logis',
    },
    layers5: [
      { id: 'L5', name: 'Application', pdu: 'Data', color: '#8B5CF6', desc: 'Browser meminta halaman web ke server melalui HTTP.' },
      { id: 'L4', name: 'Transport (TCP)', pdu: 'Segment', color: '#628ECB', desc: 'TCP membangun koneksi: SYN → SYN-ACK → ACK sebelum data mengalir.' },
      { id: 'L3', name: 'Network', pdu: 'Packet', color: '#10B981', desc: 'IP menambahkan alamat sumber dan tujuan untuk menentukan rute.' },
      { id: 'L2', name: 'Data Link', pdu: 'Frame', color: '#F59E0B', desc: 'Ethernet membungkus paket dengan MAC Address untuk pengiriman lokal.' },
      { id: 'L1', name: 'Physical', pdu: 'Bits', color: '#395886', desc: 'Sinyal elektrik, optik, atau radio membawa bit melalui media fisik.' },
    ],
    encapsulationCase: {
      id: 'X.TCP.8.A',
      title: 'Studi Kasus: Kapan Harus Kirim SYN Ulang?',
      concept:
        'Three-Way Handshake dimulai dengan SYN dari Client. Namun, jaringan tidak selalu sempurna — bagaimana jika SYN tidak mendapat balasan SYN-ACK dalam waktu tertentu?',
      scenario:
        'Client mengirim SYN ke server web sekolah. Sudah 3 detik berlalu, tetapi tidak ada balasan SYN-ACK. Koneksi tampaknya tertunda. Client dihadapkan pada pilihan: menunggu lebih lama, mengirim ulang SYN, atau langsung menyerah.',
      question:
        'Apa yang seharusnya dilakukan TCP Client dalam situasi ini sesuai standar protokol TCP?',
      options: [
        {
          id: 'A',
          text: 'Mengirim ulang SYN secara otomatis dengan exponential backoff — timeout yang semakin panjang di setiap percobaan.',
          logic: 'Ini perilaku standar TCP RFC. Exponential backoff mencegah Client membanjiri jaringan yang sedang sibuk dengan SYN berulang-ulang.',
        },
        {
          id: 'B',
          text: 'Langsung menampilkan "Connection Failed" kepada pengguna tanpa mencoba lagi.',
          logic: 'Ini terlalu agresif. TCP dirancang resilient — ia mencoba beberapa kali sebelum menyerah. Sekali gagal belum tentu koneksi mustahil.',
        },
        {
          id: 'C',
          text: 'Mengirim data langsung tanpa menunggu SYN-ACK karena koneksi mungkin sudah terbuka di sisi server.',
          logic: 'Ini melanggar prinsip TCP. Data tidak boleh dikirim sebelum Three-Way Handshake selesai — tanpa koneksi terbuka, server tidak tahu bagaimana menanggapi data tersebut.',
        },
      ],
    },
    decapsulationCase: {
      id: 'X.TCP.5.B',
      title: 'Studi Kasus: Window Size Mendekati Nol',
      concept:
        'Flow Control TCP menggunakan Window Size untuk mencegah pengirim mengirim data lebih cepat dari kemampuan proses penerima. Window Size yang terus menurun adalah sinyal darurat.',
      scenario:
        'Monitoring jaringan sekolah menunjukkan bahwa nilai Window Size yang dikirim server e-learning terus menurun: 65535 → 8192 → 1024 → 128. Infrastruktur jaringan fisik tidak mengalami gangguan apapun.',
      question:
        'Apa interpretasi teknis yang paling tepat dari menurunnya Window Size secara konsisten pada server tersebut?',
      options: [
        {
          id: 'A',
          text: 'Buffer penerima (server) semakin penuh karena data baru datang lebih cepat dari kecepatan pemrosesan aplikasi.',
          logic: 'Tepat. Window Size mencerminkan ruang kosong di buffer penerima. Penurunan konsisten ini menandakan server kewalahan memproses antrean request yang terus bertambah.',
        },
        {
          id: 'B',
          text: 'Kabel jaringan mengalami degradasi sehingga data hilang di tengah perjalanan dan Window Size menyesuaikan.',
          logic: 'Jika masalah fisik, gejalanya adalah packet loss dan retransmission, bukan penurunan Window Size secara konsisten. Window Size adalah kondisi internal server, bukan refleksi kualitas fisik kabel.',
        },
        {
          id: 'C',
          text: 'TCP secara otomatis memperkecil Window Size untuk meningkatkan keamanan dari serangan jaringan.',
          logic: 'Window Size tidak berkaitan dengan keamanan jaringan — itu murni mekanisme Flow Control untuk mencegah buffer overflow di sisi penerima.',
        },
      ],
    },
    groupActivity: {
      groupNames: ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'],
      discussionPrompt:
        'Diskusikan: Apa yang terjadi jika KEDUA masalah (SYN timeout dan Window Size mendekati nol) terjadi bersamaan? Mana yang lebih kritis untuk ditangani lebih dulu? Berikan vote pada argumen teknis terkuat.',
    },
    conclusionPrompt: 'Berdasarkan diskusi kelompok tentang TCP Handshake dan Flow Control yang telah kamu lakukan, jelaskan bagaimana kamu mampu menerapkan proses TCP Three-Way Handshake untuk menentukan nilai SYN, SYN-ACK, dan ACK pada setiap langkah pembentukan koneksi. Tuliskan secara logis dengan kata-katamu sendiri.',
  },

  {
    type: 'modeling',
    title: 'Demonstrasi Three-Way Handshake',
    description:
      'Siswa mempraktikkan secara interaktif proses Three-Way Handshake lengkap dengan nilai Sequence Number dan ACK Number antara Client dan Server hingga koneksi TCP terbuka.',
    objectiveCode: 'X.TCP.13',
    activityGuide: [
      'Ikuti simulasi Three-Way Handshake langkah demi langkah dari Client ke Server secara runtut.',
      'Klik tombol untuk mengirim SYN, balas dengan SYN-ACK, lalu kirim ACK final.',
      'Amati perubahan status koneksi: CLOSED → SYN_SENT → SYN_RECEIVED → ESTABLISHED.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengikuti alur Three-Way Handshake secara sistematis tanpa melewati langkah.',
      'Penerapan Konsep: menghubungkan nilai Sequence Number dan ACK Number antar setiap langkah.',
    ],
    facilitatorNotes: [
      'Guru menunjukkan bahwa ISN (Initial Sequence Number) dipilih secara acak demi alasan keamanan, bukan dimulai dari 0.',
      'Guru menekankan bahwa SYN-ACK adalah satu-satunya paket yang memiliki DUA flag aktif sekaligus — efisiensi protokol.',
      'Guru meminta siswa memprediksi nilai ACK# di setiap langkah sebelum klik tombol.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mensimulasikan mekanisme kerja TCP dari pembentukan koneksi hingga pengiriman data',
      condition: 'melalui aktivitas modeling berupa simulasi step-by-step pada CONNETIC Module',
      degree: 'secara sistematis',
    },
    practiceInstructions: {
      forTeacher: [
        'Tunjukkan bahwa Client memilih ISN secara acak (misalnya 1000) — bukan 0 — untuk alasan keamanan.',
        'Jelaskan mengapa SYN-ACK berisi DUA flag: server perlu sinkronisasi ISN-nya sendiri sekaligus mengkonfirmasi SYN Client.',
        'Tanya siswa sebelum klik: "Kalau Client ISN=1000, berapakah ACK# yang dikirim Server di SYN-ACK?" (Jawaban: 1001)',
      ],
      forStudent: [
        'Klik tombol "Kirim SYN" untuk memulai handshake dari sisi Client.',
        'Perhatikan nilai Sequence Number yang tertera, lalu klik "Balas SYN-ACK" dari Server.',
        'Selesaikan jabat tangan dengan klik "Jalankan Proses" dan amati status koneksi berubah menjadi ESTABLISHED.',
      ],
    },
    modelingSteps: [
      {
        id: 'twh1',
        type: 'example',
        title: 'Langkah 1: Client mengirim SYN (Status: CLOSED → SYN_SENT)',
        content:
          'Client ingin membuka koneksi ke Server. Ia memilih ISN secara acak, misalnya 1000. Kemudian mengirim paket dengan flag SYN=1, Seq=1000. Status Client berubah dari CLOSED menjadi SYN_SENT.',
        interactiveAction: 'Klik "Kirim SYN" untuk mengirim paket pembuka dari Client.',
      },
      {
        id: 'twh2',
        type: 'example',
        title: 'Langkah 2: Server membalas SYN-ACK (Status: SYN_RECEIVED)',
        content:
          'Server menerima SYN Client. Server setuju dan memilih ISN-nya sendiri (misal 5000). Server mengirim: SYN=1, ACK=1, Seq=5000, Ack#=1001 (= ISN Client + 1). Status Server: SYN_RECEIVED.',
        interactiveAction: 'Klik "Balas SYN-ACK" dari sisi Server dan perhatikan nilai Ack# yang dikonfirmasi.',
      },
      {
        id: 'twh3',
        type: 'practice',
        title: 'Langkah 3: Client mengirim ACK Final (Status: ESTABLISHED)',
        content:
          'Client menerima SYN-ACK Server. Client mengkonfirmasi dengan: ACK=1, Seq=1001, Ack#=5001 (= ISN Server + 1). Setelah ini, KEDUA pihak berstatus ESTABLISHED — koneksi TCP terbuka dan data siap mengalir!',
        interactiveAction: 'Klik "Jalankan Proses" untuk mengirim ACK terakhir dan saksikan koneksi terbuka.',
      },
    ],
    conclusionPrompt: 'Berdasarkan simulasi Three-Way Handshake yang telah kamu praktikkan, jelaskan bagaimana kamu mampu mensimulasikan mekanisme kerja TCP dari pembentukan koneksi hingga pengiriman data. Tuliskan secara sistematis dengan kata-katamu sendiri.',
  },

  {
    type: 'reflection',
    title: 'Reflection',
    description:
      'Siswa menyusun peta konsep menyeluruh yang menghubungkan semua mekanisme TCP yang dipelajari: Header, Sequence Number, Three-Way Handshake, dan Flow Control.',
    objectiveCode: 'X.TCP.14',
    activityGuide: [
      'Hubungkan konsep-konsep mekanisme TCP dengan memilih label penghubung yang paling tepat.',
      'Pastikan peta konsepmu mencerminkan hubungan antara TCP Header, Sequence Number, Handshake, dan Flow Control.',
      'Tulis ringkasan menyeluruh tentang semua mekanisme TCP yang telah kamu pelajari hari ini secara runtut.',
    ],
    logicalThinkingIndicators: [
      'Penarikan Kesimpulan: menghubungkan semua mekanisme TCP menjadi gambaran utuh cara kerja protokol ini.',
    ],
    facilitatorNotes: [
      'Guru mendorong siswa membandingkan pemahaman sekarang dengan pemahaman awal di tahap Constructivism.',
      'Guru menggunakan peta konsep sebagai jembatan ke pertemuan berikutnya tentang IP Addressing.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menyimpulkan mekanisme keandalan TCP sebagai satu kesatuan yang utuh',
      condition: 'melalui aktivitas reflection berupa konstruksi rekap materi pada CONNETIC Module',
      degree: 'secara tepat',
    },
    conceptMapNodes: [
      { id: 'cn1', label: 'TCP', description: 'Protokol Transport Layer yang andal dan connection-oriented.', colorClass: 'blue' },
      { id: 'cn2', label: 'TCP Header', description: 'Struktur yang memuat semua field kontrol TCP.', colorClass: 'indigo' },
      { id: 'cn3', label: 'Sequence Number', description: 'Menomori setiap byte untuk rekonstruksi data yang tepat.', colorClass: 'purple' },
      { id: 'cn4', label: 'Three-Way Handshake', description: 'Proses pembukaan koneksi 3 langkah: SYN-SYN/ACK-ACK.', colorClass: 'green' },
      { id: 'cn5', label: 'ACK Number', description: 'Konfirmasi byte berikutnya yang diharapkan penerima.', colorClass: 'amber' },
      { id: 'cn6', label: 'Flow Control', description: 'Mengatur kecepatan pengiriman agar penerima tidak kewalahan.', colorClass: 'pink' },
      { id: 'cn7', label: 'Window Size', description: 'Field yang menentukan kuota data sebelum menunggu ACK.', colorClass: 'amber' },
      { id: 'cn8', label: 'TCP Flags', description: 'Bit penanda fase koneksi: SYN, ACK, FIN, RST.', colorClass: 'purple' },
    ],
    conceptMapConnections: [
      { from: 'cn1', to: 'cn2', label: 'memiliki struktur', options: ['memiliki struktur', 'menghapus', 'mengabaikan', 'bertentangan dengan'] },
      { from: 'cn2', to: 'cn3', label: 'memuat field', options: ['memuat field', 'menghapus', 'melewatkan', 'menyamakan'] },
      { from: 'cn2', to: 'cn8', label: 'memuat field', options: ['memuat field', 'meniadakan', 'mengabaikan', 'mengganti'] },
      { from: 'cn3', to: 'cn5', label: 'berpasangan dengan', options: ['berpasangan dengan', 'menolak', 'menghapus', 'melewatkan'] },
      { from: 'cn4', to: 'cn8', label: 'menggunakan', options: ['menggunakan', 'menghambat', 'menggantikan', 'menghilangkan'] },
      { from: 'cn6', to: 'cn7', label: 'diatur oleh field', options: ['diatur oleh field', 'sama dengan', 'lebih tinggi dari', 'tidak terkait dengan'] },
      { from: 'cn1', to: 'cn4', label: 'menggunakan mekanisme', options: ['menggunakan mekanisme', 'menghindari', 'mengganti', 'merusak'] },
    ],
    essayReflection: {
      materialSummaryPrompt:
        'Jelaskan secara runtut semua mekanisme TCP yang kamu pelajari hari ini: dimulai dari fungsi TCP Header, bagaimana Three-Way Handshake bekerja dengan Sequence Number, hingga cara Flow Control menggunakan Window Size mencegah penerima kewalahan. Tulis dengan bahasamu sendiri secara lengkap.',
      easyPartPrompt: 'Mekanisme TCP mana yang paling mudah kamu bayangkan analoginya? Jelaskan!',
      hardPartPrompt: 'Bagian mana tentang TCP yang masih terasa membingungkan dan perlu kamu pelajari lebih dalam?',
    },
    selfEvaluationCriteria: [
      { id: 'sc1', label: 'Saya memahami konsep TCP sebagai protokol Transport Layer yang andal.' },
      { id: 'sc2', label: 'Saya dapat menjelaskan fungsi field-field utama TCP Header.' },
      { id: 'sc3', label: 'Saya memahami cara kerja Three-Way Handshake dengan nilai Sequence Number.' },
      { id: 'sc4', label: 'Saya dapat menjelaskan bagaimana Sequence Number memastikan urutan data.' },
      { id: 'sc5', label: 'Saya memahami mekanisme Flow Control menggunakan Window Size.' },
    ],
    conclusionPrompt: 'Berdasarkan penyusunan peta konsep dan refleksi yang telah kamu lakukan, jelaskan bagaimana kamu mampu menyimpulkan mekanisme keandalan TCP sebagai satu kesatuan yang utuh. Tuliskan secara tepat dengan kata-katamu sendiri.',
  },

  {
    type: 'authentic-assessment',
    title: 'Authentic Assessment',
    description:
      'Siswa mendiagnosis masalah koneksi TCP pada jaringan laboratorium sekolah menggunakan pemahaman tentang Three-Way Handshake dan Flow Control.',
    objectiveCode: 'X.TCP.15',
    activityGuide: [
      'Baca konteks kasus: jaringan lab dengan gejala SYN yang terus dikirim ulang dan Window Size mendekati nol.',
      'Pilih jalur diagnosis awal berdasarkan bukti teknis yang tersedia.',
      'Jelaskan alasan teknis, ikuti cabang keputusan, dan simpulkan solusi yang paling prioritas.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menentukan urutan diagnosis yang paling masuk akal dari bukti yang ada.',
      'Kemampuan Berargumen: memberi alasan teknis pada setiap keputusan bercabang.',
      'Penarikan Kesimpulan: memilih prioritas solusi berdasarkan bukti mekanisme TCP.',
    ],
    facilitatorNotes: [
      'Guru memposisikan diri sebagai kepala IT yang meminta laporan diagnosis dari siswa-teknisi.',
      'Guru menggunakan hasil jalur keputusan untuk melihat pemahaman siswa tentang mekanisme TCP vs masalah infrastruktur.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menganalisis skenario komunikasi TCP pada setiap langkah koneksi',
      condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
      degree: 'secara logis',
    },
    branchingScenario: {
      context:
        'Kamu adalah teknisi IT di laboratorium komputer sekolah. Guru melaporkan koneksi ke server e-learning sangat lambat bahkan sering gagal. Analisis Wireshark menunjukkan dua gejala bersamaan: (1) Banyak paket SYN yang dikirim ulang tanpa mendapat SYN-ACK dari server, dan (2) Window Size dari server terus menurun dari 65535 menjadi hampir 0.',
      initialQuestion:
        'Berdasarkan dua gejala tersebut, dari mana kamu akan memulai diagnosis untuk menemukan akar masalah paling efisien?',
      focusAreas: ['SYN Retransmission', 'Window Size ≈ 0', 'Server Resource'],
      choices: [
        {
          id: 'c1',
          text: 'Periksa kondisi server e-learning terlebih dahulu: cek penggunaan CPU, RAM, dan jumlah koneksi TCP aktif.',
          isOptimal: true,
          consequence:
            'Langkah yang tepat! Hasil pemeriksaan menunjukkan: CPU server 98%, RAM tersisa 200MB dari 8GB, dan ada 847 koneksi TCP aktif — jauh melebihi kapasitas normal 200 koneksi. Inilah akar masalah sesungguhnya.',
          followUpQuestion:
            'Server jelas kelebihan beban. Tindakan mana yang paling tepat untuk memulihkan layanan dengan cepat?',
          followUpChoices: [
            {
              id: 'f1a',
              text: 'Restart server secara darurat DAN tutup koneksi TCP idle untuk membebaskan resource sebelum server dibebani lagi.',
              isCorrect: true,
              explanation:
                'Sangat tepat! Restart mengembalikan server ke kondisi bersih. Menutup koneksi idle mencegah masalah berulang segera. Ini solusi jangka pendek yang efektif sambil merencanakan peningkatan kapasitas jangka panjang.',
            },
            {
              id: 'f1b',
              text: 'Tambahkan kabel LAN baru dari lab ke server untuk meningkatkan bandwidth.',
              isCorrect: false,
              explanation:
                'Bandwidth bukan masalahnya — server kewalahan memproses request, bukan kekurangan jalur. Menambah kabel tidak akan membantu jika bottleneck-nya ada di CPU dan RAM server.',
            },
          ],
        },
        {
          id: 'c2',
          text: 'Ganti kabel jaringan dari lab ke server karena SYN yang tidak terbalas mengindikasikan masalah fisik.',
          isOptimal: false,
          consequence:
            'Kabel baru terpasang, namun masalah tidak berubah sama sekali. SYN masih terus dikirim ulang dan Window Size tetap mendekati 0. Masalahnya ternyata bukan di infrastruktur fisik.',
          followUpQuestion:
            'Setelah mengganti kabel tidak membantu, data apa yang harus segera kamu cek untuk menemukan akar masalah?',
          followUpChoices: [
            {
              id: 'f2a',
              text: 'Periksa statistik resource server (CPU, RAM, jumlah koneksi aktif) menggunakan monitoring tool.',
              isCorrect: true,
              explanation:
                'Tepat. SYN yang tidak terbalas bisa berarti server terlalu sibuk untuk memproses permintaan koneksi baru. Pemeriksaan resource server adalah langkah logis berikutnya setelah menyingkirkan masalah fisik.',
            },
            {
              id: 'f2b',
              text: 'Ganti juga switch jaringan karena mungkin switch yang bermasalah.',
              isCorrect: false,
              explanation:
                'Mengganti hardware secara berurutan tanpa data diagnostik adalah pemborosan waktu. Periksa data server dulu untuk membuktikan atau menyingkirkan hipotesamu sebelum mengganti perangkat lain.',
            },
          ],
        },
        {
          id: 'c3',
          text: 'Restart router lab karena router mungkin tidak bisa meneruskan paket SYN ke server dengan benar.',
          isOptimal: false,
          consequence:
            'Router di-restart, tetapi gejala tetap persis sama. Router ternyata bekerja normal — ia berhasil meneruskan SYN ke server, tapi server tidak merespons dengan SYN-ACK.',
          followUpQuestion:
            'Router berfungsi normal tapi SYN tetap tidak mendapat balasan. Apa yang seharusnya kamu periksa berikutnya?',
          followUpChoices: [
            {
              id: 'f3a',
              text: 'Periksa kondisi server langsung: apakah server bisa menerima koneksi baru atau sudah mencapai batas maksimum koneksi aktif.',
              isCorrect: true,
              explanation:
                'Tepat sekali. Router hanya perantara — jika server tidak merespons SYN, berarti server yang bermasalah. Pemeriksaan langsung ke server adalah langkah terarah selanjutnya.',
            },
            {
              id: 'f3b',
              text: 'Hubungi ISP dan minta laporan gangguan jaringan dari sisi mereka.',
              isCorrect: false,
              explanation:
                'Masalah ini adalah koneksi lokal antara lab dan server sekolah. ISP tidak ada kaitannya dengan koneksi internal di jaringan sekolah.',
            },
          ],
        },
      ],
      finalEvaluation:
        'Gunakan pemahamanmu tentang Three-Way Handshake dan Window Size untuk membedakan antara masalah fisik (kabel/hardware) dan masalah logis (resource server/buffer). Argumen teknis yang kuat selalu didasarkan pada bukti data, bukan asumsi.',
    },
    conclusionPrompt: 'Berdasarkan studi kasus bercabang tentang troubleshooting koneksi TCP yang telah kamu analisis, jelaskan bagaimana kamu mampu menganalisis skenario komunikasi TCP pada setiap langkah koneksi. Tuliskan secara logis dengan kata-katamu sendiri.',
  },
];
