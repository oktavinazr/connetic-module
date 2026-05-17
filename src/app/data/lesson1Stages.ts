import type { Stage } from './lessons';

export const lesson1Stages: Stage[] = [
  {
    type: 'constructivism',
    title: 'Constructivism',
    description:
      'Siswa membangun pemahaman awal tentang konsep dasar TCP/IP melalui animasi perjalanan paket data dan pengelompokan analogi TCP vs IP.',
    objectiveCode: 'X.TCP.1',
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mendefinisikan konsep dasar TCP/IP sebagai fondasi komunikasi jaringan komputer',
      condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif pada CONNETIC Module',
      degree: 'dengan tepat',
    },
    activityGuide: [
      'Saksikan animasi perjalanan paket data melalui 5 lapisan TCP/IP dari pengirim ke penerima.',
      'Setelah animasi selesai, susun kata-kata menjadi definisi TCP/IP yang tepat (drag & drop).',
      'Lanjutkan ke aktivitas pengelompokan: seret setiap kartu ke kelompok TCP atau IP sesuai perannya.',
      'Setelah pengelompokan selesai, tulis argumen tentang perbedaan TCP dan IP serta peran masing-masing.',
    ],
    apersepsi:
      '',
    analogySortGroups: [
      { id: 'tcp', label: 'Peran TCP (Transmission Control Protocol)', colorClass: 'blue' },
      { id: 'ip', label: 'Peran IP (Internet Protocol)', colorClass: 'green' },
    ],
    analogySortItems: [
      {
        id: 'ap1',
        text: 'Memecah data besar menjadi segmen-segmen kecil',
        courierAnalogy: 'Seperti memotong kue besar menjadi potongan kecil agar mudah dibawa.',
        correctGroup: 'tcp',
        correctOrder: 1,
      },
      {
        id: 'ap2',
        text: 'Memberi nomor urut pada setiap segmen data',
        courierAnalogy: 'Seperti memberi nomor halaman pada buku agar tidak tertukar susunannya.',
        correctGroup: 'tcp',
        correctOrder: 2,
      },
      {
        id: 'ap3',
        text: 'Memverifikasi data sampai dengan utuh menggunakan checksum',
        courierAnalogy: 'Seperti memeriksa segel paket kiriman sebelum diterima — jika rusak, minta kirim ulang.',
        correctGroup: 'tcp',
        correctOrder: 3,
      },
      {
        id: 'ap4',
        text: 'Mengirim konfirmasi (ACK) bahwa data telah diterima',
        courierAnalogy: 'Seperti tanda tangan bukti terima paket oleh penerima.',
        correctGroup: 'tcp',
        correctOrder: 4,
      },
      {
        id: 'ap5',
        text: 'Menentukan alamat tujuan pengiriman (IP Address)',
        courierAnalogy: 'Seperti menulis alamat lengkap di amplop surat — tanpa alamat, surat tidak akan sampai.',
        correctGroup: 'ip',
        correctOrder: 1,
      },
      {
        id: 'ap6',
        text: 'Mencari rute terbaik menuju alamat tujuan (Routing)',
        courierAnalogy: 'Seperti GPS yang mencari jalan tercepat menuju alamat yang dituju.',
        correctGroup: 'ip',
        correctOrder: 2,
      },
      {
        id: 'ap7',
        text: 'Membungkus data dengan header yang berisi alamat sumber dan tujuan',
        courierAnalogy: 'Seperti menulis alamat pengirim dan penerima di label paket.',
        correctGroup: 'ip',
        correctOrder: 3,
      },
      {
        id: 'ap8',
        text: 'Meneruskan paket data antar jaringan (Forwarding)',
        courierAnalogy: 'Seperti petugas pos yang meneruskan surat dari satu kota ke kota berikutnya.',
        correctGroup: 'ip',
        correctOrder: 4,
      },
    ],
    constructivismEssay2:
      'Mengapa kamu mengelompokkan kartu-kartu tersebut sebagai peran TCP atau peran IP? Jelaskan hubungan TCP dan IP dalam komunikasi jaringan.',
    conclusionPrompt: 'Berdasarkan animasi perjalanan paket data dan aktivitas pengelompokan TCP vs IP yang telah kamu lakukan, jelaskan bagaimana kamu mampu mendefinisikan konsep dasar TCP/IP sebagai fondasi komunikasi jaringan komputer. Tuliskan dengan kata-katamu sendiri dan hubungkan dengan pengalaman belajarmu.',
  },
  {
    type: 'inquiry',
    title: 'Inquiry',
    description:
      'Siswa mengeksplorasi hierarki 5 lapisan TCP/IP dan memahami fungsi spesifik setiap lapisan secara bertahap.',
    objectiveCode: 'X.TCP.2',
    activityGuide: [
      'Buka dan pelajari tiap lapisan TCP/IP melalui panel eksplorasi interaktif.',
      'Susun 5 lapisan TCP/IP dengan drag & drop, mulai dari Application hingga Physical.',
      'Cocokkan setiap lapisan dengan fungsi teknisnya menggunakan klik-pasangkan.',
      'Tulis refleksi untuk memperkuat pemahaman konsep.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menata hierarki 5 lapisan TCP/IP secara logis.',
      'Analisis Fungsi: menghubungkan peran teknis dengan lapisan yang sesuai.',
      'Refleksi Konsep: menjelaskan kembali struktur dan fungsi dengan bahasa sendiri.',
    ],
    facilitatorNotes: [
      'Guru memastikan siswa memahami perbedaan antara lapisan atas (software-oriented) dan lapisan bawah (hardware-oriented).',
      'Guru mendorong siswa untuk meninjau kembali materi eksplorasi jika mengalami kesulitan pada tahap matching.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menguraikan susunan lapisan model TCP/IP berdasarkan perbandingan dengan model OSI',
      condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
      degree: 'secara runtut',
    },
    material: {
      title: 'Struktur 5 Lapisan TCP/IP',
      content: [
        'TCP/IP adalah sekumpulan protokol yang digunakan untuk komunikasi data dalam jaringan komputer.',
        'Model TCP/IP terdiri dari 5 lapisan hierarki yang bekerja sama untuk mengirimkan data dari pengirim ke penerima.',
        'Setiap lapisan menambahkan informasi kontrol (header) ke data yang akan dikirim, proses ini disebut Enkapsulasi.',
      ],
      examples: [
        'Application Layer: HTTP, HTTPS, SMTP, FTP.',
        'Transport Layer: TCP, UDP.',
        'Internet Layer: IP, ICMP.',
        'Data Link Layer: Ethernet, Wi-Fi.',
        'Physical Layer: Kabel UTP, Serat Optik.',
      ],
    },
    explorationSections: [
      {
        id: 'e1',
        title: 'Application Layer (Lapisan 5)',
        content:
          'Lapisan paling atas yang berinteraksi langsung dengan pengguna. Di sinilah protokol seperti HTTP (web), SMTP (email), dan FTP (file) bekerja untuk menghasilkan data yang akan dikirim.',
        example:
          'Saat kamu mengetik pesan di WhatsApp atau membuka website di Chrome, kamu sedang berada di Application Layer.',
      },
      {
        id: 'e2',
        title: 'Transport Layer (Lapisan 4)',
        content:
          'Bertanggung jawab untuk komunikasi end-to-end. Di sini data dipecah menjadi potongan kecil (segmen) dan diberikan nomor urut agar bisa disusun kembali dengan benar di tujuan.',
        example:
          'TCP bekerja di sini untuk memastikan semua potongan data sampai tanpa ada yang hilang atau rusak.',
      },
      {
        id: 'e3',
        title: 'Internet Layer / Network Layer (Lapisan 3)',
        content:
          'Menentukan jalur terbaik (routing) untuk mengirimkan paket data melalui jaringan. Lapisan ini menambahkan alamat IP sumber dan tujuan pada setiap paket.',
        example:
          'Seperti kantor pos yang menentukan rute tercepat berdasarkan alamat yang tertulis di amplop surat.',
      },
      {
        id: 'e4',
        title: 'Data Link Layer (Lapisan 2)',
        content:
          'Mengatur bagaimana data dikirimkan melalui media fisik (kabel atau wireless). Di sini paket dibungkus menjadi "Frame" dan ditambahkan alamat fisik (MAC Address).',
        example:
          'Memastikan data terkirim dengan aman dari satu perangkat ke perangkat berikutnya dalam satu jaringan lokal.',
      },
      {
        id: 'e5',
        title: 'Physical Layer (Lapisan 1)',
        content:
          'Lapisan terbawah yang menangani pengiriman bit (0 dan 1) dalam bentuk sinyal listrik, cahaya, atau gelombang radio melalui media transmisi.',
        example:
          'Kabel LAN (UTP), serat optik, atau sinyal Wi-Fi adalah bagian dari Physical Layer.',
      },
    ],
    flowInstruction:
      'Susun "The Layer Sorting": Urutkan 5 lapisan TCP/IP mulai dari yang paling atas (dekat dengan pengguna) ke yang paling bawah (fisik).',
    flowItems: [
      {
        id: 'fl1',
        text: 'Application Layer',
        correctOrder: 1,
        description: 'Menghasilkan data dari aplikasi pengguna.',
        colorClass: 'purple',
      },
      {
        id: 'fl2',
        text: 'Transport Layer',
        correctOrder: 2,
        description: 'Memecah data dan menjamin keandalan pengiriman.',
        colorClass: 'blue',
      },
      {
        id: 'fl3',
        text: 'Internet Layer',
        correctOrder: 3,
        description: 'Menentukan rute dan pengalamatan IP.',
        colorClass: 'green',
      },
      {
        id: 'fl4',
        text: 'Data Link Layer',
        correctOrder: 4,
        description: 'Membungkus data menjadi frame dengan MAC Address.',
        colorClass: 'amber',
      },
      {
        id: 'fl5',
        text: 'Physical Layer',
        correctOrder: 5,
        description: 'Mengirimkan bit melalui media fisik (kabel/sinyal).',
        colorClass: 'pink',
      },
    ],
    inquiryReflection1:
      'Jelaskan pemahamanmu tentang urutan 5 lapisan TCP/IP tersebut. Mengapa data harus melewati urutan tersebut dari atas ke bawah saat dikirim?',
    matchingPairs: [
      { left: 'Application Layer', right: 'Antarmuka pengguna dan pembuatan data awal.' },
      { left: 'Transport Layer', right: 'Segmentasi data dan kontrol kesalahan (TCP).' },
      { left: 'Internet Layer', right: 'Pengalamatan logis (IP) dan penentuan rute paket.' },
      { left: 'Data Link Layer', right: 'Kontrol akses media dan pengalamatan fisik (MAC).' },
      { left: 'Physical Layer', right: 'Transmisi bit data melalui media fisik jaringan.' },
    ],
    inquiryReflection2:
      'Sekarang, jelaskan fungsi tiap layer dengan bahasamu sendiri! Bagaimana setiap layer bekerja sama untuk memastikan data sampai ke tujuan?',
    conclusionPrompt: 'Berdasarkan eksplorasi materi dan aktivitas penyusunan lapisan TCP/IP yang telah kamu lakukan, jelaskan bagaimana kamu mampu menguraikan susunan lapisan model TCP/IP berdasarkan perbandingan dengan model OSI. Tuliskan secara runtut dengan kata-katamu sendiri.',
  },
  {
    type: 'questioning',
    title: 'Questioning',
    description:
      'Siswa mengeksplorasi rasa ingin tahu, memilih solusi teknis, dan membangun argumen logis berdasarkan field TCP Header yang relevan.',
    objectiveCode: 'X.TCP.3',
    activityGuide: [
      'Pelajari Peta Analogi Pizza untuk memahami peran 5 lapisan TCP/IP.',
      'Seret nama lapisan ke kotak gangguan yang sesuai (drag & drop).',
      'Tulis refleksi: mengapa urutan lapisan harus baku dalam pengiriman data.',
    ],
    logicalThinkingIndicators: [
      'Kemampuan Berargumen: memilih alasan teknis yang tepat dan menjelaskannya secara logis.',
      'Penarikan Kesimpulan: menyimpulkan field TCP Header yang paling relevan dari bukti kasus.',
    ],
    facilitatorNotes: [
      'Guru memancing pertanyaan siswa tentang mengapa segmen bisa rusak dan bagaimana TCP merespons.',
      'Guru menekankan hubungan antara bukti kasus, field header, dan keputusan teknis siswa.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu membedakan fungsi setiap lapisan model TCP/IP dalam proses komunikasi jaringan',
      condition: 'melalui aktivitas questioning berupa tanya jawab dua arah pada CONNETIC Module',
      degree: 'dengan logis',
    },
    problemVisual: {
      icon: '!',
      title: 'Data corruption pada file audio',
      description:
        'Server streaming menerima file audio yang terdengar rusak setelah dikirim melalui jaringan. Beberapa bit data berubah di tengah perjalanan.',
      problemType: 'corruption',
    },
    teacherQuestion:
      'Jika gejalanya adalah data berubah atau rusak, field TCP Header mana yang paling masuk akal diperiksa lebih dulu? Jelaskan alasanmu.',
    scenario:
      'Sebuah file audio dikirim dalam banyak segmen TCP. Setelah sampai di server, sebagian segmen membuat audio terdistorsi. Tim teknis menemukan bahwa beberapa bit berubah selama transmisi sehingga file tidak bisa direkonstruksi dengan benar.',
    whyQuestion:
      'Field TCP Header mana yang pertama kali paling relevan untuk mendeteksi data corruption dan memicu proses pengiriman ulang?',
    hint:
      'Cari field yang dihitung dari isi segmen dan akan berubah bila satu bit saja ikut berubah.',
    reasonOptions: [
      {
        id: 'r1',
        text: 'Sequence Number, karena urutan segmen berubah saat data rusak.',
        isCorrect: false,
        feedback:
          'Sequence Number berguna untuk mengurutkan segmen, tetapi tidak memeriksa apakah isi segmen mengalami kerusakan.',
      },
      {
        id: 'r2',
        text: 'Checksum, karena nilainya dihitung dari data dan header sehingga bisa mendeteksi perubahan bit.',
        isCorrect: true,
        feedback:
          'Tepat. Checksum dipakai untuk memverifikasi integritas segmen. Bila hasil perhitungan penerima tidak cocok, segmen dianggap rusak dan perlu dikirim ulang.',
      },
      {
        id: 'r3',
        text: 'Destination Port, karena port tujuan menentukan aplikasi yang menerima segmen.',
        isCorrect: false,
        feedback:
          'Destination Port hanya menunjukkan aplikasi tujuan. Port tidak memeriksa apakah isi data berubah atau rusak.',
      },
      {
        id: 'r4',
        text: 'Window Size, karena kerusakan data terjadi saat buffer penerima terlalu penuh.',
        isCorrect: false,
        feedback:
          'Window Size berkaitan dengan flow control, bukan deteksi data corruption pada isi pengiriman.',
      },
    ],
    questionBank: [
      {
        id: 'q1',
        text: 'Apa fungsi checksum pada TCP?',
        response:
          'Checksum membantu penerima memverifikasi apakah isi segmen yang datang masih utuh atau sudah berubah selama transmisi.',
      },
      {
        id: 'q2',
        text: 'Mengapa segmen rusak bisa memicu retransmission?',
        response:
          'Segmen yang gagal diverifikasi tidak dianggap berhasil diterima. Akibatnya pengirim tidak mendapat konfirmasi yang valid and akan mengirim ulang segmen tersebut.',
      },
      {
        id: 'q3',
        text: 'Mengapa sequence number belum cukup untuk kasus ini?',
        response:
          'Sequence Number hanya memberi tahu posisi segmen. Kerusakan isi data tetap harus dicek dengan mekanisme integritas seperti checksum.',
      },
    ],
    conclusionPrompt: 'Berdasarkan analisis kasus data corruption dan tanya jawab yang telah kamu lakukan, jelaskan bagaimana kamu mampu membedakan fungsi setiap lapisan model TCP/IP dalam proses komunikasi jaringan. Tuliskan alasan logismu dengan kata-kata sendiri.',
  },
  {
    type: 'learning-community',
    title: 'Learning Community',
    description:
      'Berkolaborasi dalam kelompok untuk membangun logika kolektif tentang alur data TCP/IP melalui 4 tahap sistematis.',
    objectiveCode: 'X.TCP.4 & X.TCP.5',
    activityGuide: [
      'Simak Simulasi Interaktif Enkapsulasi & Dekapsulasi sebagai fondasi.',
      'Analisis skenario Enkapsulasi (X.TCP.6): pilih jawaban, tulis argumen, kirim ke kelompok.',
      'Analisis skenario Dekapsulasi (X.TCP.7): pilih jawaban, tulis argumen, kirim ke kelompok.',
      'Diskusikan dan beri vote pada argumen terbaik di papan diskusi kelompok.',
    ],
    logicalThinkingIndicators: [
      'Kemampuan Berargumen: menyampaikan alasan logis di balik urutan proses.',
      'Validasi Komunal: melakukan voting terhadap pemikiran rekan sejawat dalam kelompok.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menerapkan proses enkapsulasi sebagai pengirim dan proses dekapsulasi sebagai penerima',
      condition: 'melalui aktivitas learning community berupa papan kolaborasi studi kasus pada CONNETIC Module',
      degree: 'secara logis',
    },
    // Data untuk 5 Layer
    layers5: [
      { id: 'L5', name: 'Application', pdu: 'Data', color: '#8B5CF6', desc: 'Alya membuat email dan melampirkan file tugas.' },
      { id: 'L4', name: 'Transport', pdu: 'Segment', color: '#628ECB', desc: 'Menambahkan TCP Header untuk memastikan email sampai dengan utuh.' },
      { id: 'L3', name: 'Network', pdu: 'Packet', color: '#10B981', desc: 'Menambahkan alamat IP agar paket email tahu rute ke server tujuan.' },
      { id: 'L2', name: 'Data Link', pdu: 'Frame', color: '#F59E0B', desc: 'Menambahkan MAC Address untuk transmisi antar perangkat jaringan lokal.' },
      { id: 'L1', name: 'Physical', pdu: 'Bits', color: '#395886', desc: 'Mengirimkan email dalam bentuk pulsa biner (bits) melalui kabel/Wi-Fi.' },
    ],
    encapsulationCase: {
      id: 'X.TCP.6',
      title: 'Aktivitas X.TCP.6: Enkapsulasi (Sender Side)',
      concept: 'Enkapsulasi adalah proses "pembungkusan" data dari lapisan atas ke bawah. Bayangkan seperti mengirim kado: kamu membungkus barang (Data), memasukkannya ke kotak (Segment/Packet), lalu memberi label alamat (Frame/Bits) agar siap dikirim.',
      scenario: 'Bayangkan Alya akan mengirim sebuah paket kado pecah belah melalui jasa ekspedisi. Sebelum paket diserahkan ke kurir, ada beberapa lapisan perlindungan yang harus ditambahkan agar isi kado selamat sampai tujuan.',
      question: 'Manakah urutan penanganan paket yang paling logis agar kado Alya tidak rusak dan sampai ke alamat yang tepat?',
      options: [
        { id: 'e_opt1', text: 'Membungkus kado dengan bubble wrap, memasukkannya ke kardus, lalu menempelkan label alamat pengiriman.', logic: 'Analogi Enkapsulasi: Data (Kado) dibungkus Header Transport (Bubble Wrap), Header Network (Kardus), dan Header Data Link (Label).' },
        { id: 'e_opt2', text: 'Menempelkan label alamat langsung pada kado, baru kemudian membungkusnya dengan kardus tebal.', logic: 'Analogi ini kurang tepat karena label alamat (Data Link) biasanya berada di lapisan paling luar setelah pembungkusan selesai.' },
        { id: 'e_opt3', text: 'Menyiapkan kardus kosong yang sudah dilabeli, baru kemudian mencari kado yang ingin dikirim.', logic: 'Analogi ini tidak efisien karena proses dimulai dari pembungkus luar sebelum ada isi data yang jelas.' }
      ]
    },
    decapsulationCase: {
      id: 'X.TCP.7',
      title: 'Aktivitas X.TCP.7: Dekapsulasi (Receiver Side)',
      concept: 'Dekapsulasi adalah proses sebaliknya, yaitu "membuka bungkus" kado dari lapisan terbawah ke atas. Komputer penerima menerima sinyal fisik, membuka kotak luar, memverifikasi alamat, hingga akhirnya menampilkan isi kado asli ke aplikasi.',
      scenario: 'Paket kado Alya telah sampai di rumah gurunya. Untuk mendapatkan isi kado tersebut, sang guru harus melakukan serangkaian tindakan pembukaan pembungkus secara berurutan.',
      question: 'Bagaimana langkah pembukaan paket yang paling benar agar isi kado dapat diambil dengan aman?',
      options: [
        { id: 'd_opt1', text: 'Memeriksa label alamat, membuka kardus luar, lalu melepas bubble wrap untuk mengambil kado.', logic: 'Analogi Dekapsulasi: Memeriksa Header Data Link (Label), Header Network (Kardus), Header Transport (Bubble Wrap), hingga mendapatkan Data (Kado).' },
        { id: 'd_opt2', text: 'Langsung merobek kardus tanpa melihat label alamat terlebih dahulu.', logic: 'Analogi ini berisiko karena validasi alamat fisik (Data Link) harus dilakukan sebelum memproses isi paket.' },
        { id: 'd_opt3', text: 'Menunggu semua kado dari murid lain terkumpul, baru membuka semua pembungkusnya sekaligus.', logic: 'Analogi ini kurang tepat karena setiap paket harus divalidasi lapisannya secara mandiri saat tiba.' }
      ]
    },
    groupActivity: {
      groupNames: ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'],
      discussionPrompt: 'Diskusikan logika kalian. Berikan vote pada argumen yang menurut kalian paling mendalam dan sesuai dengan fungsi layer.',
    },
    conclusionPrompt: 'Berdasarkan aktivitas papan kolaborasi dan diskusi kelompok tentang enkapsulasi & dekapsulasi yang telah kamu lakukan, jelaskan bagaimana kamu mampu menerapkan proses enkapsulasi sebagai pengirim dan proses dekapsulasi sebagai penerima. Tuliskan secara logis dengan kata-katamu sendiri.',
  },
  {
    type: 'modeling',
    title: 'Demonstrasi Step-by-Step',
    activityNumber: 8,
    description:
      'Siswa akan mempraktikkan secara langsung proses kerja TCP/IP dari pengirim (PC A) hingga penerima (PC B) melalui alur step-by-step Encapsulation → Transmisi → Decapsulation.',
    objectiveCode: 'X.TCP.6',
    activityGuide: [
      'Ikuti 9 langkah simulasi dari PC A (pengirim) ke PC B (penerima) secara runtut.',
      'Lakukan drag & drop TCP Header, pilih alamat tujuan, dan aktifkan MAC Frame.',
      'Tahan tombol Listen, klik Kirim, lalu lepas lapisan pembungkus di sisi penerima.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengikuti alur kerja TCP secara sistematis dari awal hingga akhir.',
    ],
    facilitatorNotes: [
      'Guru menegaskan istilah encapsulation, transmission, dan decapsulation saat siswa berpindah langkah.',
      'Guru dapat menghentikan simulasi sejenak untuk meminta siswa memprediksi langkah berikutnya.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mensimulasikan alur transmisi data dari pengirim ke penerima melalui seluruh lapisan TCP/IP',
      condition: 'melalui aktivitas modeling berupa simulasi step-by-step pada CONNETIC Module',
      degree: 'secara sistematis',
    },
    practiceInstructions: {
      forTeacher: [
        'Demonstrasikan proses pembuatan data di Application Layer dan penambahan header di Transport/Internet Layer.',
        'Jelaskan perubahan bentuk PDU di setiap langkah (Data -> Segment -> Packet -> Frame).',
        'Gunakan simulasi untuk menunjukkan perjalanan paket melintasi media jaringan.',
      ],
      forStudent: [
        'Ikuti langkah-langkah pelepasan header (decapsulation) di sisi penerima.',
        'Pastikan urutan pelepasan header benar mulai dari lapisan terbawah.',
        'Amati hasil akhir data yang diterima di Application Layer.',
      ],
    },
    modelingSteps: [
      {
        id: 'step1',
        type: 'practice',
        title: 'Step 1: Input Data',
        content: 'Mulailah dengan mengetik pesan yang ingin Anda kirim di Application Layer.',
        interactiveAction: 'Ketik pesan di kolom input di bawah untuk memulai.',
      },
      {
        id: 'step2',
        type: 'practice',
        title: 'Step 2: Tambah TCP Header',
        content: 'TCP perlu memecah data and memberi nomor urut. Seret TCP Header ke pesan Anda.',
        interactiveAction: 'Seret label "TCP Header" and jatuhkan ke dalam kotak data.',
      },
      {
        id: 'step3',
        type: 'practice',
        title: 'Step 3: Pasang IP Address',
        content: 'Internet Layer membutuhkan alamat pengenal. Pilih IP Address tujuan yang tepat.',
        interactiveAction: 'Klik pada IP Address tujuan (PC B) untuk menempelkannya.',
      },
      {
        id: 'step4',
        type: 'practice',
        title: 'Step 4: Aktifkan Frame',
        content: 'Data Link Layer membungkus paket menjadi Frame and menambahkan MAC Address.',
        interactiveAction: 'Klik tombol "Aktifkan Frame" untuk melengkapi proses Enkapsulasi.',
      },
      {
        id: 'step5',
        type: 'practice',
        title: 'Step 5: Listen (CSMA/CD)',
        content: 'Sebelum mengirim, sistem harus mengecek apakah jalur media sedang kosong.',
        interactiveAction: 'Tekan "Listen" and tunggu indikator berubah menjadi Hijau (IDLE).',
      },
      {
        id: 'step6',
        type: 'practice',
        title: 'Step 6: Kirim Data',
        content: 'Jalur sudah aman. Sekarang kirimkan frame data melintasi media fisik.',
        interactiveAction: 'Klik "Kirim" untuk mentransmisikan bit data ke PC B.',
      },
      {
        id: 'step7',
        type: 'practice',
        title: 'Step 7: Lepas MAC & IP',
        content: 'PC B menerima data. Sekarang lepaskan pembungkus lapisan bawah (Data Link & Internet).',
        interactiveAction: 'Klik pada bagian MAC and IP untuk melepasnya dari data.',
      },
      {
        id: 'step8',
        type: 'practice',
        title: 'Step 8: Buka TCP Header',
        content: 'Data sudah sampai di Transport Layer. Verifikasi integritas data and buka header TCP.',
        interactiveAction: 'Klik "Buka TCP" untuk mendapatkan kembali data asli.',
      },
      {
        id: 'step9',
        type: 'practice',
        title: 'Step 9: Baca Pesan',
        content: 'Proses Dekapsulasi selesai! Aplikasi penerima kini menampilkan pesan asli Anda.',
        interactiveAction: 'Amati pesan yang muncul di layar monitor PC B.',
      },
    ],
    conclusionPrompt: 'Berdasarkan simulasi step-by-step dari PC A ke PC B yang telah kamu lakukan, jelaskan bagaimana kamu mampu mensimulasikan alur transmisi data dari pengirim ke penerima melalui seluruh lapisan TCP/IP. Tuliskan secara sistematis dengan kata-katamu sendiri.',
  },
  {
    type: 'reflection',
    title: 'Reflection',
    description:
      'Siswa menyusun peta konsep and refleksi tertulis untuk merangkum hubungan antar konsep TCP dari encapsulation hingga decapsulation.',
    objectiveCode: 'X.TCP.7',
    activityGuide: [
      'Hubungkan konsep-konsep TCP/IP dengan memilih label penghubung yang tepat.',
      'Tulis ringkasan pemahamanmu sendiri: apa itu TCP dan bagaimana enkapsulasi & dekapsulasi bekerja.',
      'Nilai perkembangan dirimu secara jujur pada seluruh capaian pembelajaran.',
    ],
    logicalThinkingIndicators: [
      'Penarikan Kesimpulan: menghubungkan konsep inti menjadi gambaran utuh tentang cara kerja TCP.',
    ],
    facilitatorNotes: [
      'Guru mendorong siswa membandingkan hasil refleksi dengan pemahaman awal pada tahap Constructivism.',
      'Guru dapat memakai hasil refleksi untuk menentukan bagian mana yang perlu diperkuat pada pertemuan berikutnya.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menyimpulkan model TCP/IP sebagai kerangka komunikasi jaringan yang terstruktur',
      condition: 'melalui aktivitas reflection berupa konstruksi rekap materi pada CONNETIC Module',
      degree: 'secara tepat',
    },
    conceptMapNodes: [
      {
        id: 'cn1',
        label: 'TCP',
        description: 'Protokol andal pada Transport Layer.',
        colorClass: 'blue',
      },
      {
        id: 'cn2',
        label: 'Encapsulation',
        description: 'Proses penambahan header saat data turun ke jaringan.',
        colorClass: 'green',
      },
      {
        id: 'cn3',
        label: 'TCP Header',
        description: 'Informasi kontrol yang menyertai setiap segmen TCP.',
        colorClass: 'purple',
      },
      {
        id: 'cn4',
        label: 'Sequence Number',
        description: 'Field yang membantu menjaga urutan segmen.',
        colorClass: 'amber',
      },
      {
        id: 'cn5',
        label: 'Checksum',
        description: 'Field yang memverifikasi integritas segmen.',
        colorClass: 'amber',
      },
      {
        id: 'cn6',
        label: 'Decapsulation',
        description: 'Proses pelepasan header di sisi penerima.',
        colorClass: 'green',
      },
      {
        id: 'cn7',
        label: 'Acknowledgment',
        description: 'Konfirmasi bahwa segmen berhasil diterima.',
        colorClass: 'pink',
      },
      {
        id: 'cn8',
        label: 'Transport Layer',
        description: 'Layer tempat TCP bekerja.',
        colorClass: 'indigo',
      },
    ],
    conceptMapConnections: [
      { from: 'cn1', to: 'cn8', label: 'bekerja di', options: ['bekerja di', 'menghapus', 'mengabaikan', 'bertentangan dengan'] },
      { from: 'cn1', to: 'cn2', label: 'melakukan', options: ['melakukan', 'menghindari', 'mengganti', 'menolak'] },
      { from: 'cn2', to: 'cn3', label: 'menambahkan', options: ['menambahkan', 'menghapus', 'melewatkan', 'menyamakan'] },
      { from: 'cn3', to: 'cn4', label: 'memuat', options: ['memuat', 'meniadakan', 'mengabaikan', 'mengganti'] },
      { from: 'cn3', to: 'cn5', label: 'memuat', options: ['memuat', 'menolak', 'menghapus', 'melewatkan'] },
      { from: 'cn2', to: 'cn6', label: 'berkebalikan dengan', options: ['berkebalikan dengan', 'sama dengan', 'lebih tinggi dari', 'tidak terkait dengan'] },
      { from: 'cn5', to: 'cn7', label: 'mendukung', options: ['mendukung', 'menghambat', 'menggantikan', 'menghilangkan'] },
    ],
    essayReflection: {
      materialSummaryPrompt:
        'Jelaskan dengan bahasamu sendiri apa itu TCP and bagaimana encapsulation serta decapsulation saling berhubungan.',
      easyPartPrompt:
        'Bagian konsep TCP mana yang paling mudah kamu pahami hari ini? Jelaskan alasannya.',
      hardPartPrompt:
        'Bagian mana yang masih membingungkan atau perlu kamu pelajari lagi?',
    },
    selfEvaluationCriteria: [
      { id: 'sc1', label: 'Saya mampu mendefinisikan TCP dalam jaringan komputer.' },
      { id: 'sc2', label: 'Saya mampu menentukan fungsi utama TCP melalui analogi.' },
      { id: 'sc3', label: 'Saya mampu mengurutkan lapisan TCP/IP dalam proses encapsulation.' },
      { id: 'sc4', label: 'Saya mampu mengidentifikasi fungsi Source Port, Destination Port, Sequence Number, and Checksum.' },
      { id: 'sc5', label: 'Saya mampu menganalisis masalah paket data dengan memilih field TCP Header yang relevan.' },
      { id: 'sc6', label: 'Saya mampu memberi argumentasi pada skenario peer voting.' },
      { id: 'sc7', label: 'Saya mampu memvalidasi urutan decapsulation and logika jawaban teman.' },
      { id: 'sc8', label: 'Saya mampu mengikuti alur encapsulation sampai decapsulation secara lengkap.' },
      { id: 'sc9', label: 'Saya mampu menyusun hubungan antar konsep TCP menjadi satu peta konsep.' },
      { id: 'sc10', label: 'Saya mampu mengambil keputusan teknis pada studi kasus TCP secara autentik.' },
    ],
    conclusionPrompt: 'Berdasarkan penyusunan peta konsep dan refleksi yang telah kamu lakukan, jelaskan bagaimana kamu mampu menyimpulkan model TCP/IP sebagai kerangka komunikasi jaringan yang terstruktur. Tuliskan secara tepat dengan kata-katamu sendiri.',
  },
  {
    type: 'authentic-assessment',
    title: 'Authentic Assessment',
    description:
      'Siswa menyelesaikan studi kasus bercabang yang menilai analisis, argumentasi, and penarikan kesimpulan pada beberapa masalah pengiriman paket TCP.',
    objectiveCode: 'X.TCP.8',
    activityGuide: [
      'Baca konteks kasus, bukti masalah, dan tiga area fokus gangguan dengan teliti.',
      'Pilih jalur diagnosis, jelaskan alasan teknis, lalu pilih prioritas tindak lanjut.',
      'Ikuti cabang kasus hingga akhir dan simpulkan langkah perbaikan paling berdampak.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menentukan urutan diagnosis yang paling masuk akal.',
      'Kemampuan Berargumen: memberi alasan teknis pada tiap keputusan bercabang.',
      'Penarikan Kesimpulan: memilih prioritas tindakan berdasarkan bukti kasus.',
    ],
    facilitatorNotes: [
      'Guru memosisikan diri sebagai fasilitator yang menanyakan alasan prioritas tindakan siswa.',
      'Guru menggunakan hasil jalur keputusan untuk melihat apakah siswa mampu membedakan collision, packet loss, and data corruption.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menganalisis skenario proses transmisi data di setiap lapisan TCP/IP',
      condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
      degree: 'secara logis',
    },
    branchingScenario: {
      context:
        'Kamu menjadi teknisi jaringan pada studio pembelajaran daring sekolah. Menjelang siaran kelas live, sistem monitoring menunjukkan tiga gejala sekaligus: collision burst pada segmen lama yang masih memakai hub, packet loss tinggi pada uplink internet, and data corruption pada beberapa segmen yang melewati patch cord yang mulai rusak.',
      initialQuestion:
        'Langkah awal mana yang paling profesional untuk memulai diagnosis masalah pengiriman paket TCP ini?',
      focusAreas: ['Collision', 'Packet Loss', 'Data Corruption'],
      choices: [
        {
          id: 'c1',
          text:
            'Analisis log TCP and topologi jaringan lebih dulu untuk memetakan pola collision, packet loss, and checksum error.',
          isOptimal: true,
          consequence:
            'Pilihanmu tepat. Dari log ditemukan collision burst pada segmen yang masih memakai hub, packet loss 28% pada uplink utama, and checksum error 11% pada jalur yang memakai patch cord rusak.',
          followUpQuestion:
            'Masalah mana yang harus diprioritaskan lebih dulu agar kualitas live class paling cepat stabil untuk semua pengguna?',
          followUpChoices: [
            {
              id: 'f1a',
              text:
                'Packet loss pada uplink internet, karena kehilangan paket tinggi langsung menurunkan kualitas layanan untuk seluruh pengguna.',
              isCorrect: true,
              explanation:
                'Prioritas ini paling logis karena packet loss 28% memukul seluruh aliran data utama. Setelah throughput stabil, collision pada segmen hub and data corruption karena kabel rusak dapat ditangani bertahap.',
            },
            {
              id: 'f1b',
              text:
                'Collision pada segmen hub, karena collision selalu lebih penting daripada masalah lain.',
              isCorrect: false,
              explanation:
                'Collision memang harus ditangani, tetapi dampak packet loss pada uplink utama lebih luas and lebih cepat merusak layanan live for semua pengguna.',
            },
            {
              id: 'f1c',
              text:
                'Data corruption karena patch cord rusak, karena integritas data harus selalu ditangani pertama kali.',
              isCorrect: false,
              explanation:
                'Data corruption perlu diperbaiki, tetapi pada kasus ini packet loss pada jalur utama lebih mendesak karena memengaruhi lebih banyak trafik secara langsung.',
            },
          ],
        },
        {
          id: 'c2',
          text: 'Restart semua perangkat jaringan and server streaming agar koneksi TCP dimulai ulang.',
          isOptimal: false,
          consequence:
            'Restart menghabiskan waktu, tetapi akar masalah belum terlihat. Setelah sistem kembali hidup, collision, packet loss, and checksum error masih tetap muncul.',
          followUpQuestion:
            'Setelah restart gagal, langkah apa yang seharusnya dilakukan untuk mendapatkan bukti teknis yang jelas?',
          followUpChoices: [
            {
              id: 'f2a',
              text:
                'Analisis log TCP and topologi untuk melihat pola kehilangan ACK, collision, and checksum error.',
              isCorrect: true,
              explanation:
                'Langkah ini memberi bukti teknis yang dapat dipakai untuk menentukan prioritas penanganan secara objektif.',
            },
            {
              id: 'f2b',
              text:
                'Menunggu beberapa menit sambil berharap masalah hilang sendiri setelah restart.',
              isCorrect: false,
              explanation:
                'Menunggu pasif tidak memberi bukti baru and tidak membantu membedakan sumber masalah jaringan.',
            },
          ],
        },
        {
          id: 'c3',
          text:
            'Langsung mengganti patch cord yang rusak tanpa memeriksa log karena data corruption terlihat paling berbahaya.',
          isOptimal: false,
          consequence:
            'Mengganti kabel memang berpotensi mengurangi checksum error, tetapi collision burst and packet loss pada uplink utama tetap belum terpetakan sehingga layanan masih tidak stabil.',
          followUpQuestion:
            'Jika kabel sudah diganti tetapi siaran tetap tersendat, data tambahan apa yang paling perlu diperiksa selanjutnya?',
          followUpChoices: [
            {
              id: 'f3a',
              text:
                'Periksa log TCP and topologi untuk membedakan collision lokal dari packet loss pada uplink utama.',
              isCorrect: true,
              explanation:
                'Langkah ini membantumu melihat bahwa masalah tidak hanya satu. Packet loss pada uplink utama harus diprioritaskan, lalu collision lokal ditangani dengan mengganti hub menjadi switch.',
            },
            {
              id: 'f3b',
              text:
                'Fokus pada pergantian kabel lain secara acak sampai layanan terasa membaik.',
              isCorrect: false,
              explanation:
                'Pergantian acak tidak sistematis and tidak menjawab kemungkinan masalah lain seperti collision and packet loss.',
            },
          ],
        },
      ],
      finalEvaluation:
        'Gunakan bukti untuk menentukan prioritas, jelaskan alasan teknis, lalu simpulkan solusi TCP yang paling berdampak terhadap layanan.',
    },
    conclusionPrompt: 'Berdasarkan studi kasus bercabang yang telah kamu analisis, jelaskan bagaimana kamu mampu menganalisis skenario proses transmisi data di setiap lapisan TCP/IP. Tuliskan secara logis dengan kata-katamu sendiri.',
  },
];
