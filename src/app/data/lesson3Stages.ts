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
      'Saksikan animasi interaktif tentang bagaimana IP Address memungkinkan data menemukan tujuannya di jaringan.',
      'Pasangkan setiap komponen/konsep IP Address dengan fungsinya yang tepat menggunakan klik kiri-kanan (tarik garis).',
      'Tulis argumen logis tentang mengapa IP Address harus unik di setiap jaringan.',
      'Tulis kesimpulan mengenai peran IP dalam komunikasi jaringan berdasarkan seluruh aktivitas.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengeksplorasi peran IP Address pada Network Layer melalui animasi interaktif dan mencocokkan komponen dengan fungsinya secara runtut.',
      'Kemampuan Berargumen: menjelaskan alasan mengapa IP Address harus unik dan bagaimana perannya dalam proses pengiriman data antar jaringan.',
      'Penarikan Kesimpulan: menyimpulkan apa yang telah dipelajari tentang peran Internet Protocol pada Network Layer dalam komunikasi jaringan.',
    ],
    facilitatorNotes: [
      'Guru menggambarkan IP Address sebagai "alamat rumah di dunia digital" — tanpa alamat unik, data tidak tahu ke mana harus pergi.',
      'Guru menekankan bahwa IP bekerja di Network Layer, bukan Transport Layer (TCP) — IP mengurus ALAMAT, TCP mengurus KEANDALAN pengiriman.',
      'Guru meminta siswa membandingkan: apa bedanya IP Address dengan MAC Address dalam konteks jaringan?',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menjelaskan peran Internet Protocol lapisan Network dalam protokol TCP/IP',
      condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif pada CONNETIC Module',
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
      'Siswa mengeksplorasi komponen IP Header beserta fungsinya secara mendalam melalui eksplorasi materi interaktif dan aktivitas merangkai urutan pemrosesan paket IP.',
    objectiveCode: 'X.IP.2',
    activityGuide: [
      'Buka dan pelajari setiap field IP Header melalui panel eksplorasi interaktif.',
      'Urutkan 5 tahapan pemrosesan paket IP oleh router menggunakan drag & drop.',
      'Tulis argumen logis tentang pentingnya field TTL dan Destination IP dalam IP Header.',
      'Tulis kesimpulan tentang fungsi IP Header yang telah kamu pelajari.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengurutkan tahapan pemrosesan paket IP oleh router secara sistematis berdasarkan fungsi setiap field IP Header.',
      'Kemampuan Berargumen: menjelaskan mengapa field TTL dan Destination IP merupakan komponen kritis dalam IP Header yang tidak dapat dihilangkan.',
      'Penarikan Kesimpulan: menyimpulkan bagaimana IP Header memungkinkan paket data menemukan jalur yang tepat dari sumber ke tujuan.',
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
        'IP Header adalah bagian awal setiap paket IP yang berisi informasi kontrol penting. Router di sepanjang jalur membaca IP Header untuk memutuskan ke mana paket harus diteruskan selanjutnya.',
        'Field terpenting dalam IP Header adalah Destination IP Address (menentukan tujuan), Source IP Address (mengidentifikasi pengirim), TTL (membatasi usia paket), dan Protocol (menunjukkan protokol Transport Layer yang membawa data).',
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
      'Urutkan 5 tahapan yang dilakukan router saat memproses sebuah paket IP yang masuk, mulai dari penerimaan hingga penelusuran tabel routing.',
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
      'Siswa menganalisis skenario format alamat IPv4 yang tidak valid dan mengidentifikasi aturan format penulisan IPv4 yang benar melalui tanya jawab dua arah.',
    objectiveCode: 'X.IP.3',
    activityGuide: [
      'Amati skenario "IPv4 Validation": sebuah alamat IPv4 ditolak sistem karena formatnya tidak valid.',
      'Pilih alasan teknis yang paling tepat mengapa alamat tersebut tidak valid.',
      'Tanyakan pertanyaan lanjutan untuk memperdalam pemahaman tentang aturan format IPv4.',
      'Tulis kesimpulan tentang aturan format IPv4 yang valid.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menganalisis skenario format IPv4 tidak valid secara sistematis melalui tanya jawab terarah.',
      'Kemampuan Berargumen: memilih alasan teknis yang tepat dan menjelaskan mengapa suatu format IPv4 tidak valid berdasarkan aturan 8-bit per oktet.',
      'Penarikan Kesimpulan: menghubungkan aturan format IPv4 (4 oktet, nilai 0–255) dengan cara komputer merepresentasikan alamat dalam sistem biner.',
    ],
    facilitatorNotes: [
      'Guru menekankan bahwa IPv4 adalah bilangan 32-bit: 4 oktet × 8-bit = 32-bit. Setiap oktet bisa menampung nilai 0 (00000000) hingga 255 (11111111).',
      'Guru memancing: "Mengapa nilai 256 tidak bisa direpresentasikan dalam 8 bit? Berapa bit yang dibutuhkan untuk angka 256?"',
      'Guru mendorong siswa mengidentifikasi format-format tidak valid lainnya: nilai > 255, jumlah oktet ≠ 4, karakter non-angka.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu membedakan struktur alamat IPv4 berdasarkan format penulisannya',
      condition: 'melalui aktivitas questioning berupa tanya jawab dua arah pada CONNETIC Module',
      degree: 'secara tepat',
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
      'Siswa menganalisis skenario perancangan pengalamatan IPv4 Private & Public pada jaringan nyata (warnet) melalui studi kasus bercabang yang menuntut keputusan runtut, argumen teknis, dan kesimpulan yang tepat.',
    objectiveCode: 'X.IP.8',
    activityGuide: [
      'Baca studi kasus utama tentang perancangan jaringan warnet dengan kebutuhan IP statis dan dinamis.',
      'Ikuti percabangan langkah perencanaan IPv4 dari pemilihan kelas hingga penentuan range DHCP secara bertahap.',
      'Tuliskan argumen logis saat diminta, lalu pilih kesimpulan terbaik tentang prinsip pengalamatan IPv4.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menentukan langkah perencanaan IPv4 yang tepat secara berurutan dari pemilihan kelas IP hingga pembagian range statis dan dinamis.',
      'Kemampuan Berargumen: menjelaskan alasan teknis mengapa server dan perangkat infrastruktur harus menggunakan IP statis, bukan IP dinamis.',
      'Penarikan Kesimpulan: memilih kesimpulan terbaik tentang prinsip pengalamatan IPv4 yang benar dalam jaringan nyata.',
    ],
    facilitatorNotes: [
      'Guru menekankan bahwa setiap keputusan pada percabangan mencerminkan satu prinsip pengalamatan IPv4 yang sesungguhnya diterapkan di industri.',
      'Guru mendorong siswa mempertimbangkan skalabilitas: bagaimana jika warnet bertambah menjadi 100 komputer?',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menganalisis skenario perancangan pengalamatan IPv4 Private & Public pada arsitektur TCP/IP',
      condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
      degree: 'secara logis',
    },
    branchingScenario: {
      mode: 'tcp-branching',
      caseTitle: 'Perancangan IPv4 Jaringan Warnet',
      context:
        'Seorang teknisi diminta membangun jaringan untuk warnet baru yang memiliki 30 komputer client, 1 server billing, 1 server game, dan 1 printer jaringan. Semua perangkat harus bisa saling berkomunikasi di jaringan lokal, dan komputer client harus bisa mengakses internet. Teknisi memilih subnet 192.168.0.0/24 sebagai jaringan lokal (Private IP Kelas C).',
      initialQuestion:
        'Ikuti tiap percabangan berikut dan tentukan keputusan perencanaan IPv4 yang paling tepat untuk warnet ini.',
      focusAreas: ['Pemilihan Kelas & Subnet', 'IP Statis vs DHCP', 'Range Planning'],
      choices: [],
      steps: [
        {
          id: 'step-1',
          prompt: 'Langkah pertama: Berapa jumlah usable host pada subnet 192.168.0.0/24? Pilih perhitungan yang benar.',
          options: [
            {
              id: 'step-1-correct',
              text: '254 usable host (= 2^8 − 2 = 256 − 2). Cukup untuk 30 client + 1 server billing + 1 server game + 1 printer + gateway router = 34 perangkat.',
              isCorrect: true,
              feedback: 'Tepat! /24 berarti 8 bit untuk Host ID. 2^8 = 256 kemungkinan, dikurangi 2 (Network Address .0 dan Broadcast .255) = 254 usable host. Jauh lebih dari cukup untuk 34 perangkat.',
            },
            {
              id: 'step-1-wrong1',
              text: '256 usable host (= 2^8 = 256). Karena subnet /24 memiliki 256 alamat.',
              isCorrect: false,
              feedback: 'Hampir benar, tapi /24 punya 256 TOTAL alamat, bukan 256 usable host. Network Address (.0) dan Broadcast (.255) tidak bisa diberikan ke perangkat, sehingga usable = 254.',
            },
            {
              id: 'step-1-wrong2',
              text: '252 usable host — karena Gateway Router dan beberapa alamat cadangan harus dikurangi terlebih dahulu.',
              isCorrect: false,
              feedback: 'Tidak tepat. Usable host dihitung murni dari formula 2^n − 2. Gateway Router tetap menggunakan salah satu dari 254 alamat tersebut — tidak ada pengurangan khusus sebelum dihitung.',
            },
          ],
        },
        {
          id: 'step-2',
          prompt: 'Langkah kedua: Mana strategi pemberian IP yang paling profesional untuk warnet ini?',
          options: [
            {
              id: 'step-2-correct',
              text: 'Gateway Router = .1 (statis), Server Billing = .10 (statis), Server Game = .11 (statis), Printer = .20 (statis), Client 30 PC = .100–.200 (DHCP dinamis).',
              isCorrect: true,
              feedback: 'Sangat profesional! Memisahkan range statis (infrastruktur di .1–.50) dari range DHCP dinamis (client di .100–.200) adalah praktik industri terbaik. Teknisi mana pun langsung paham strukturnya.',
            },
            {
              id: 'step-2-wrong1',
              text: 'Semua perangkat menggunakan DHCP — biarkan router mengatur semuanya secara otomatis agar lebih mudah.',
              isCorrect: false,
              feedback: 'Server dan printer tidak boleh menggunakan DHCP! Jika IP-nya berubah setiap restart, semua client yang sudah dikonfigurasi untuk terhubung ke IP tertentu akan kehilangan koneksi. Infrastruktur kritis wajib menggunakan IP statis.',
            },
            {
              id: 'step-2-wrong2',
              text: 'Beri IP secara urut: Gateway .1, Server Billing .2, Server Game .3, Printer .4, lalu Client .5–.34 (DHCP).',
              isCorrect: false,
              feedback: 'Boleh secara teknis, tapi tidak direkomendasikan. DHCP mulai dari .5 langsung setelah infrastruktur statis berisiko tumpang tindih jika dikonfigurasi sembarangan. Lebih aman memberikan gap yang jelas antara range statis dan dinamis.',
            },
          ],
        },
        {
          id: 'step-3',
          prompt: 'Langkah ketiga: Agar komputer client di warnet bisa mengakses internet, mekanisme apa yang dibutuhkan di router?',
          options: [
            {
              id: 'step-3-correct',
              text: 'NAT (Network Address Translation) — mengkonversi Private IP (192.168.0.x) milik client menjadi satu Public IP yang diberikan ISP saat mengakses internet.',
              isCorrect: true,
              feedback: 'Tepat! Private IP (192.168.0.x) tidak bisa dirutekan di internet global. NAT di router mengkonversi alamat Private ke Public sehingga client bisa mengakses internet sambil tetap menggunakan Private IP di jaringan lokal.',
            },
            {
              id: 'step-3-wrong1',
              text: 'Berikan Public IP langsung ke setiap komputer client menggantikan Private IP mereka.',
              isCorrect: false,
              feedback: 'Tidak efisien dan tidak aman. Public IP sangat terbatas dan mahal. Selain itu, perangkat dengan Public IP langsung terekspos ke internet tanpa perlindungan NAT — rentan terhadap serangan dari luar.',
            },
            {
              id: 'step-3-wrong2',
              text: 'Tidak perlu mekanisme khusus — Private IP otomatis bisa dirutekan ke internet melalui router biasa.',
              isCorrect: false,
              feedback: 'Salah. Private IP (10.x.x.x, 172.16.x.x, 192.168.x.x) secara eksplisit TIDAK dapat dirutekan di internet global. Router internet akan membuang paket yang menggunakan alamat Private sebagai source IP.',
            },
          ],
        },
        {
          id: 'step-4',
          prompt: 'Langkah keempat: Seorang client warnet tidak bisa terhubung ke server game. Langkah diagnostik pertama yang paling logis adalah...',
          options: [
            {
              id: 'step-4-correct',
              text: 'Cek IP Address komputer client tersebut: apakah sudah mendapatkan IP dari DHCP? Apakah IP-nya berada di range yang benar (.100–.200) dan bukan konflik dengan IP statis?',
              isCorrect: true,
              feedback: 'Tepat! Langkah pertama diagnostik jaringan selalu dimulai dari layer paling bawah — pastikan perangkat mendapat IP yang valid dan tidak ada konflik. Baru kemudian periksa konektivitas ke server, firewall, dan sebagainya.',
            },
            {
              id: 'step-4-wrong1',
              text: 'Langsung restart server game karena kemungkinan besar masalah ada di server.',
              isCorrect: false,
              feedback: 'Restart server tanpa diagnosa lebih dulu tidak profesional — bisa mengganggu puluhan client yang sedang bermain. Selalu diagnosa dari layer paling bawah (IP Address) sebelum mengambil tindakan yang mempengaruhi banyak pengguna.',
            },
            {
              id: 'step-4-wrong2',
              text: 'Ganti kabel LAN komputer client tersebut karena masalah fisik paling sering terjadi.',
              isCorrect: false,
              feedback: 'Mengganti kabel tanpa bukti masalah fisik adalah pendekatan yang tidak sistematis. Jika komputer client mendapat IP yang valid dan bisa ping ke gateway, kabel kemungkinan besar bukan masalahnya.',
            },
          ],
        },
      ],
      argumentAfterStepId: 'step-2',
      argumentPrompt: 'Mengapa server billing dan server game di warnet HARUS menggunakan IP statis (tetap), bukan IP dinamis dari DHCP? Jelaskan konsekuensi teknis yang terjadi jika server menggunakan IP dinamis.',
      conclusionQuestion: 'Prinsip utama perancangan pengalamatan IPv4 yang benar pada jaringan nyata seperti warnet adalah...',
      conclusionOptions: [
        {
          id: 'ip-conclusion-1',
          text: 'Gunakan Private IP untuk jaringan lokal, pisahkan range IP statis (infrastruktur) dari dinamis (client), dan terapkan NAT untuk akses internet',
          isCorrect: true,
          feedback: 'Tepat! Inilah tiga prinsip inti: (1) Private IP untuk jaringan lokal, (2) Pemisahan range statis/dinamis untuk kemudahan manajemen, (3) NAT agar Private IP bisa mengakses internet.',
        },
        {
          id: 'ip-conclusion-2',
          text: 'Gunakan Public IP untuk semua perangkat agar lebih mudah diakses dari mana saja',
          isCorrect: false,
          feedback: 'Menggunakan Public IP untuk semua perangkat lokal sangat tidak efisien (Public IP terbatas dan mahal), tidak aman (terekspos langsung ke internet), dan tidak perlu — NAT sudah memungkinkan Private IP mengakses internet.',
        },
        {
          id: 'ip-conclusion-3',
          text: 'Berikan semua perangkat IP dalam satu range tanpa memisahkan statis dan dinamis untuk menyederhanakan konfigurasi',
          isCorrect: false,
          feedback: 'Tanpa pemisahan range statis/dinamis, risiko konflik IP sangat tinggi. DHCP bisa memberikan IP yang sama dengan server statis, menyebabkan koneksi server tidak stabil. Pemisahan range adalah praktik wajib jaringan profesional.',
        },
      ],
      finalEvaluation:
        'Tunjukkan bahwa kamu tidak hanya bisa "mengisi IP" pada perangkat, tapi juga mampu merancang skema pengalamatan IPv4 yang terstruktur, aman, dan dapat dikelola dengan baik — sesuai standar jaringan profesional.',
    },
    conclusionPrompt: 'Berdasarkan studi kasus bercabang tentang perancangan IPv4 warnet yang telah kamu analisis, jelaskan bagaimana kamu mampu menganalisis skenario perancangan pengalamatan IPv4 Private & Public pada arsitektur TCP/IP. Tuliskan secara logis dengan kata-katamu sendiri.',
  },
];
