import type { Stage } from './lessons';

export const lesson3Stages: Stage[] = [
  // ─── Constructivism — X.IP.1 ──────────────────────────────────────────────
  {
    type: 'constructivism',
    title: 'Constructivism',
    description:
      'Siswa membangun pemahaman awal tentang peran Internet Protocol (IP) pada Network Layer melalui animasi analogi interaktif dan aktivitas mencocokkan fungsi komponen IP.',
    objectiveCode: 'X.IP.1',
    activityGuide: [
      'Saksikan animasi analogi interaktif tentang sistem kerja kurir ekspedisi sebagai representasi cara kerja Internet Protocol.',
      'Susun urutan logika pengiriman paket data yang benar menggunakan drag & drop (3 langkah: TCP membungkus → IP menentukan alamat & rute → paket sampai).',
      'Coba simulasi "Kirim Paket Tanpa Alamat" untuk melihat apa yang terjadi jika IP/Network Layer tidak bekerja.',
      'Tulis argumen logis mengapa Internet Protocol sangat penting dan mengapa TCP tetap membutuhkan IP.',
      'Lengkapi kalimat refleksi menggunakan dropdown untuk menyimpulkan peran IP pada Network Layer.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menyusun urutan logika pengiriman paket data (TCP → IP → penerima) secara runtut melalui animasi analogi dan aktivitas drag & drop.',
      'Kemampuan Berargumen: menjelaskan mengapa Internet Protocol sangat penting dan mengapa TCP tetap membutuhkan IP meskipun data sudah dibungkus dengan aman.',
      'Penarikan Kesimpulan: menyimpulkan peran Internet Protocol pada Network Layer sebagai penentu alamat dan rute perjalanan data melalui aktivitas dropdown refleksi.',
    ],
    facilitatorNotes: [
      'Guru menggambarkan IP Address sebagai "alamat rumah di dunia digital" — tanpa alamat unik, data tidak tahu ke mana harus pergi.',
      'Guru menekankan bahwa IP bekerja di Network Layer, bukan Transport Layer (TCP) — IP mengurus ALAMAT, TCP mengurus KEANDALAN pengiriman.',
      'Guru meminta siswa membandingkan: apa bedanya IP Address dengan MAC Address dalam konteks jaringan?',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menjelaskan peran Internet Protocol lapisan Network dalam protokol TCP/IP',
      condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif dan urutan logika pengiriman pada CONNETIC Module',
      degree: 'dengan tepat',
    },
    apersepsi:
      'Bayangkan kamu ingin mengirim surat ke temanmu di kota lain. Kamu menulis namanya di amplop, tapi tanpa alamat lengkap — tanpa nama jalan, nomor rumah, atau nama kota. Kurir pasti bingung! Di internet, miliaran perangkat saling berkomunikasi setiap detik. Agar data tidak nyasar, setiap perangkat butuh "alamat digital" yang unik dan jelas. Inilah yang disebut IP Address — dan IP (Internet Protocol) adalah protokol yang bertugas memberikan, membaca, dan menggunakan alamat tersebut.',
    constructivismMatching: [
      {
        id: 'm1',
        left: 'Internet Protocol (IP)',
        right: 'Protokol pada Network Layer yang bertugas mengalamati paket data dengan alamat sumber dan tujuan, serta menentukan jalur terbaik (routing) ke tujuan.',
      },
      {
        id: 'm2',
        left: 'IP Address',
        right: 'Alamat logis unik 32-bit yang diberikan kepada setiap perangkat jaringan agar dapat diidentifikasi dan dihubungi dalam satu atau lebih jaringan.',
      },
      {
        id: 'm3',
        left: 'Network Layer',
        right: 'Lapisan ke-3 dalam model TCP/IP yang bertanggung jawab atas pengalamatan logis dan routing paket antar jaringan yang berbeda.',
      },
      {
        id: 'm4',
        left: 'Router',
        right: 'Perangkat jaringan yang membaca IP Address tujuan pada setiap paket dan meneruskannya ke jaringan berikutnya menuju tujuan akhir.',
      },
      {
        id: 'm5',
        left: 'Routing',
        right: 'Proses pemilihan jalur terbaik untuk mengirimkan paket data dari sumber ke tujuan melalui satu atau lebih router berdasarkan tabel routing.',
      },
      {
        id: 'm6',
        left: 'Packet (Paket IP)',
        right: 'Unit data pada Network Layer — berisi IP Header (alamat sumber, tujuan, TTL) dan payload data dari Transport Layer yang dibungkus oleh IP.',
      },
    ],
    constructivismEssay2:
      'Berdasarkan animasi dan aktivitas memasangkan yang telah kamu selesaikan, jelaskan secara singkat dan logis: Mengapa setiap perangkat yang berkomunikasi di jaringan wajib memiliki IP Address? Apa yang terjadi jika dua perangkat menggunakan IP Address yang sama, dan bagaimana hal tersebut mengganggu proses komunikasi jaringan? Gunakan minimal satu konsep dari aktivitas matching sebagai dasar argumenmu.',
    conclusionPrompt:
      'Berdasarkan animasi interaktif dan aktivitas memasangkan fungsi komponen IP yang telah kamu lakukan, tuliskan refleksimu: (1) Jelaskan peran Internet Protocol pada Network Layer dalam komunikasi jaringan. (2) Mengapa IP Address harus unik pada setiap perangkat? (3) Bagaimana Router menggunakan IP Address untuk meneruskan paket data ke tujuan? Tuliskan dengan tepat menggunakan kata-katamu sendiri.',
  },

  // ─── Inquiry — X.IP.2 ────────────────────────────────────────────────────
  {
    type: 'inquiry',
    title: 'Inquiry',
    description:
      'Siswa mengeksplorasi komponen IP Header beserta fungsinya secara mendalam melalui eksplorasi materi interaktif, penyusunan komponen header, dan aktivitas memasangkan fungsi field.',
    objectiveCode: 'X.IP.2',
    activityGuide: [
      'Klik setiap komponen pada ilustrasi IP Header untuk mengeksplorasi nama, fungsi, dan perannya dalam pengiriman data jaringan.',
      'Susun komponen IP Header secara runtut menggunakan drag & drop.',
      'Pasangkan setiap komponen IP Header dengan fungsi yang sesuai.',
      'Tuliskan Argumen Logis tentang pentingnya komponen IP Header dalam membantu data mencapai tujuan.',
      'Tuliskan refleksi akhir sebagai kesimpulan tahap Inquiry.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengenali, mengeksplorasi, dan menyusun komponen-komponen penting IP Header secara runtut berdasarkan struktur header.',
      'Kemampuan Berargumen: memasangkan fungsi setiap komponen IP Header dengan tepat lalu menjelaskan mengapa komponen-komponen tersebut penting dalam pengiriman data jaringan.',
      'Penarikan Kesimpulan: menyimpulkan hubungan antara komponen IP Header, fungsinya, dan perannya dalam membantu paket data mencapai tujuan.',
    ],
    facilitatorNotes: [
      'Guru menekankan perbedaan IP Header dengan TCP Header: IP Header mengurus ALAMAT & RUTE, TCP Header mengurus URUTAN & KEANDALAN.',
      'Guru menjelaskan TTL dengan analogi "tanggal kedaluwarsa paket" — mencegah paket berputar selamanya jika terjadi routing loop.',
      'Guru meminta siswa menghitung: jika TTL awal = 64 dan paket melewati 10 router, berapakah TTL saat tiba di tujuan?',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menguraikan komponen IP Header beserta fungsinya',
      condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
      degree: 'secara runtut',
    },
    material: {
      title: 'Komponen IP Header',
      content: [
        'IP Header adalah bagian awal setiap paket IP yang berisi informasi kontrol penting. Perangkat dan router membaca field-field di dalamnya untuk memahami identitas paket, tujuan pengiriman, dan cara memperlakukan payload.',
        'Komponen penting pada IP Header meliputi Version, Header Length (IHL), TTL, Protocol, Header Checksum, Source IP Address, dan Destination IP Address. Masing-masing memiliki fungsi spesifik yang saling melengkapi.',
      ],
      examples: [
        'Version (4 bit): Nilai 4 untuk IPv4. Router memeriksa field ini pertama untuk memastikan paket adalah IPv4.',
        'TTL (8 bit): Berkurang 1 di setiap router. Jika mencapai 0, paket dibuang dan pengirim diberi notifikasi ICMP "Time Exceeded".',
        'Protocol (8 bit): 6 = TCP, 17 = UDP, 1 = ICMP. Menunjukkan isi payload agar layer di atas IP bisa memprosesnya.',
        'Source IP (32 bit): Alamat IP perangkat pengirim — digunakan penerima untuk mengirim balasan.',
        'Destination IP (32 bit): Alamat IP perangkat tujuan — digunakan setiap router untuk routing decision.',
        'Header Checksum (16 bit): Nilai verifikasi integritas IP Header. Dihitung ulang di setiap router — jika tidak cocok, paket dibuang.',
      ],
    },
    explorationSections: [
      {
        id: 'e1',
        title: 'Version & IHL — Identitas Paket',
        content:
          'Field Version (4 bit) menyatakan versi protokol IP. Nilai 4 berarti IPv4. IHL (Internet Header Length, 4 bit) menunjukkan panjang IP Header dalam unit 32-bit. Nilai minimum IHL = 5 (berarti 20 byte header tanpa opsi). Router memeriksa kedua field ini pertama kali untuk memvalidasi paket.',
        example:
          'Jika Version = 4 dan IHL = 5, artinya paket ini adalah IPv4 dengan header 20 byte (5 × 4 = 20 byte). Semua paket IPv4 biasa memiliki IHL = 5 kecuali menggunakan Options field.',
      },
      {
        id: 'e2',
        title: 'TTL — Batas Usia Paket',
        content:
          'TTL (Time to Live) adalah counter 8-bit yang berkurang 1 setiap kali paket melewati sebuah router (hop). Jika TTL mencapai 0, router membuang paket tersebut dan mengirim pesan ICMP "Time Exceeded" ke pengirim. Mekanisme ini mencegah paket "hidup selamanya" akibat routing loop.',
        example:
          'Paket dikirim dengan TTL=64. Melewati Router 1 → TTL=63. Melewati Router 2 → TTL=62. Setelah 64 router, TTL=0 dan paket dibuang. Perintah "traceroute" memanfaatkan TTL untuk memetakan jalur paket.',
      },
      {
        id: 'e3',
        title: 'Protocol — Penanda Protokol Transport',
        content:
          'Field Protocol (8 bit) mengidentifikasi protokol Transport Layer yang membawa payload dalam paket ini. Nilai umum: 6 = TCP, 17 = UDP, 1 = ICMP. Perangkat penerima menggunakan nilai ini untuk menyerahkan payload ke protokol yang tepat setelah IP Header dilepas (dekapsulasi).',
        example:
          'Paket HTTP (web) menggunakan TCP (Protocol=6). Paket DNS menggunakan UDP (Protocol=17). Paket ping menggunakan ICMP (Protocol=1). Tanpa field Protocol, komputer penerima tidak tahu cara memproses payload yang diterimanya.',
      },
      {
        id: 'e4',
        title: 'Source & Destination IP Address',
        content:
          'Source IP Address (32 bit) adalah alamat IP perangkat pengirim, digunakan oleh penerima untuk mengirim balasan. Destination IP Address (32 bit) adalah alamat IP tujuan, dibaca oleh setiap router untuk membuat routing decision. Kedua field ini adalah "label amplop" yang menentukan siapa pengirim dan ke mana paket harus pergi.',
        example:
          'Saat kamu mengakses www.google.com, Source IP = IP-mu (misal 192.168.1.5), Destination IP = IP server Google (misal 142.250.185.68). Setiap router di sepanjang jalur hanya membaca Destination IP untuk memutuskan ke router mana paket diteruskan.',
      },
      {
        id: 'e5',
        title: 'Header Checksum — Verifikasi Integritas',
        content:
          'Header Checksum (16 bit) adalah nilai yang dihitung dari semua field IP Header. Setiap router yang menerima paket menghitung ulang checksum dan membandingkannya dengan nilai yang ada. Jika tidak cocok, header dianggap rusak dan paket dibuang. Checksum ini HANYA melindungi IP Header, bukan payload (data di dalamnya).',
        example:
          'Bayangkan Checksum sebagai "sidik jari" IP Header. Jika bit mana pun dalam header berubah selama transmisi (misal akibat gangguan elektromagnetik), checksum yang dihitung ulang akan berbeda dan paket langsung dibuang sebelum diteruskan.',
      },
    ],
    flowInstruction:
      'Susun komponen-komponen penting IP Header berikut dari field identitas dasar hingga field alamat tujuan agar struktur bacanya runtut.',
    flowItems: [
      { id: 'fl1', text: 'Router menerima paket dan memeriksa field Version — memastikan ini adalah paket IPv4 yang valid.', correctOrder: 1, description: 'Verifikasi versi protokol.', colorClass: 'purple' },
      { id: 'fl2', text: 'Router memeriksa nilai TTL; jika TTL = 0, paket dibuang dan ICMP "Time Exceeded" dikirim ke pengirim.', correctOrder: 2, description: 'Pengecekan TTL dan decrement.', colorClass: 'blue' },
      { id: 'fl3', text: 'Router memvalidasi Header Checksum; jika tidak cocok, paket dianggap rusak dan langsung dibuang.', correctOrder: 3, description: 'Verifikasi integritas header.', colorClass: 'green' },
      { id: 'fl4', text: 'Router membaca Destination IP Address dan mencocokannya dengan entri dalam tabel routing untuk menentukan interface keluar.', correctOrder: 4, description: 'Lookup tabel routing berdasarkan Destination IP.', colorClass: 'amber' },
      { id: 'fl5', text: 'Router mengupdate TTL (kurangi 1), hitung ulang Checksum, lalu teruskan paket ke interface yang sesuai.', correctOrder: 5, description: 'Update header dan forward paket.', colorClass: 'pink' },
    ],
    inquiryReflection1:
      'Jelaskan mengapa urutan 5 tahapan pemrosesan paket IP tersebut tidak bisa dibalik atau dilewati. Apa dampaknya jika router langsung meneruskan paket tanpa memeriksa TTL terlebih dahulu?',
    groups: [
      { id: 'hdr_ident', label: 'Identitas & Kontrol Paket', colorClass: 'blue' },
      { id: 'hdr_addr', label: 'Pengalamatan Sumber & Tujuan', colorClass: 'green' },
      { id: 'hdr_int', label: 'Integritas & Protokol', colorClass: 'purple' },
    ],
    groupItems: [
      { id: 'i1', text: 'Version (4 = IPv4)', correctGroup: 'hdr_ident' },
      { id: 'i2', text: 'TTL (Time to Live)', correctGroup: 'hdr_ident' },
      { id: 'i3', text: 'Source IP Address', correctGroup: 'hdr_addr' },
      { id: 'i4', text: 'Destination IP Address', correctGroup: 'hdr_addr' },
      { id: 'i5', text: 'Protocol (6=TCP, 17=UDP)', correctGroup: 'hdr_int' },
      { id: 'i6', text: 'Header Checksum', correctGroup: 'hdr_int' },
    ],
    inquiryReflection2:
      'Setelah mengklasifikasikan field-field IP Header tersebut, jelaskan mengapa setiap kategori (Identitas & Kontrol, Pengalamatan, Integritas & Protokol) harus ada secara bersamaan dalam satu IP Header. Apa yang terjadi jika salah satu kategori dihilangkan?',
    conclusionPrompt: 'Berdasarkan eksplorasi materi IP Header dan aktivitas penyusunan tahapan pemrosesan paket yang telah kamu lakukan, jelaskan bagaimana kamu mampu menguraikan komponen IP Header beserta fungsinya. Tuliskan secara runtut dengan kata-katamu sendiri.',
  },

  // ─── Questioning — X.IP.3 ────────────────────────────────────────────────
  {
    type: 'questioning',
    title: 'Questioning',
    description:
      'Siswa memahami struktur 32-bit alamat IPv4 melalui tiga fase interaktif: Chat Dua Arah dengan Server Bot, simulasi Oktet Overload Experiment, dan Reflection Dropdown untuk menarik kesimpulan.',
    objectiveCode: 'X.IP.3',
    activityGuide: [
      'Fase 1 — Chat Dua Arah: Amati diagram IPv4StructureDiagram yang menampilkan 4 oktet berwarna. Tanyakan dua pertanyaan secara berurutan kepada Server Bot untuk memahami mengapa IPv4 memiliki 32 bit dan berapa bit tiap oktet.',
      'Fase 2 — Oktet Overload Experiment: Coba simulasikan penambahan bit ke-9 pada sebuah oktet 8-bit. Amati pesan overload yang muncul, lalu tulis argumen mengapa 8 bit per oktet adalah batas yang tidak bisa dilanggar.',
      'Fase 3 — Reflection Dropdown: Lengkapi kalimat refleksi dengan memilih jawaban yang tepat di lima kolom dropdown inline untuk menyimpulkan struktur alamat IPv4.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: memahami secara runtut struktur 32-bit IPv4 (4 oktet × 8 bit) melalui Chat Dua Arah dengan Server Bot dan diagram interaktif IPv4StructureDiagram.',
      'Kemampuan Berargumen: menjelaskan secara logis mengapa oktet IPv4 tidak dapat melebihi 8 bit melalui simulasi Oktet Overload Experiment dan argumen tertulis (essay).',
      'Penarikan Kesimpulan: menyimpulkan struktur dan format alamat IPv4 (desimal bertitik vs biner) melalui aktivitas Reflection Dropdown dengan lima field inline.',
    ],
    facilitatorNotes: [
      'Guru mendampingi siswa saat Chat Dua Arah: pastikan siswa mengajukan pertanyaan sesuai urutan (q1 tentang total 32 bit dulu, baru q2 tentang bit per oktet).',
      'Guru memancing saat Oktet Overload: "Apa yang terjadi jika kita memaksa bit ke-9 masuk ke dalam oktet? Mengapa sistem langsung menolaknya?"',
      'Guru mengingatkan bahwa format desimal bertitik (dotted decimal) adalah cara manusia membaca IPv4, sedangkan komputer bekerja dengan 32-bit biner.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu membedakan struktur alamat IPv4 berdasarkan format penulisannya ',
      condition: 'melalui aktivitas questioning berupa Chat Dua Arah, Oktet Overload Experiment, dan Reflection Dropdown pada CONNETIC Module',
      degree: 'secara tepat dan runtut',
    },
    problemVisual: {
      icon: '!',
      title: 'IPv4 Validation Error — Format Tidak Valid',
      description:
        'Seorang siswa mengetikkan "256.168.1.1" sebagai alamat IP komputernya. Sistem jaringan menolak alamat tersebut dengan pesan error. Mengapa alamat ini tidak valid?',
      problemType: 'collision',
    },
    teacherQuestion:
      'Mengapa alamat "256.168.1.1" tidak dapat diterima sebagai alamat IPv4 yang valid, meskipun formatnya mirip dengan IPv4 biasa?',
    scenario:
      'Di laboratorium komputer sekolah, seorang siswa diminta menyeting IP address komputernya secara manual agar bisa terhubung ke jaringan. Ia mengetikkan "256.168.1.1" dan "192.168.1.300" sebagai percobaan. Kedua alamat itu langsung ditolak oleh sistem operasi komputer. Namun saat mencoba "192.168.1.100", komputer berhasil terhubung ke jaringan.',
    whyQuestion:
      'Mengapa nilai 256 tidak bisa menjadi oktet yang valid dalam sebuah alamat IPv4, sedangkan nilai 255 masih bisa diterima?',
    hint:
      'Ingat bahwa setiap oktet IPv4 terdiri dari tepat 8 bit. Berapakah nilai desimal terbesar yang bisa direpresentasikan oleh 8 bit? (Petunjuk: 2^8 = 256, artinya 8 bit bisa menampung 256 nilai berbeda, yaitu 0 sampai 255.)',
    reasonOptions: [
      {
        id: 'r1',
        text: 'Karena setiap oktet IPv4 hanya memiliki 8 bit, dan nilai maksimum 8 bit adalah 255 (= 11111111 dalam biner). Nilai 256 membutuhkan 9 bit sehingga tidak bisa direpresentasikan dalam satu oktet.',
        isCorrect: true,
        feedback:
          'Tepat! IPv4 adalah sistem pengalamatan 32-bit: 4 oktet × 8-bit. Nilai 8-bit berkisar 0–255. Angka 256 membutuhkan bit ke-9 (100000000 dalam biner = 9 bit), sehingga tidak muat dalam satu oktet IPv4.',
      },
      {
        id: 'r2',
        text: 'Karena 256 adalah alamat broadcast khusus yang dicadangkan oleh IANA dan tidak boleh diberikan ke perangkat manapun.',
        isCorrect: false,
        feedback:
          'Tidak tepat. Alamat broadcast IPv4 adalah nilai terakhir dalam setiap subnet (misalnya 192.168.1.255 untuk jaringan /24), bukan angka 256. Penolakan 256 bukan karena reservasi, melainkan karena batasan fisik 8-bit.',
      },
      {
        id: 'r3',
        text: 'Karena sistem operasi memblokir angka di atas 200 dalam oktet pertama untuk alasan keamanan jaringan.',
        isCorrect: false,
        feedback:
          'Tidak tepat. Sistem operasi tidak memblokir berdasarkan ambang keamanan seperti itu. Oktet pertama bahkan bisa bernilai hingga 255 (seperti Kelas E: 240–255). Penolakan murni karena batasan matematis 8-bit.',
      },
      {
        id: 'r4',
        text: 'Karena format IPv4 hanya menerima angka genap dalam setiap oktet untuk menjaga keselarasan bit.',
        isCorrect: false,
        feedback:
          'Tidak tepat sama sekali. IPv4 menerima semua nilai desimal dari 0 hingga 255 di setiap oktet, baik genap maupun ganjil. Tidak ada aturan "hanya angka genap" dalam pengalamatan IPv4.',
      },
    ],
    questionBank: [
      {
        id: 'q1',
        text: 'Apa format penulisan IPv4 yang valid?',
        response:
          'Format IPv4 yang valid terdiri dari tepat 4 oktet desimal (0–255), dipisahkan oleh tanda titik. Contoh valid: 192.168.1.1, 10.0.0.1, 172.16.254.100. Tidak valid: nilai > 255 (misal 256.0.0.1), oktet kurang dari 4 (misal 192.168.1), atau karakter non-angka (misal 192.168.a.1).',
      },
      {
        id: 'q2',
        text: 'Mengapa nilai 0 dan 255 tetap valid sebagai oktet IPv4?',
        response:
          '0 valid karena merepresentasikan 00000000 (8 bit, semua nol) — digunakan dalam Network Address. 255 valid karena merepresentasikan 11111111 (8 bit, semua satu) — digunakan dalam Broadcast Address dan Subnet Mask. Keduanya masih dalam rentang 8-bit yang valid (0 sampai 255).',
      },
      {
        id: 'q3',
        text: 'Apakah "192.168.01.1" (dengan angka nol di depan) adalah IPv4 yang valid?',
        response:
          'Bergantung pada konteks! Secara teknis, "01" bisa diinterpretasikan sebagai angka octal (= 1 dalam desimal) oleh beberapa sistem, yang bisa menyebabkan ambiguitas. Praktik terbaik adalah TIDAK menggunakan leading zero dalam oktet IPv4. Tulis "192.168.1.1" tanpa angka nol di depan untuk menghindari kebingungan.',
      },
    ],
    conclusionPrompt: 'Berdasarkan analisis skenario IPv4 Validation Error dan tanya jawab yang telah kamu lakukan, jelaskan bagaimana kamu mampu membedakan struktur alamat IPv4 berdasarkan format penulisannya. Jelaskan aturan yang menentukan apakah suatu format IPv4 valid atau tidak valid. Tuliskan secara tepat dengan kata-katamu sendiri.',
  },

  // ─── Learning Community — X.IP.4 & X.IP.5 ───────────────────────────────
  {
    type: 'learning-community',
    title: 'Learning Community',
    description:
      'Siswa berkolaborasi dalam kelompok untuk mengidentifikasi kelas IPv4, jenis alamat (Private/Public), dan menghitung range host berdasarkan studi kasus jaringan nyata.',
    objectiveCode: 'X.IP.4 & X.IP.5',
    activityGuide: [
      'Susun 3 kelas IPv4 (A, B, C) ke dalam urutan berdasarkan rentang oktet pertamanya menggunakan Interactive Timeline.',
      'Analisis Studi Kasus 1 (Klasifikasi & Jenis IP Jaringan Sekolah): pilih jawaban, tulis argumen, kirim ke kelompok.',
      'Analisis Studi Kasus 2 (Menghitung Range Host Jaringan Rumah): pilih jawaban, tulis argumen, kirim ke kelompok.',
      'Diskusikan dan beri vote pada argumen terbaik di papan diskusi kelompok.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengurutkan kelas IPv4 berdasarkan rentang oktet pertama dan menerapkan kriteria identifikasi kelas secara logis.',
      'Kemampuan Berargumen: menyampaikan alasan teknis yang jelas dalam diskusi kelompok berdasarkan studi kasus kelas IP dan perhitungan range host.',
      'Penarikan Kesimpulan: menyimpulkan kembali perbedaan kelas IPv4 dan cara menghitung range host berdasarkan hasil aktivitas dan diskusi kelompok.',
    ],
    facilitatorNotes: [
      'Guru memastikan setiap siswa menyelesaikan Timeline Flowchart sebelum masuk ke papan kolaboratif.',
      'Guru menekankan perbedaan Private IP vs Public IP: Private digunakan dalam jaringan lokal (tidak dapat dirutekan di internet), Public digunakan untuk komunikasi antar jaringan global.',
      'Guru menunjukkan formula range host: 2^(jumlah bit Host ID) − 2, di mana −2 untuk Network Address dan Broadcast Address.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menerapkan pengetahuan kelas IPv4 beserta rentang alamat Private & Public serta konsep range host IPv4',
      condition: 'melalui aktivitas learning community berupa Interactive Timeline Flowchart dan papan kolaboratif studi kasus pada CONNETIC Module',
      degree: 'secara logis',
    },
    timelineFlowchart: {
      instruction: 'Susun ketiga kelas IPv4 berikut ke dalam urutan yang benar berdasarkan rentang nilai oktet pertamanya (dari nilai paling kecil ke paling besar). Tarik dan letakkan setiap blok ke slot Langkah 1, Langkah 2, dan Langkah 3.',
      blocks: [
        { id: 'block_a', label: 'Blok A', text: 'Kelas A — Oktet pertama: 1–126. Format N.H.H.H. Subnet mask default: /8 (255.0.0.0). Mendukung jaringan sangat besar: hingga ~16 juta host per jaringan.', correctSlot: 1 },
        { id: 'block_b', label: 'Blok B', text: 'Kelas B — Oktet pertama: 128–191. Format N.N.H.H. Subnet mask default: /16 (255.255.0.0). Mendukung jaringan menengah: hingga ~65.534 host per jaringan.', correctSlot: 2 },
        { id: 'block_c', label: 'Blok C', text: 'Kelas C — Oktet pertama: 192–223. Format N.N.N.H. Subnet mask default: /24 (255.255.255.0). Mendukung jaringan kecil: hingga 254 host per jaringan.', correctSlot: 3 },
      ],
      successMessage: '✅ Klasifikasi Kelas IPv4 Benar! Kelas A (1–126) untuk jaringan besar → Kelas B (128–191) untuk jaringan menengah → Kelas C (192–223) untuk jaringan kecil. Semakin tinggi kelas, semakin kecil jumlah host yang bisa ditampung per jaringan.',
      errorFeedback: 'Urutan belum tepat. Ingat: kelas IP dibedakan berdasarkan nilai oktet pertama. Kelas A memiliki rentang oktet pertama paling rendah (1–126), diikuti Kelas B (128–191), lalu Kelas C (192–223). Susun ulang dari nilai paling kecil ke paling besar.',
    },
    layers5: [
      { id: 'L5', name: 'Application', pdu: 'Data', color: '#8B5CF6', desc: 'Siswa mengakses e-learning sekolah melalui browser menggunakan HTTP.' },
      { id: 'L4', name: 'Transport (TCP)', pdu: 'Segment', color: '#628ECB', desc: 'TCP memecah halaman web menjadi segmen dan memastikan semua tiba utuh.' },
      { id: 'L3', name: 'Network (IP)', pdu: 'Packet', color: '#10B981', desc: 'IP menambahkan alamat sumber (IP siswa) dan tujuan (IP server) pada setiap paket.' },
      { id: 'L2', name: 'Data Link', pdu: 'Frame', color: '#F59E0B', desc: 'Ethernet membungkus paket dengan MAC Address untuk pengiriman di jaringan lokal.' },
      { id: 'L1', name: 'Physical', pdu: 'Bits', color: '#395886', desc: 'Kabel UTP atau Wi-Fi mengalirkan bit sebagai sinyal listrik atau gelombang radio.' },
    ],
    encapsulationCase: {
      id: 'X.IP.4.A',
      title: 'Studi Kasus: Klasifikasi IP Jaringan Sekolah',
      concept:
        'Setiap alamat IPv4 dapat diklasifikasikan berdasarkan nilai oktet pertama (Kelas A: 1–126, Kelas B: 128–191, Kelas C: 192–223). Selain kelas, alamat IP juga dibedakan menjadi Private (hanya berlaku di jaringan lokal, tidak bisa dirutekan di internet) dan Public (dapat diakses dari seluruh internet). Range Private: Kelas A = 10.0.0.0–10.255.255.255; Kelas B = 172.16.0.0–172.31.255.255; Kelas C = 192.168.0.0–192.168.255.255.',
      scenario:
        'Seorang teknisi jaringan baru di SMA Nusantara menemukan bahwa seluruh komputer di sekolah menggunakan alamat IP dalam rentang 192.168.10.0/24. Server e-learning sekolah memiliki alamat 192.168.10.5, dan komputer guru menggunakan 192.168.10.20. Teknisi tersebut perlu melaporkan: kelas IP apa yang digunakan, apakah termasuk Private atau Public, dan subnet mask defaultnya.',
      question:
        'Berdasarkan skenario di atas, identifikasi kelas IP, jenis (Private/Public), dan subnet mask default jaringan sekolah tersebut.',
      options: [
        {
          id: 'A',
          isCorrect: true,
          text: 'Kelas C (oktet pertama = 192, masuk rentang 192–223), Private IP (192.168.x.x masuk range Private Kelas C: 192.168.0.0–192.168.255.255), Subnet Mask Default: 255.255.255.0 (/24).',
          logic: 'Tepat. 192 berada di rentang 192–223 → Kelas C. Rentang 192.168.0.0–192.168.255.255 adalah Private Kelas C. Subnet Mask /24 = 255.255.255.0 adalah default untuk Kelas C.',
        },
        {
          id: 'B',
          isCorrect: false,
          text: 'Kelas B (karena angka 192 mendekati 191), Private IP, Subnet Mask: 255.255.0.0 (/16).',
          logic: 'Tidak tepat. Kelas B berakhir di 191; angka 192 sudah masuk Kelas C. Satu pun angka tidak boleh "mendekati" batas — kelas ditentukan persis berdasarkan nilai oktet pertama.',
        },
        {
          id: 'C',
          isCorrect: false,
          text: 'Kelas C, Public IP (karena digunakan di sekolah yang terhubung ke internet), Subnet Mask: 255.255.255.0.',
          logic: 'Kelas C-nya benar, tapi jenis IP-nya salah. 192.168.x.x adalah Private IP — tidak bisa diakses langsung dari internet. Sekolah terhubung ke internet melalui NAT (Network Address Translation) yang mengkonversi Private ke Public di router.',
        },
      ],
      argumentPrompt:
        'Jelaskan alasan teknismu: Mengapa jaringan sekolah menggunakan Private IP (192.168.x.x) dan bukan Public IP untuk komputer-komputer internalnya? Apa keuntungannya?',
    },
    decapsulationCase: {
      id: 'X.IP.5.B',
      title: 'Studi Kasus: Menghitung Range Host Jaringan Rumah',
      concept:
        'Range host (usable host range) adalah rentang alamat IP yang bisa diberikan ke perangkat aktual dalam suatu jaringan. Formula: Usable Hosts = 2^(jumlah bit Host ID) − 2. Pengurangan 2 adalah untuk Network Address (Host ID semua 0) dan Broadcast Address (Host ID semua 1) yang tidak bisa digunakan perangkat. Untuk jaringan /24 (Kelas C), Host ID = 8 bit, sehingga Usable Hosts = 2^8 − 2 = 254.',
      scenario:
        'Sebuah keluarga memiliki jaringan rumah dengan alamat jaringan 192.168.1.0/24. Router rumah mereka beralamat 192.168.1.1. Keluarga tersebut ingin tahu: berapa banyak perangkat yang bisa dihubungkan ke jaringan ini? Apa alamat pertama dan terakhir yang bisa diberikan ke perangkat (misal laptop, HP, TV)?',
      question:
        'Hitung Network Address, Broadcast Address, dan Usable Host Range untuk jaringan 192.168.1.0/24.',
      options: [
        {
          id: 'A',
          isCorrect: true,
          text: 'Network Address: 192.168.1.0 | Broadcast Address: 192.168.1.255 | Usable Host Range: 192.168.1.1 – 192.168.1.254 | Jumlah host: 254 perangkat.',
          logic: 'Tepat. /24 berarti 24 bit Network + 8 bit Host. Network Address = Host ID semua 0 = .0. Broadcast = Host ID semua 1 = .255. Usable = .1 sampai .254 = 254 alamat.',
        },
        {
          id: 'B',
          isCorrect: false,
          text: 'Network Address: 192.168.1.0 | Broadcast Address: 192.168.1.255 | Usable Host Range: 192.168.1.0 – 192.168.1.255 | Jumlah host: 256 perangkat.',
          logic: 'Hampir benar tapi salah di jumlah! Network Address (.0) dan Broadcast Address (.255) tidak bisa diberikan ke perangkat. Usable range dimulai dari .1 dan berakhir di .254, bukan .0–.255.',
        },
        {
          id: 'C',
          isCorrect: false,
          text: 'Network Address: 192.168.1.1 | Broadcast Address: 192.168.1.254 | Usable Host Range: 192.168.1.2 – 192.168.1.253 | Jumlah host: 252 perangkat.',
          logic: 'Salah. Network Address selalu Host ID semua 0 (= .0), bukan .1. Broadcast selalu Host ID semua 1 (= .255), bukan .254. Usable range adalah .1 hingga .254.',
        },
      ],
      argumentPrompt:
        'Jelaskan mengapa dua alamat dalam setiap jaringan (Network Address dan Broadcast Address) tidak bisa diberikan ke perangkat aktual. Apa fungsi masing-masing alamat tersebut dalam operasional jaringan?',
    },
    groupActivity: {
      groupNames: ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'],
      discussionPrompt:
        'Diskusikan bersama kelompok menggunakan pertanyaan pemandu berikut:\n1. Mengapa Private IP lebih banyak digunakan di jaringan lokal (rumah, sekolah, kantor) dibanding Public IP?\n2. Jika jaringan rumah /24 memiliki 254 usable host, mengapa kita masih membatasi DHCP pool-nya (misalnya hanya .100–.200)?\n3. Bagaimana cara teknisi mengetahui kelas IP hanya dari melihat oktet pertama?\n\nBerikan vote pada argumen teknis terkuat dari kelompokmu!',
    },
    conclusionPrompt: 'Berdasarkan aktivitas penyusunan Timeline Kelas IPv4 dan diskusi kelompok tentang studi kasus jaringan sekolah dan rumah, jelaskan bagaimana kamu mampu menerapkan pengetahuan kelas IPv4 beserta rentang alamat Private & Public serta konsep range host IPv4. Tuliskan secara logis dengan kata-katamu sendiri.',
  },

  // ─── Modeling — X.IP.6 ───────────────────────────────────────────────────
  {
    type: 'modeling',
    title: 'Demonstrasi Konversi Desimal ↔ Biner IPv4',
    description:
      'Siswa mempraktikkan secara interaktif proses konversi alamat IPv4 dari format desimal bertitik ke representasi biner 32-bit, memahami sistem bobot bit, dan menerapkan konversi pada oktet nyata.',
    objectiveCode: 'X.IP.6',
    activityGuide: [
      'Ikuti demonstrasi sistem bobot bit (128–64–32–16–8–4–2–1) untuk memahami cara kerja konversi biner.',
      'Amati contoh konversi angka 192 → 11000000 secara step-by-step.',
      'Praktikkan konversi mandiri: ubah oktet 168 ke biner 8-bit menggunakan tabel bobot bit.',
      'Gabungkan hasil konversi untuk membentuk representasi biner 32-bit alamat IPv4 lengkap.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengikuti proses konversi desimal ke biner secara sistematis menggunakan tabel bobot bit, langkah demi langkah.',
      'Kemampuan Berargumen: menjelaskan mengapa pemahaman konversi biner penting bagi seorang administrator jaringan dalam konteks subnet mask dan pengalamatan IPv4.',
      'Penarikan Kesimpulan: menyimpulkan hubungan antara format desimal IPv4 dan representasi biner 32-bit, serta kaitannya dengan batasan nilai oktet (0–255).',
    ],
    facilitatorNotes: [
      'Guru menggunakan analogi "timbangan biner": setiap bit adalah batu timbangan dengan berat 128, 64, 32, 16, 8, 4, 2, 1. Kita pilih kombinasi yang totalnya sama dengan angka desimal.',
      'Guru menunjukkan bahwa 255 = 11111111 (semua bit aktif) dan 0 = 00000000 (semua bit mati) — ini kenapa oktet IPv4 tidak pernah melebihi 255.',
      'Guru meminta siswa membuktikan: mengapa subnet mask 255.255.255.0 ditulis /24? (Hitung berapa bit yang bernilai 1: 8+8+8+0 = 24 bit aktif).',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mensimulasikan proses konversi alamat IPv4 dari format desimal ke biner',
      condition: 'melalui aktivitas modeling berupa simulasi step-by-step pada CONNETIC Module',
      degree: 'secara sistematis',
    },
    practiceInstructions: {
      forTeacher: [
        'Tampilkan tabel bobot bit di papan tulis: 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1.',
        'Demonstrasikan: 192 = 128 + 64. Aktifkan bit posisi 128 (→1) dan 64 (→1), sisanya 0. Hasilnya: 11000000.',
        'Tunjukkan konversi subnet mask: 255 = 11111111 (semua 1), 0 = 00000000 (semua 0). Sehingga 255.255.255.0 = 11111111.11111111.11111111.00000000.',
      ],
      forStudent: [
        'Mulai dari bobot bit terbesar (128). Tanya: apakah angka desimalmu ≥ 128? Jika ya, aktifkan bit tersebut (1) dan kurangi angka dengan 128.',
        'Lanjutkan ke bobot berikutnya (64, 32, ..., 1). Ulangi langkah yang sama.',
        'Setelah semua 8 bit ditentukan (1 atau 0), gabungkan hasilnya — itulah representasi biner oktet tersebut.',
      ],
    },
    modelingSteps: [
      {
        id: 'ipm1',
        type: 'example',
        title: 'Langkah 1: Memahami Sistem Bobot Bit',
        content:
          'Setiap oktet IPv4 terdiri dari 8 posisi bit. Nilai bobot setiap posisi (dari kiri ke kanan): 128, 64, 32, 16, 8, 4, 2, 1. Nilai total maksimum = 128+64+32+16+8+4+2+1 = 255. Minimum = semua bit 0 = nilai 0. Inilah mengapa setiap oktet IPv4 hanya bisa bernilai antara 0 dan 255.',
        interactiveAction: 'Amati tabel bobot bit dan pastikan kamu memahami nilai setiap posisi sebelum melanjutkan.',
      },
      {
        id: 'ipm2',
        type: 'example',
        title: 'Langkah 2: Konversi 192 → Biner (Demonstrasi)',
        content:
          '192 = 128 + 64. Periksa setiap bobot dari terbesar: 128 ≤ 192 → aktifkan bit (1), sisa = 192−128 = 64. 64 ≤ 64 → aktifkan bit (1), sisa = 0. Semua bobot berikutnya (32, 16, 8, 4, 2, 1) > 0 sehingga bit = 0. Hasil: 11000000. Verifikasi: 128+64 = 192 ✓',
        interactiveAction: 'Simak demonstrasi aktivasi bit untuk angka 192 secara visual step-by-step.',
      },
      {
        id: 'ipm3',
        type: 'practice',
        title: 'Langkah 3: Konversi 168 → Biner (Mandiri)',
        content:
          'Sekarang giliranmu! Konversi 168 ke biner 8-bit. Petunjuk: 168 = 128 + 32 + 8. Aktifkan bit posisi 128, 32, dan 8 (bernilai 1), sisanya 0. Hasil: 10101000. Verifikasi: 128+32+8 = 168 ✓',
        interactiveAction: 'Ikuti langkah-langkah konversi untuk angka 168 menggunakan metode yang sama seperti demonstrasi angka 192.',
      },
      {
        id: 'ipm4',
        type: 'practice',
        title: 'Langkah 4: Merangkai IPv4 Biner 32-bit',
        content:
          'Alamat IPv4 192.168.1.1 dalam biner penuh: 192=11000000, 168=10101000, 1=00000001, 1=00000001. Gabungkan: 11000000.10101000.00000001.00000001 (32 bit total). Inilah cara komputer "melihat" alamat IP — bukan sebagai angka desimal, melainkan sebagai deretan 32 bit biner.',
        interactiveAction: 'Susun keempat oktet hasil konversimu menjadi representasi biner IPv4 lengkap 32-bit.',
      },
    ],
    conclusionPrompt: 'Berdasarkan simulasi konversi desimal ke biner IPv4 yang telah kamu praktikkan, jelaskan bagaimana kamu mampu mensimulasikan proses konversi alamat IPv4 dari format desimal ke biner. Jelaskan juga hubungan antara sistem biner 8-bit per oktet dan batasan nilai 0–255 dalam IPv4. Tuliskan secara sistematis dengan kata-katamu sendiri.',
  },

  // ─── Reflection — X.IP.7 ────────────────────────────────────────────────
  {
    type: 'reflection',
    title: 'Reflection',
    description:
      'Siswa menyusun pipeline konsep IPv4, menganalisis dampak jika pengalamatan IP tidak terstruktur, dan menyimpulkan sistem IPv4 sebagai fondasi konfigurasi jaringan yang terstruktur.',
    objectiveCode: 'X.IP.7',
    activityGuide: [
      'Tinjau kembali hasil pembelajaran dari tahapan sebelumnya (Peran IP, IP Header, Kelas IPv4, Konversi Biner).',
      'Susun komponen sistem IPv4 secara berurutan menggunakan drag-and-drop pipeline.',
      'Tulis argumen analisis tentang pentingnya penggunaan Private IP di jaringan lokal.',
      'Lengkapi kesimpulan rumpang menggunakan dropdown yang tersedia.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menyusun komponen sistem IPv4 (Pengalamatan IP, Klasifikasi Kelas, Manajemen Range Host) secara berurutan sesuai hierarki konsep.',
      'Kemampuan Berargumen: menganalisis dampak penggunaan Public IP untuk semua perangkat di jaringan lokal dan mengapa Private IP lebih tepat.',
      'Penarikan Kesimpulan: menyimpulkan sistem pengalamatan IPv4 bekerja pada Network Layer sebagai fondasi identifikasi dan routing perangkat dalam jaringan.',
    ],
    facilitatorNotes: [
      'Guru mendorong siswa merefleksikan keterbatasan IPv4 (hanya ~4,3 miliar alamat unik) sebagai jembatan ke materi IPv6 pada pertemuan berikutnya.',
      'Guru menekankan bahwa ketiga komponen IPv4 (Pengalamatan, Klasifikasi, Range Host) adalah satu kesatuan — tidak bisa ada yang dilewati.',
      'Guru mendorong siswa menjawab: "Jika IPv4 hanya punya ~4,3 miliar alamat, mengapa masih bisa mencukupi miliaran perangkat di dunia?" (Jawaban: NAT + Private IP).',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menyimpulkan sistem pengalamatan IPv4 sebagai fondasi konfigurasi jaringan yang terstruktur',
      condition: 'melalui aktivitas reflection berupa IPv4 Blueprint Constructor pada CONNETIC Module',
      degree: 'secara tepat',
    },
    tcpReliabilityPipeline: {
      instruction: 'Susun ketiga komponen sistem pengalamatan IPv4 berikut ke dalam urutan yang benar — dari konsep paling mendasar ke paling operasional. Seret dan letakkan setiap komponen ke slot Langkah 1, Langkah 2, dan Langkah 3.',
      items: [
        { id: 'ipaddr', label: 'Pengalamatan IP (IP Addressing)', description: 'Memberikan identitas unik (IP Address) kepada setiap perangkat dalam jaringan agar dapat diidentifikasi dan dirutekan secara logis pada Network Layer.', correctOrder: 1 },
        { id: 'ipclass', label: 'Klasifikasi Kelas IPv4', description: 'Mengelompokkan alamat IP ke dalam Kelas A, B, atau C berdasarkan oktet pertama, serta membedakan Private IP (untuk jaringan lokal) dari Public IP (untuk internet).', correctOrder: 2 },
        { id: 'hostrange', label: 'Manajemen Range Host', description: 'Menghitung Network Address, Broadcast Address, dan Usable Host Range dari suatu subnet untuk menentukan berapa perangkat yang bisa dialamatkan dalam jaringan tersebut.', correctOrder: 3 },
      ],
      successMessage: 'Sistem IPv4 Utuh! Pengalamatan IP memberikan identitas → Klasifikasi Kelas menentukan ukuran dan jenis jaringan → Manajemen Range Host mengoptimalkan penggunaan alamat. Ketiganya bekerja sebagai satu kesatuan.',
    },
    reliabilityArguingQuestion: 'Apa yang terjadi jika seluruh perangkat di jaringan sekolah (komputer, printer, server internal) menggunakan Public IP Address, bukan Private IP? Apakah jaringan tetap bisa berfungsi? Jelaskan argumenmu secara logis beserta risikonya.',
    dropdownConclusion: {
      instruction: 'Lengkapi kesimpulan berikut dengan memilih jawaban yang tepat pada setiap dropdown.',
      templateParts: [
        'Saya menyimpulkan sistem pengalamatan IPv4 bekerja pada ',
        ' Layer. Jika dua perangkat dalam satu jaringan lokal menggunakan alamat IP yang identik, maka dampaknya adalah ',
        '.',
      ],
      dropdowns: [
        {
          id: 'layer',
          placeholder: 'Pilih Layer',
          options: [
            { value: 'application', label: 'Application', isCorrect: false },
            { value: 'transport', label: 'Transport', isCorrect: false },
            { value: 'network', label: 'Network', isCorrect: true },
            { value: 'data_link', label: 'Data Link', isCorrect: false },
          ],
        },
        {
          id: 'dampak',
          placeholder: 'Pilih Dampak',
          options: [
            { value: 'konflik', label: 'Konflik IP — koneksi keduanya tidak stabil dan data bisa salah kirim', isCorrect: true },
            { value: 'berbagi', label: 'Kedua perangkat saling berbagi bandwidth secara otomatis', isCorrect: false },
            { value: 'aman', label: 'Data tetap terkirim dengan aman karena MAC Address berbeda', isCorrect: false },
            { value: 'router', label: 'Router otomatis mengganti salah satu IP agar tidak bentrok', isCorrect: false },
          ],
        },
      ],
    },
    conclusionPrompt: 'Berdasarkan penyusunan pipeline sistem IPv4 dan analisis yang telah kamu lakukan, simpulkan bagaimana sistem pengalamatan IPv4 (Pengalamatan IP, Klasifikasi Kelas, Manajemen Range Host) bekerja sebagai satu kesatuan yang utuh pada Network Layer dalam mendukung komunikasi jaringan yang terstruktur.',
  },

  // ─── Authentic Assessment — X.IP.8 ──────────────────────────────────────
  {
    type: 'authentic-assessment',
    title: 'Authentic Assessment',
    description:
      'Siswa menganalisis skenario pengalamatan IPv4 pada jaringan sederhana melalui studi kasus bercabang untuk mengenali IP Private dan Public, menentukan penggunaan IP yang tepat, serta memahami fungsi dasar pengalamatan IPv4.',
    objectiveCode: 'X.IP.8',
    activityGuide: [
      'Baca studi kasus tentang pengalamatan IPv4 di laboratorium komputer sekolah.',
      'Ikuti setiap percabangan keputusan: tentukan jenis IP yang tepat, kenali mana yang Private dan Public, lalu pilih alamat yang sesuai kebutuhan.',
      'Tuliskan argumen logismu saat diminta, dan pilih kesimpulan yang paling tepat tentang fungsi dasar pengalamatan IPv4 Private & Public.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menentukan jenis IP yang tepat secara berurutan — dari memilih Private atau Public, hingga mengenali alamat yang valid dan sesuai kebutuhan jaringan.',
      'Kemampuan Berargumen: menjelaskan alasan mengapa perangkat di jaringan lokal lebih tepat menggunakan IP Private daripada IP Public.',
      'Penarikan Kesimpulan: memilih kesimpulan yang tepat tentang prinsip dasar pengalamatan IPv4 Private & Public untuk jaringan sederhana.',
    ],
    facilitatorNotes: [
      'Guru menekankan perbedaan mendasar antara IP Private (untuk jaringan lokal) dan IP Public (untuk internet/jaringan global).',
      'Guru mengingatkan range IP Private: Kelas A (10.x.x.x), Kelas B (172.16.x.x–172.31.x.x), Kelas C (192.168.x.x).',
      'Guru mendorong siswa mengaitkan keputusan pengalamatan dengan fungsi TCP/IP yang sudah dipelajari: IP sebagai identitas perangkat pada Network Layer.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menganalisis skenario perancangan pengalamatan IPv4 Private & Public pada arsitektur TCP/IP',
      condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
      degree: 'secara logis',
    },
    branchingScenario: {
      mode: 'tcp-branching',
      caseTitle: 'Pengalamatan IPv4 Laboratorium Komputer Sekolah',
      context:
        'SMK Nusantara memiliki laboratorium komputer dengan 15 unit komputer untuk kegiatan praktik siswa. Pak Budi, guru mata pelajaran TKJ, meminta kamu membantu menentukan pengalamatan IPv4 yang tepat agar seluruh komputer di laboratorium dapat saling terhubung dengan benar dalam jaringan lokal sekolah.',
      initialQuestion:
        'Ikuti tiap percabangan berikut dan tentukan pengalamatan IPv4 Private & Public yang paling tepat untuk laboratorium komputer ini.',
      focusAreas: ['Mengenali IP Private dan Public', 'Memilih IP yang sesuai kebutuhan', 'Memahami fungsi dasar pengalamatan IPv4'],
      choices: [],
      steps: [
        {
          id: 'step-1',
          prompt: 'Langkah pertama: Jenis alamat IPv4 apa yang paling tepat digunakan untuk komputer-komputer di laboratorium sekolah ini?',
          options: [
            {
              id: 'step-1-wrong1',
              text: 'IP Public untuk semua komputer, agar setiap perangkat di laboratorium mudah diakses dan dikenali dari jaringan manapun di luar sekolah.',
              isCorrect: false,
              feedback: 'Tidak tepat. IP Public digunakan untuk perangkat yang perlu diakses dari internet. Komputer di laboratorium sekolah hanya perlu berkomunikasi di dalam jaringan lokal, sehingga IP Public tidak diperlukan di sini.',
            },
            {
              id: 'step-1-correct',
              text: 'IP Private seperti 192.168.1.x, karena seluruh komputer di laboratorium hanya perlu saling terhubung dalam jaringan lokal sekolah, tanpa akses dari internet.',
              isCorrect: true,
              feedback: 'Tepat! IP Private memang dirancang untuk komunikasi di jaringan lokal (LAN). Komputer-komputer di laboratorium sekolah tidak perlu diakses dari luar, sehingga IP Private adalah pilihan yang paling sesuai.',
            },
            {
              id: 'step-1-wrong2',
              text: 'Boleh menggunakan IP apa saja secara bebas, karena IP Private maupun Public pada dasarnya bekerja dengan cara yang sama di dalam jaringan.',
              isCorrect: false,
              feedback: 'Tidak tepat. IP Private dan IP Public memiliki fungsi yang berbeda. IP Private dirancang khusus untuk jaringan lokal, sedangkan IP Public digunakan untuk identifikasi di internet. Keduanya tidak bisa saling menggantikan begitu saja.',
            },
          ],
        },
        {
          id: 'step-2',
          prompt: 'Langkah kedua: Pak Budi memeriksa daftar alamat IPv4 berikut. Manakah yang merupakan alamat IP Private yang valid dan tepat digunakan untuk komputer di laboratorium?',
          options: [
            {
              id: 'step-2-wrong1',
              text: '8.8.8.8 — alamat ini populer dan banyak dikenal sehingga mudah diingat dan dianggap cocok untuk perangkat di jaringan lokal sekolah.',
              isCorrect: false,
              feedback: 'Tidak tepat. 8.8.8.8 adalah IP Public milik Google (Google DNS). Alamat ini bukan milik jaringan sekolah dan tidak boleh digunakan untuk perangkat lokal, karena termasuk IP Public yang dikelola di internet.',
            },
            {
              id: 'step-2-wrong2',
              text: '172.32.0.5 — tampilannya mirip format IP Kelas B Private sehingga terlihat sesuai untuk digunakan di jaringan lokal laboratorium sekolah.',
              isCorrect: false,
              feedback: 'Tidak tepat. Range IP Private Kelas B hanya mencakup 172.16.0.0 – 172.31.255.255. Alamat 172.32.0.5 berada di luar range tersebut, sehingga termasuk IP Public dan tidak tepat digunakan di jaringan lokal sekolah.',
            },
            {
              id: 'step-2-correct',
              text: '192.168.5.10 — masuk dalam range IP Private Kelas C (192.168.0.0–192.168.255.255), sehingga valid dan tepat digunakan untuk perangkat di jaringan lokal sekolah.',
              isCorrect: true,
              feedback: 'Tepat! Alamat 192.168.5.10 berada dalam range IP Private Kelas C (192.168.0.0 – 192.168.255.255), sehingga valid dan sesuai digunakan untuk komputer di jaringan lokal sekolah.',
            },
          ],
        },
        {
          id: 'step-3',
          prompt: 'Langkah ketiga: Komputer A di laboratorium memiliki IP 192.168.5.1, dan Komputer B memiliki IP 10.0.0.1. Apa yang bisa disimpulkan tentang kedua alamat tersebut?',
          options: [
            {
              id: 'step-3-correct',
              text: 'Keduanya adalah IP Private: 192.168.5.1 adalah IP Private Kelas C, dan 10.0.0.1 adalah IP Private Kelas A. Keduanya hanya digunakan di jaringan lokal, bukan di internet global.',
              isCorrect: true,
              feedback: 'Tepat! IP Private ada di tiga kelas: Kelas A (10.x.x.x), Kelas B (172.16.x.x–172.31.x.x), dan Kelas C (192.168.x.x). Baik 192.168.5.1 maupun 10.0.0.1 sama-sama IP Private yang valid untuk jaringan lokal.',
            },
            {
              id: 'step-3-wrong1',
              text: 'Hanya 192.168.5.1 yang termasuk IP Private; 10.0.0.1 dianggap IP Public karena format angkanya berbeda dan tidak tampak seperti IP Kelas C yang biasa digunakan.',
              isCorrect: false,
              feedback: 'Tidak tepat. 10.0.0.1 adalah IP Private Kelas A (range 10.0.0.0 – 10.255.255.255). Kelas A Private memiliki range yang sangat luas dan memang berbeda tampilan dari Kelas C, tetapi tetap termasuk IP Private.',
            },
            {
              id: 'step-3-wrong2',
              text: 'Keduanya adalah IP Public karena tidak memiliki batasan khusus dan bebas digunakan oleh perangkat manapun di jaringan komputer lokal maupun global.',
              isCorrect: false,
              feedback: 'Tidak tepat. Baik 192.168.5.1 maupun 10.0.0.1 adalah IP Private yang sudah ditetapkan oleh standar internasional (RFC 1918) khusus untuk jaringan lokal. IP Public berbeda dan dikelola secara global oleh IANA.',
            },
          ],
        },
        {
          id: 'step-4',
          prompt: 'Langkah keempat: Sekolah ingin menambah 1 unit server untuk menyimpan dokumen dan tugas siswa. Server ini hanya perlu diakses dari dalam laboratorium. Alamat IPv4 mana yang PALING TEPAT untuk server tersebut?',
          options: [
            {
              id: 'step-4-wrong1',
              text: '203.130.196.5 — IP Public yang memudahkan siswa dan guru mengakses server dari jaringan manapun, baik dari dalam maupun luar sekolah.',
              isCorrect: false,
              feedback: 'Tidak tepat. Server ini hanya perlu diakses dari dalam laboratorium, bukan dari internet. Menggunakan IP Public untuk keperluan ini tidak efisien dan tidak sesuai kebutuhan — IP Private sudah cukup untuk komunikasi dalam jaringan lokal.',
            },
            {
              id: 'step-4-correct',
              text: '192.168.5.100 — IP Private Kelas C yang valid dan sesuai untuk server internal yang hanya perlu diakses dari dalam jaringan lokal laboratorium sekolah.',
              isCorrect: true,
              feedback: 'Tepat! Server yang hanya diakses dari dalam jaringan lokal cukup menggunakan IP Private. Alamat 192.168.5.100 valid, masuk dalam range Kelas C Private, dan cocok untuk server internal di laboratorium sekolah.',
            },
            {
              id: 'step-4-wrong2',
              text: '256.168.5.1 — angka besar pada oktet pertama membuatnya mudah dikenali sebagai server dan tidak tertukar dengan alamat komputer siswa lainnya.',
              isCorrect: false,
              feedback: 'Tidak valid. Nilai setiap oktet dalam alamat IPv4 hanya boleh antara 0 hingga 255. Angka 256 melebihi batas maksimum, sehingga 256.168.5.1 bukan alamat IPv4 yang valid dan tidak bisa digunakan.',
            },
          ],
        },
      ],
      argumentAfterStepId: 'step-2',
      argumentPrompt: 'Mengapa komputer-komputer di laboratorium sekolah lebih tepat menggunakan IP Private daripada IP Public? Jelaskan dengan kata-katamu sendiri.',
      conclusionQuestion: 'Prinsip dasar pengalamatan IPv4 yang paling tepat untuk jaringan lokal sederhana seperti laboratorium sekolah adalah...',
      conclusionOptions: [
        {
          id: 'ip-conclusion-2',
          text: 'Gunakan IP Public untuk semua perangkat agar setiap komputer di laboratorium dapat dikenali dan diakses langsung dari internet oleh siapa saja.',
          isCorrect: false,
          feedback: 'Tidak tepat. Perangkat di jaringan lokal seperti komputer laboratorium tidak perlu IP Public. IP Public terbatas jumlahnya dan digunakan untuk perangkat yang harus diakses dari internet. Menggunakannya untuk semua perangkat lokal tidak efisien dan tidak sesuai kebutuhan.',
        },
        {
          id: 'ip-conclusion-3',
          text: 'Tidak ada perbedaan mendasar antara IP Private dan IP Public, sehingga keduanya bisa saling menggantikan baik di jaringan lokal maupun di jaringan internet.',
          isCorrect: false,
          feedback: 'Tidak tepat. IP Private dan IP Public memiliki fungsi yang berbeda dan tidak bisa saling menggantikan. IP Private dirancang khusus untuk LAN (jaringan lokal), sedangkan IP Public digunakan di jaringan global (internet). Perbedaan ini adalah konsep dasar pengalamatan IPv4.',
        },
        {
          id: 'ip-conclusion-1',
          text: 'Gunakan IP Private untuk perangkat di jaringan lokal seperti laboratorium, karena IP Private dirancang khusus untuk komunikasi internal di dalam LAN dan tidak perlu diakses dari internet.',
          isCorrect: true,
          feedback: 'Tepat! Itulah prinsip utamanya: IP Private digunakan di dalam jaringan lokal (seperti lab sekolah atau jaringan rumah), sedangkan IP Public digunakan untuk identifikasi perangkat di internet. Memahami perbedaan ini adalah dasar dari pengalamatan IPv4.',
        },
      ],
      finalEvaluation:
        'Tunjukkan bahwa kamu dapat mengenali perbedaan IP Private dan Public, memilih alamat yang tepat untuk kebutuhan jaringan sederhana, dan memahami fungsi dasar pengalamatan IPv4 dalam arsitektur TCP/IP.',
    },
    conclusionPrompt: 'Berdasarkan studi kasus pengalamatan IPv4 laboratorium komputer yang telah kamu analisis, jelaskan bagaimana cara kamu membedakan IP Private dan Public, serta mengapa IP Private lebih tepat digunakan untuk jaringan lokal seperti di sekolah. Tuliskan dengan kata-katamu sendiri secara logis.',
  },
];



