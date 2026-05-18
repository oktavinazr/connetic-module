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
      'Siswa mengeksplorasi hierarki 5 lapisan TCP/IP dan perbandingannya dengan model OSI melalui aktivitas interaktif.',
    objectiveCode: 'X.TCP.2',
    activityGuide: [
      'Buka dan pelajari materi perbandingan model OSI dengan TCP/IP.',
      'Eksplorasi tiap lapisan TCP/IP melalui panel interaktif.',
      'Susun 5 lapisan TCP/IP dengan drag & drop sambil melihat perbandingan OSI.',
      'Lanjutkan ke aktivitas analogi: cocokkan contoh keseharian ke lapisan TCP/IP.',
      'Tulis argumen tentang hubungan OSI dan TCP/IP serta alasan urutan lapisan.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menata hierarki 5 lapisan TCP/IP secara logis berdasarkan perbandingan OSI.',
      'Kemampuan Berargumen: menjelaskan alasan urutan lapisan dan hubungan OSI-TCP/IP melalui analogi.',
      'Penarikan Kesimpulan: menyimpulkan lapisan TCP/IP dan perbandingannya dengan OSI.',
    ],
    facilitatorNotes: [
      'Guru memastikan siswa memahami hubungan model OSI (7 layer) dengan TCP/IP (5 layer).',
      'Guru mendorong siswa untuk membandingkan dan mencari tahu mengapa beberapa layer OSI digabung di TCP/IP.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menguraikan susunan lapisan model TCP/IP berdasarkan perbandingan dengan model OSI',
      condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
      degree: 'secara runtut',
    },
    material: {
      title: 'Model OSI vs TCP/IP — Perbandingan Lapisan Jaringan',
      content: [
        'Model OSI (Open Systems Interconnection) adalah standar referensi internasional yang membagi komunikasi jaringan menjadi 7 lapisan.',
        'Model TCP/IP lebih sederhana dengan 5 lapisan, dikembangkan berdasarkan protokol yang sudah ada di internet.',
        'Tiga lapisan atas OSI — Application, Presentation, dan Session — digabungkan menjadi satu Application Layer di TCP/IP.',
        'Empat lapisan bawah kedua model saling bersesuaian: Transport, Network, Data Link, dan Physical.',
      ],
      examples: [
        'OSI Layer 7,6,5 (Application, Presentation, Session) → TCP/IP Application Layer (HTTP, SMTP, FTP).',
        'OSI Layer 4 (Transport) → TCP/IP Transport Layer (TCP, UDP).',
        'OSI Layer 3 (Network) → TCP/IP Network Layer (IP, ICMP).',
        'OSI Layer 2 (Data Link) → TCP/IP Data Link Layer (Ethernet, Wi-Fi).',
        'OSI Layer 1 (Physical) → TCP/IP Physical Layer (Kabel UTP, Serat Optik).',
      ],
      osiLayers: [
        { name: 'Application', number: 7, mapsTo: 'Application', desc: 'Antarmuka aplikasi pengguna' },
        { name: 'Presentation', number: 6, mapsTo: 'Application', desc: 'Format & enkripsi data' },
        { name: 'Session', number: 5, mapsTo: 'Application', desc: 'Manajemen sesi komunikasi' },
        { name: 'Transport', number: 4, mapsTo: 'Transport', desc: 'Pengiriman end-to-end' },
        { name: 'Network', number: 3, mapsTo: 'Network', desc: 'Routing & pengalamatan IP' },
        { name: 'Data Link', number: 2, mapsTo: 'Data Link', desc: 'Frame & MAC Address' },
        { name: 'Physical', number: 1, mapsTo: 'Physical', desc: 'Transmisi bit & sinyal' },
      ],
    },
    explorationSections: [
      {
        id: 'e1',
        title: 'Application Layer (Lapisan 5)',
        content:
          'Lapisan paling atas yang berinteraksi langsung dengan pengguna. Di sinilah protokol seperti HTTP (web), SMTP (email), dan FTP (file) bekerja untuk menghasilkan data yang akan dikirim. Dalam model OSI, fungsi Application, Presentation, dan Session digabung di sini.',
        example:
          'Saat kamu mengetik pesan di WhatsApp atau membuka website di Chrome, kamu sedang berada di Application Layer — ini mencakup tampilan (Presentation) dan koneksi (Session) dalam model OSI.',
      },
      {
        id: 'e2',
        title: 'Transport Layer (Lapisan 4)',
        content:
          'Bertanggung jawab untuk komunikasi end-to-end. Di sini data dipecah menjadi potongan kecil (segmen) dan diberikan nomor urut agar bisa disusun kembali dengan benar di tujuan. Layer ini sama persis dengan Transport Layer di OSI.',
        example:
          'TCP bekerja di sini untuk memastikan semua potongan data sampai tanpa ada yang hilang atau rusak — seperti petugas yang mengecek setiap halaman buku sebelum dijilid.',
      },
      {
        id: 'e3',
        title: 'Network Layer (Lapisan 3)',
        content:
          'Menentukan jalur terbaik (routing) untuk mengirimkan paket data melalui jaringan. Lapisan ini menambahkan alamat IP sumber dan tujuan pada setiap paket. Padanan di OSI adalah Network Layer.',
        example:
          'Seperti kantor pos yang menentukan rute tercepat berdasarkan alamat yang tertulis di amplop surat. Router bekerja di lapisan ini.',
      },
      {
        id: 'e4',
        title: 'Data Link Layer (Lapisan 2)',
        content:
          'Mengatur bagaimana data dikirimkan melalui media fisik (kabel atau wireless). Di sini paket dibungkus menjadi "Frame" dan ditambahkan alamat fisik (MAC Address). Sama dengan Data Link Layer di OSI.',
        example:
          'Memastikan data terkirim dengan aman dari satu perangkat ke perangkat berikutnya dalam satu jaringan lokal, seperti switch dan access point.',
      },
      {
        id: 'e5',
        title: 'Physical Layer (Lapisan 1)',
        content:
          'Lapisan terbawah yang menangani pengiriman bit (0 dan 1) dalam bentuk sinyal listrik, cahaya, atau gelombang radio melalui media transmisi. Identik dengan Physical Layer di model OSI.',
        example:
          'Kabel LAN (UTP), serat optik, atau sinyal Wi-Fi adalah bagian dari Physical Layer — lapisan yang benar-benar "menyentuh" dunia fisik.',
      },
    ],
    flowInstruction:
      'Susun "The Layer Sorting": Urutkan 5 lapisan TCP/IP mulai dari yang paling atas (dekat dengan pengguna) ke yang paling bawah (fisik). Perhatikan panel perbandingan OSI di sebelah kiri sebagai panduan.',
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
        text: 'Network Layer',
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
      'Berdasarkan aktivitas mengurutkan lapisan dan mencocokkan analogi yang telah kamu lakukan, jelaskan mengapa urutan lapisan TCP/IP disusun dari Application hingga Physical?',
    groups: [
      { id: 'application', label: 'Application Layer', colorClass: 'purple' },
      { id: 'transport', label: 'Transport Layer', colorClass: 'blue' },
      { id: 'internet', label: 'Network Layer', colorClass: 'green' },
      { id: 'datalink', label: 'Data Link Layer', colorClass: 'amber' },
      { id: 'physical', label: 'Physical Layer', colorClass: 'pink' },
    ],
    groupItems: [
      { id: 'an1', text: 'Menulis pesan di WhatsApp dan mengirimnya', correctGroup: 'application' },
      { id: 'an2', text: 'Memastikan semua potongan data sampai utuh dan berurutan', correctGroup: 'transport' },
      { id: 'an3', text: 'Mencari rute terbaik ke server tujuan lewat IP Address', correctGroup: 'internet' },
      { id: 'an4', text: 'Mengirim data antar perangkat dalam satu jaringan lokal via MAC Address', correctGroup: 'datalink' },
      { id: 'an5', text: 'Mengubah data digital menjadi sinyal listrik atau cahaya di kabel', correctGroup: 'physical' },
      { id: 'an6', text: 'Membuka browser Chrome dan mengetik alamat website', correctGroup: 'application' },
      { id: 'an7', text: 'Memberi nomor urut pada setiap segmen data agar tidak tertukar', correctGroup: 'transport' },
      { id: 'an8', text: 'Menentukan alamat IP pengirim dan penerima di header paket', correctGroup: 'internet' },
      { id: 'an9', text: 'Membungkus paket data menjadi Frame untuk dikirim lewat Ethernet', correctGroup: 'datalink' },
      { id: 'an10', text: 'Mentransmisikan bit 0 dan 1 melalui kabel UTP atau serat optik', correctGroup: 'physical' },
    ],
    conclusionPrompt: 'Berdasarkan eksplorasi materi, penyusunan lapisan, dan aktivitas analogi yang telah kamu lakukan, jelaskan bagaimana kamu mampu menguraikan susunan lapisan model TCP/IP berdasarkan perbandingan dengan model OSI. Tuliskan secara runtut dengan kata-katamu sendiri.',
  },
  {
    type: 'questioning',
    title: 'Questioning',
    description:
      'Siswa membedakan fungsi setiap lapisan TCP/IP melalui aktivitas pencocokan fungsi, studi kasus analogi, tanya jawab interaktif, dan penarikan kesimpulan.',
    objectiveCode: 'X.TCP.3',
    activityGuide: [
      'Cocokkan deskripsi fungsi ke lapisan TCP/IP yang tepat (drag & drop).',
      'Pelajari Peta Analogi Pizza lalu analisis skenario gangguan jaringan.',
      'Lakukan tanya jawab interaktif tentang perbedaan fungsi setiap lapisan.',
      'Tulis argumen logis dan kesimpulan tentang fungsi lapisan TCP/IP.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mencocokkan fungsi setiap lapisan TCP/IP secara logis dan berurutan.',
      'Kemampuan Berargumen: menganalisis kasus gangguan jaringan dan menjawab pertanyaan interaktif tentang fungsi lapisan.',
      'Penarikan Kesimpulan: menyimpulkan perbedaan fungsi setiap lapisan TCP/IP dalam komunikasi jaringan.',
    ],
    facilitatorNotes: [
      'Guru mendampingi siswa dalam mencocokkan fungsi setiap lapisan dan mendiskusikan alasan pemilihan.',
      'Guru mendorong siswa menghubungkan analogi pizza dengan fungsi nyata tiap lapisan TCP/IP.',
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
        text: 'Apa fungsi utama Transport Layer dalam TCP/IP?',
        response:
          'Transport Layer memecah data menjadi segmen kecil, memberi nomor urut, dan memverifikasi integritas pengiriman menggunakan checksum. Protokol utamanya adalah TCP (andal, terjamin) dan UDP (cepat, tanpa jaminan).',
      },
      {
        id: 'q2',
        text: 'Apa perbedaan Network Layer dengan Data Link Layer?',
        response:
          'Network Layer mengurus routing antar jaringan berbeda menggunakan IP Address, sedangkan Data Link Layer hanya mengurus pengiriman dalam satu jaringan lokal menggunakan MAC Address dan membungkus data menjadi Frame.',
      },
      {
        id: 'q3',
        text: 'Mengapa Application Layer disebut lapisan "terdekat dengan pengguna"?',
        response:
          'Application Layer adalah tempat protokol yang langsung berinteraksi dengan aplikasi pengguna — seperti HTTP untuk web browser, SMTP untuk email, dan FTP untuk transfer file. Lapisan ini menghasilkan dan memproses data, bukan mengurus pengirimannya.',
      },
      {
        id: 'q4',
        text: 'Apa fungsi Physical Layer dan hubungannya dengan Data Link Layer?',
        response:
          'Physical Layer mengirimkan bit (0 dan 1) dalam bentuk sinyal fisik melalui kabel UTP, serat optik, atau Wi-Fi. Data Link Layer bekerja tepat di atasnya — membungkus data menjadi Frame dan memastikan Frame dikirim ke perangkat yang tepat sebelum Physical Layer mengirim bitnya.',
      },
      {
        id: 'q5',
        text: 'Mengapa urutan lapisan TCP/IP tidak bisa diubah sembarangan?',
        response:
          'Setiap lapisan memiliki fungsi spesifik yang saling melengkapi: Application menghasilkan data → Transport memecah dan memverifikasi → Network menentukan rute → Data Link membungkus untuk jaringan lokal → Physical mengirim bit. Mengubah urutan ini akan memutus alur enkapsulasi yang logis.',
      },
    ],
    conclusionPrompt: 'Berdasarkan aktivitas pencocokan fungsi, studi kasus analogi, dan tanya jawab yang telah kamu lakukan, jelaskan bagaimana kamu mampu membedakan fungsi setiap lapisan model TCP/IP dalam proses komunikasi jaringan. Tuliskan secara logis dengan kata-katamu sendiri.',
  },
  {
    type: 'learning-community',
    title: 'Learning Community',
    description:
      'Berkolaborasi dalam kelompok untuk membangun logika kolektif tentang alur data TCP/IP melalui 4 tahap sistematis.',
    objectiveCode: 'X.TCP.4 & X.TCP.5',
    activityGuide: [
      'Simak Simulasi Interaktif Enkapsulasi & Dekapsulasi sebagai fondasi.',
      'Analisis skenario Enkapsulasi (X.TCP.4): pilih jawaban, tulis argumen, kirim ke kelompok.',
      'Analisis skenario Dekapsulasi (X.TCP.5): pilih jawaban, tulis argumen, kirim ke kelompok.',
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
      'Siswa menganalisis proses transmisi data melalui 5 lapisan TCP/IP menggunakan studi kasus bercabang tentang pengiriman file.',
    objectiveCode: 'X.TCP.8',
    activityGuide: [
      'Baca konteks kasus: Alya mengirim file presentasi melalui email.',
      'Pilih urutan proses lapisan TCP/IP yang paling tepat untuk menggambarkan alur transmisi data.',
      'Tulis alasan logismu, lalu pilih jawaban pada pertanyaan tindak lanjut.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menentukan urutan lapisan TCP/IP yang logis dalam proses transmisi data.',
      'Kemampuan Berargumen: menjelaskan alasan di balik urutan lapisan dan peran TCP vs IP.',
      'Penarikan Kesimpulan: memilih penjelasan yang tepat berdasarkan pemahaman fungsi setiap lapisan.',
    ],
    facilitatorNotes: [
      'Guru memosisikan diri sebagai fasilitator yang menanyakan alasan pemilihan urutan lapisan oleh siswa.',
      'Guru mendorong siswa menghubungkan kasus dengan materi enkapsulasi dan fungsi lapisan TCP/IP yang telah dipelajari.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menganalisis skenario proses transmisi data di setiap lapisan TCP/IP',
      condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
      degree: 'secara logis',
    },
    branchingScenario: {
      context:
        'Alya sedang mengirim file presentasi kelompok berukuran 5MB melalui email dari laptopnya yang terhubung ke WiFi sekolah. File ini harus melewati 5 lapisan TCP/IP sebelum sampai ke server email gurunya. Setiap lapisan memiliki peran penting dalam memastikan file tersebut terkirim dengan benar dan utuh.',
      initialQuestion:
        'Manakah urutan proses yang paling tepat menggambarkan perjalanan data file Alya melalui lapisan TCP/IP dari laptop pengirim ke server email?',
      focusAreas: ['Urutan Lapisan', 'Enkapsulasi Data', 'Peran TCP vs IP'],
      choices: [
        {
          id: 'c1',
          text:
            'Data diproses dari lapisan atas ke bawah: Application → Transport → Network → Data Link → Physical. Dimulai dari aplikasi email menyiapkan data, Transport memecah dan menjamin keutuhan, Network menambahkan alamat IP tujuan, Data Link membungkus untuk pengiriman lokal, dan Physical mengirim sebagai sinyal WiFi.',
          isOptimal: true,
          consequence:
            'Tepat! Ini adalah proses enkapsulasi yang benar. Data "dibungkus" lapis demi lapis dari Application hingga Physical — seperti mengemas kado: barang dibungkus bubble wrap (Transport), dimasukkan ke kotak (Network), diberi label alamat (Data Link), lalu diserahkan ke kurir (Physical). Setiap lapisan menambahkan informasi penting sebelum data benar-benar dikirim.',
          followUpQuestion:
            'Berdasarkan alur enkapsulasi tersebut, apa perbedaan peran antara TCP (Transport Layer) dan IP (Network Layer) dalam pengiriman file Alya?',
          followUpChoices: [
            {
              id: 'f1a',
              text:
                'TCP bertugas memecah file 5MB menjadi segmen-segmen kecil dan memastikan semua bagian sampai dengan utuh ke penerima. IP bertugas memberikan alamat tujuan dan mencari rute terbaik menuju server email guru.',
              isCorrect: true,
              explanation:
                'Sangat tepat! TCP seperti petugas yang memotong kue besar menjadi potongan kecil agar mudah dibawa, lalu memeriksa setiap potongan sampai dengan selamat. IP seperti GPS yang menentukan rute perjalanan berdasarkan alamat yang tertulis. Keduanya bekerja sama: TCP menjaga isi, IP menjaga arah.',
            },
            {
              id: 'f1b',
              text:
                'TCP dan IP memiliki peran yang sama — keduanya mengubah data menjadi sinyal WiFi agar bisa terkirim melalui udara ke server.',
              isCorrect: false,
              explanation:
                'Kurang tepat. TCP dan IP bekerja di lapisan yang berbeda dengan tugas yang berbeda. Mengubah data menjadi sinyal adalah tugas Physical Layer, bukan TCP atau IP. TCP ada di Transport Layer (menjaga keutuhan data), IP ada di Network Layer (mengurus pengalamatan dan rute).',
            },
            {
              id: 'f1c',
              text:
                'IP yang memecah file menjadi bagian-bagian kecil, sedangkan TCP yang menuliskan alamat email guru sebagai tujuan pengiriman.',
              isCorrect: false,
              explanation:
                'Terbalik. Justru TCP-lah yang memecah data menjadi segmen-segmen kecil di Transport Layer — ini adalah salah satu fungsi utamanya. IP bekerja di Network Layer untuk menambahkan alamat IP (bukan alamat email) dan menentukan rute pengiriman.',
            },
          ],
        },
        {
          id: 'c2',
          text:
            'Data diproses dari lapisan bawah ke atas: Physical → Data Link → Network → Transport → Application. Data harus dikirim dulu sebagai sinyal WiFi, baru setiap lapisan di atasnya menambahkan informasi satu per satu.',
          isOptimal: false,
          consequence:
            'Urutan ini sebenarnya adalah proses dekapsulasi yang terjadi di sisi penerima, bukan di sisi pengirim! Di sisi pengirim (Alya), data justru mengalir dari atas ke bawah (Application → Physical) melalui proses enkapsulasi. Di sisi penerima (server email guru), data diterima dari bawah ke atas (Physical → Application) melalui proses dekapsulasi. Kamu perlu membedakan keduanya.',
          followUpQuestion:
            'Lalu, di sisi manakah proses dari bawah ke atas (Physical → Application) yang kamu pilih itu sebenarnya terjadi?',
          followUpChoices: [
            {
              id: 'f2a',
              text:
                'Proses dari bawah ke atas (Physical → Application) terjadi di sisi penerima, yaitu server email guru. Di sini data dibuka lapis demi lapis: sinyal WiFi diterima → frame dibuka → alamat IP diperiksa → segmen disusun ulang → email utuh ditampilkan. Ini disebut dekapsulasi.',
              isCorrect: true,
              explanation:
                'Benar! Kamu sudah bisa membedakan enkapsulasi (atas ke bawah, di pengirim) dan dekapsulasi (bawah ke atas, di penerima). Di sisi Alya: Application → Physical (enkapsulasi). Di sisi server guru: Physical → Application (dekapsulasi). Dua proses yang berlawanan arah dan saling melengkapi!',
            },
            {
              id: 'f2b',
              text:
                'Proses dari bawah ke atas sama-sama terjadi di laptop Alya, karena data harus bolak-balik diproses sebelum benar-benar dikirim.',
              isCorrect: false,
              explanation:
                'Tidak. Di laptop Alya (pengirim), data hanya mengalir satu arah: dari Application turun ke Physical. Data tidak "bolak-balik". Proses dari bawah ke atas (Physical → Application) hanya terjadi di perangkat penerima saat data diterima dan "dibuka bungkusnya".',
            },
          ],
        },
        {
          id: 'c3',
          text:
            'Data hanya perlu diproses oleh Application Layer (email) dan Physical Layer (WiFi) saja. Lapisan Transport, Network, dan Data Link tidak terlalu diperlukan karena email sudah memiliki alamat tujuan.',
          isOptimal: false,
          consequence:
            'Ini adalah pemahaman yang kurang tepat tentang model TCP/IP. Setiap lapisan memiliki fungsi yang tidak bisa dilewati. Application Layer hanya menyiapkan data mentah — tanpa Transport Layer, data 5MB tidak dipecah dan berisiko rusak. Tanpa Network Layer, data tidak tahu harus ke server yang mana. Tanpa Data Link Layer, data tidak bisa dikirim ke router WiFi terdekat.',
          followUpQuestion:
            'Coba pikirkan: apa yang akan terjadi pada file 5MB Alya jika tidak ada Transport Layer yang memecahnya menjadi segmen-segmen kecil?',
          followUpChoices: [
            {
              id: 'f3a',
              text:
                'File 5MB yang besar akan dikirim sebagai satu potongan utuh. Jika terjadi gangguan sedikit saja di tengah jalan, seluruh file harus dikirim ulang dari awal. Tanpa Transport Layer, tidak ada yang memverifikasi apakah data sampai dengan utuh atau tidak.',
              isCorrect: true,
              explanation:
                'Tepat! Inilah mengapa Transport Layer dengan TCP sangat penting. Dengan memecah file menjadi segmen kecil, jika satu segmen gagal, hanya segmen itu yang dikirim ulang — bukan seluruh file 5MB. TCP juga memverifikasi setiap segmen sampai dengan selamat. Tanpa ini, pengiriman data besar seperti file, video, atau gambar akan sangat tidak efisien.',
            },
            {
              id: 'f3b',
              text:
                'Tidak ada masalah. File 5MB tetap bisa dikirim dengan lancar karena WiFi sekolah sudah cukup cepat untuk mengirim file sebesar itu dalam satu kali kirim.',
              isCorrect: false,
              explanation:
                'Kecepatan WiFi bukan satu-satunya faktor. Tanpa Transport Layer, tidak ada yang memecah file, tidak ada yang memverifikasi keutuhan, dan tidak ada yang memastikan urutan data. Bahkan dengan WiFi tercepat sekalipun, data tetap memerlukan mekanisme TCP untuk menjamin pengiriman yang andal dan utuh.',
            },
          ],
        },
      ],
      finalEvaluation:
        'Kamu telah menganalisis perjalanan data melalui 5 lapisan TCP/IP. Pahami bahwa setiap lapisan memiliki peran unik: Application menyiapkan data, Transport menjaga keutuhan, Network mengarahkan perjalanan, Data Link menangani pengiriman lokal, dan Physical mengirimkan sinyal. Kelima lapisan ini bekerja dalam urutan yang logis dan tidak bisa dilewati.',
    },
    conclusionPrompt: 'Berdasarkan studi kasus bercabang yang telah kamu analisis, jelaskan bagaimana kamu mampu menganalisis skenario proses transmisi data di setiap lapisan TCP/IP. Tuliskan secara logis dengan kata-katamu sendiri.',
  },
];
