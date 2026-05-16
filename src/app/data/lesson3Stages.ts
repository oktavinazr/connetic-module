import type { Stage } from './lessons';

export const lesson3Stages: Stage[] = [
  {
    type: 'constructivism',
    title: 'Constructivism',
    description:
      'Siswa membangun pemahaman awal tentang kebutuhan alamat unik di jaringan melalui analogi sistem pengalamatan surat dan komponen-komponen alamat IPv4.',
    objectiveCode: 'X.IP.1',
    activityGuide: [
      'Susun 6 potongan cerita tentang bagaimana alamat IP memungkinkan data menemukan tujuannya.',
      'Tulis refleksi: mengapa alamat IP harus unik dan tidak boleh ada duplikasi di jaringan yang sama.',
      'Urutkan komponen-komponen alamat IPv4 sesuai hierarki dari yang paling umum ke paling spesifik.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menjelaskan peran Internet Protocol lapisan Network dalam protokol TCP/IP',
      condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif pada CONNETIC Module',
      degree: 'dengan tepat',
    },
    apersepsi:
      'Bayangkan kamu mengirim surat ke teman, tapi kamu hanya menuliskan nama "Budi" tanpa nomor rumah, nama jalan, atau nama kota. Apakah surat itu akan sampai ke Budi yang tepat? Di internet, miliaran perangkat butuh alamat yang sangat spesifik dan unik agar data tidak salah kirim. Inilah fungsi Internet Protocol (IP)!',
    storyScramble: {
      instruction:
        'Bagaimana sebuah paket data bisa menemukan perangkat tujuannya di antara miliaran perangkat di seluruh dunia? Susun 6 potongan cerita berikut menjadi alur yang logis tentang peran alamat IP.',
      fragments: [
        {
          id: 'f1',
          text: 'Seorang pengguna ingin mengirim file ke rekan kerjanya yang berada di kota berbeda melalui internet.',
          order: 1,
        },
        {
          id: 'f2',
          text: 'Aplikasi pengirim menyiapkan data dan menyerahkannya ke lapisan Transport (TCP/UDP) untuk dipecah menjadi segmen.',
          order: 2,
        },
        {
          id: 'f3',
          text: 'Network Layer (IP) menambahkan alamat IP sumber dan tujuan pada setiap paket — seperti menulis alamat lengkap di amplop surat.',
          order: 3,
        },
        {
          id: 'f4',
          text: 'Router membaca alamat IP tujuan dan menentukan jalur terbaik untuk meneruskan paket menuju jaringan yang tepat.',
          order: 4,
        },
        {
          id: 'f5',
          text: 'Paket melewati beberapa router hingga akhirnya tiba di jaringan lokal tujuan, di mana router terakhir mengidentifikasi perangkat penerimanya.',
          order: 5,
        },
        {
          id: 'f6',
          text: 'Perangkat penerima mengenali alamat IP-nya sendiri, menerima paket, dan menyerahkannya ke aplikasi yang tepat.',
          order: 6,
        },
      ],
      successMessage:
        'Tepat! Alamat IP adalah "alamat lengkap" perangkat di internet — tanpanya, data tidak tahu ke mana harus pergi.',
    },
    constructivismEssay1:
      'Berdasarkan alur cerita yang baru saja kamu susun, jelaskan mengapa setiap perangkat di internet harus memiliki alamat IP yang unik! Apa yang terjadi jika dua perangkat menggunakan alamat IP yang sama?',
    analogySortGroups: [
      { id: 'ipv4', label: 'Hierarki Komponen Alamat IPv4', colorClass: 'blue' },
    ],
    analogySortItems: [
      {
        id: 'ap1',
        text: 'Network ID (Identitas Jaringan) — bagian awal alamat IP yang menunjukkan jaringan mana perangkat ini berada.',
        courierAnalogy: 'Seperti nama kota dan nama jalan: "Jl. Merdeka, Bandung" — menunjukkan blok kawasan, bukan rumah spesifik.',
        correctGroup: 'ipv4',
        correctOrder: 1,
      },
      {
        id: 'ap2',
        text: 'Subnet Mask — "topeng" yang memisahkan bagian Network ID dari Host ID dalam sebuah alamat IP.',
        courierAnalogy: 'Seperti kode pos: membantu router memahami mana bagian "kota" dan mana bagian "nomor rumah" dari suatu alamat.',
        correctGroup: 'ipv4',
        correctOrder: 2,
      },
      {
        id: 'ap3',
        text: 'Host ID (Identitas Perangkat) — bagian akhir alamat IP yang mengidentifikasi perangkat spesifik dalam jaringan tersebut.',
        courierAnalogy: 'Seperti nomor rumah spesifik di dalam blok jalan: "No. 42" — inilah perangkat yang tepat yang dituju.',
        correctGroup: 'ipv4',
        correctOrder: 3,
      },
      {
        id: 'ap4',
        text: 'Network Address — alamat pertama dalam blok jaringan (Host ID semua 0), digunakan sebagai identitas jaringan itu sendiri.',
        courierAnalogy: 'Seperti nama komplek perumahan itu sendiri: "Komplek Merdeka" — bukan rumah individu, tapi nama kawasannya.',
        correctGroup: 'ipv4',
        correctOrder: 4,
      },
      {
        id: 'ap5',
        text: 'Broadcast Address — alamat terakhir dalam blok jaringan (Host ID semua 1), digunakan untuk mengirim pesan ke SEMUA perangkat di jaringan.',
        courierAnalogy: 'Seperti pengumuman pengeras suara di komplek: "Perhatian warga Komplek Merdeka!" — pesan diterima semua orang sekaligus.',
        correctGroup: 'ipv4',
        correctOrder: 5,
      },
      {
        id: 'ap6',
        text: 'Usable Host Range — rentang alamat antara Network Address dan Broadcast Address yang bisa diberikan ke perangkat.',
        courierAnalogy: 'Seperti nomor rumah yang bisa dihuni: No. 1 sampai No. 254 (tapi No. 0 dan No. 255 dicadangkan untuk keperluan lain).',
        correctGroup: 'ipv4',
        correctOrder: 6,
      },
    ],
    constructivismEssay2:
      'Berdasarkan komponen-komponen IPv4 yang baru saja kamu urutkan, jelaskan mengapa kita perlu Subnet Mask dan apa bedanya Network Address dengan Broadcast Address!',
    conclusionPrompt: 'Berdasarkan aktivitas Story Scramble dan Analogy Sorting tentang pengalamatan IPv4 yang telah kamu lakukan, jelaskan bagaimana kamu mampu menjelaskan peran Internet Protocol lapisan Network dalam protokol TCP/IP. Tuliskan dengan tepat menggunakan kata-katamu sendiri.',
  },

  {
    type: 'inquiry',
    title: 'Inquiry',
    description:
      'Siswa mengeksplorasi struktur 32-bit IPv4, komponen IP Header, dan sistem klasifikasi alamat IP (Kelas A, B, C) melalui eksplorasi interaktif.',
    objectiveCode: 'X.IP.2',
    activityGuide: [
      'Buka dan pelajari struktur IPv4 serta komponen IP Header melalui panel eksplorasi.',
      'Urutkan 5 elemen sistem pengalamatan IPv4 dari lapisan paling dasar ke paling spesifik.',
      'Kelompokkan contoh alamat IP ke dalam kelas yang sesuai (A, B, atau C) menggunakan drag & drop.',
      'Tulis refleksi untuk memperkuat pemahaman tentang logika di balik sistem kelas IP.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengurutkan elemen pengalamatan IPv4 berdasarkan hierarki fungsinya.',
      'Analisis Klasifikasi: mengidentifikasi kelas IP berdasarkan rentang oktet pertama.',
      'Refleksi Konsep: menjelaskan mengapa sistem kelas IP diciptakan dan keterbatasannya.',
    ],
    facilitatorNotes: [
      'Guru menekankan perbedaan antara Network ID dan Host ID, dan mengapa pembagian ini penting untuk routing.',
      'Guru mendorong siswa menghitung jumlah host maksimal untuk setiap kelas IP menggunakan formula 2^n - 2.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menguraikan komponen IP Header beserta fungsinya',
      condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
      degree: 'secara runtut',
    },
    material: {
      title: 'Struktur Alamat IPv4 & IP Header',
      content: [
        'IPv4 menggunakan 32-bit yang dibagi menjadi 4 oktet (8-bit per oktet). Untuk memudahkan manusia, biner ini ditulis dalam format dotted decimal: angka 0–255 dipisahkan titik (contoh: 192.168.1.1).',
        'IP Header adalah informasi kontrol yang ditambahkan oleh Internet Layer pada setiap paket. Selain alamat sumber dan tujuan, IP Header juga memuat informasi TTL, protokol, dan checksum untuk memastikan paket sampai ke tujuan yang benar.',
      ],
      examples: [
        'Kelas A (1–126): Network 8-bit, Host 24-bit — untuk jaringan sangat besar (ISP, militer).',
        'Kelas B (128–191): Network 16-bit, Host 16-bit — untuk organisasi besar/kampus.',
        'Kelas C (192–223): Network 24-bit, Host 8-bit — untuk jaringan kecil/rumah/kantor.',
        'IP Header: Version, IHL, TTL, Protocol, Source IP, Destination IP.',
      ],
    },
    explorationSections: [
      {
        id: 'e1',
        title: 'Format Penulisan IPv4 (Dotted Decimal)',
        content:
          'IPv4 terdiri dari 32 bit biner yang dibagi menjadi 4 kelompok 8-bit (oktet). Setiap oktet dikonversi ke desimal (0–255) dan dipisahkan tanda titik. Jika ada oktet bernilai 256 atau lebih, itu bukan alamat IPv4 yang valid.',
        example:
          'Biner: 11000000.10101000.00000001.00000001 → Desimal: 192.168.1.1. Setiap bagian adalah "blok 8 bit" yang nilainya 0 sampai 255.',
      },
      {
        id: 'e2',
        title: 'Komponen IP Header',
        content:
          'IP Header memuat: Version (IPv4=4), TTL (Time to Live — berkurang 1 di setiap router), Protocol (6=TCP, 17=UDP), Source IP (alamat pengirim), dan Destination IP (alamat tujuan). TTL mencegah paket berputar selamanya di jaringan.',
        example:
          'Bayangkan amplop surat dengan: tanggal kedaluwarsa (TTL), kode jenis isi (Protocol), alamat pengirim (Source IP), dan alamat tujuan (Destination IP). Router membaca "amplop" ini untuk meneruskan paket.',
      },
      {
        id: 'e3',
        title: 'Kelas A — Jaringan Sangat Besar',
        content:
          'Kelas A: oktet pertama bernilai 1–126. Format: Network.Host.Host.Host. Subnet Mask default: 255.0.0.0 (/8). Mendukung 126 jaringan dengan masing-masing ~16 juta host. Digunakan oleh organisasi sangat besar seperti ISP besar atau lembaga pemerintah.',
        example:
          '10.0.0.1, 8.8.8.8 (Google DNS), 1.1.1.1 (Cloudflare) — semua ini adalah alamat Kelas A.',
      },
      {
        id: 'e4',
        title: 'Kelas B — Jaringan Menengah',
        content:
          'Kelas B: oktet pertama bernilai 128–191. Format: Network.Network.Host.Host. Subnet Mask default: 255.255.0.0 (/16). Mendukung 16.384 jaringan dengan masing-masing ~65.534 host. Cocok untuk universitas dan perusahaan besar.',
        example:
          '172.16.0.1, 172.31.255.254, 191.0.1.1 — semua ini adalah alamat Kelas B. Rentang 172.16.0.0–172.31.255.255 adalah blok Private Kelas B.',
      },
      {
        id: 'e5',
        title: 'Kelas C — Jaringan Kecil',
        content:
          'Kelas C: oktet pertama bernilai 192–223. Format: Network.Network.Network.Host. Subnet Mask default: 255.255.255.0 (/24). Mendukung ~2 juta jaringan dengan masing-masing 254 host. Paling umum digunakan di rumah, kantor kecil, dan laboratorium sekolah.',
        example:
          '192.168.1.1, 192.168.0.1, 200.100.50.1 — alamat Kelas C. Range 192.168.0.0–192.168.255.255 adalah blok Private Kelas C yang paling sering dipakai di jaringan lokal.',
      },
    ],
    flowInstruction:
      'Urutkan 5 elemen sistem pengalamatan IPv4 berikut dari yang paling mendasar (fondasi) ke yang paling spesifik (identitas perangkat individual).',
    flowItems: [
      { id: 'fl1', text: 'Format Biner 32-bit', correctOrder: 1, description: 'Representasi dasar semua alamat IPv4.', colorClass: 'purple' },
      { id: 'fl2', text: 'Kelas IP (A / B / C)', correctOrder: 2, description: 'Kategori berdasarkan rentang oktet pertama.', colorClass: 'blue' },
      { id: 'fl3', text: 'Subnet Mask', correctOrder: 3, description: 'Pemisah antara Network ID dan Host ID.', colorClass: 'green' },
      { id: 'fl4', text: 'Network Address', correctOrder: 4, description: 'Identitas jaringan (Host ID semua 0).', colorClass: 'amber' },
      { id: 'fl5', text: 'Host Address (IP Perangkat)', correctOrder: 5, description: 'Alamat spesifik satu perangkat dalam jaringan.', colorClass: 'pink' },
    ],
    inquiryReflection1:
      'Jelaskan pemahamanmu tentang hierarki 5 elemen IPv4 tersebut. Mengapa Subnet Mask harus diketahui sebelum kita bisa menentukan Network Address suatu perangkat?',
    groups: [
      { id: 'clA', label: 'Kelas A (Oktet 1: 1–126)', colorClass: 'blue' },
      { id: 'clB', label: 'Kelas B (Oktet 1: 128–191)', colorClass: 'green' },
      { id: 'clC', label: 'Kelas C (Oktet 1: 192–223)', colorClass: 'purple' },
    ],
    groupItems: [
      { id: 'i1', text: '10.10.10.1', correctGroup: 'clA' },
      { id: 'i2', text: '172.16.50.10', correctGroup: 'clB' },
      { id: 'i3', text: '192.168.1.100', correctGroup: 'clC' },
      { id: 'i4', text: '8.8.8.8', correctGroup: 'clA' },
      { id: 'i5', text: '150.100.200.5', correctGroup: 'clB' },
      { id: 'i6', text: '200.50.25.1', correctGroup: 'clC' },
    ],
    inquiryReflection2:
      'Setelah mengklasifikasikan alamat-alamat IP tersebut, jelaskan pola apa yang membedakan Kelas A, B, dan C! Mengapa semakin tinggi kelas (A→C), semakin sedikit host yang bisa ditampung per jaringan?',
    conclusionPrompt: 'Berdasarkan eksplorasi materi IPv4 dan aktivitas klasifikasi kelas IP yang telah kamu lakukan, jelaskan bagaimana kamu mampu menguraikan komponen IP Header beserta fungsinya. Tuliskan secara runtut dengan kata-katamu sendiri.',
  },

  {
    type: 'questioning',
    title: 'Questioning',
    description:
      'Siswa menganalisis skenario konflik alamat IP dan mengidentifikasi mekanisme yang paling relevan dalam mendeteksi serta menyelesaikan konflik tersebut.',
    objectiveCode: 'X.IP.3',
    activityGuide: [
      'Amati skenario "IP Address Conflict": dua perangkat menggunakan alamat IP yang identik.',
      'Pilih mekanisme atau field yang paling relevan untuk memahami mengapa router kebingungan.',
      'Jelaskan solusi teknis untuk menyelesaikan konflik tanpa mengganggu keseluruhan jaringan.',
    ],
    logicalThinkingIndicators: [
      'Kemampuan Berargumen: memilih alasan teknis yang tepat berdasarkan cara kerja router dan tabel ARP.',
      'Penarikan Kesimpulan: menghubungkan gejala konflik IP dengan mekanisme routing yang terganggu.',
    ],
    facilitatorNotes: [
      'Guru menjelaskan bahwa router menggunakan ARP (Address Resolution Protocol) untuk menghubungkan IP address dengan MAC address fisik perangkat.',
      'Guru memancing: "Jika dua perangkat menjawab ARP request yang sama, apa yang terjadi pada tabel routing router?"',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu membedakan struktur alamat IPv4 berdasarkan format penulisannya',
      condition: 'melalui aktivitas questioning berupa tanya jawab dua arah pada CONNETIC Module',
      degree: 'secara tepat',
    },
    problemVisual: {
      icon: '!',
      title: 'IP Address Conflict — Dua Perangkat, Satu Alamat',
      description:
        'Laptop A (192.168.1.10) dan Printer Server (192.168.1.10) memiliki alamat IP yang sama! Akibatnya koneksi keduanya putus bergantian dan tidak stabil.',
      problemType: 'collision',
    },
    teacherQuestion:
      'Jika dua perangkat berbeda menggunakan IP yang sama, mengapa router tidak bisa memutuskan ke perangkat mana data harus dikirimkan?',
    scenario:
      'Di kantor sebuah sekolah, teknisi baru menyeting IP laptop-nya secara manual menjadi 192.168.1.10. Tanpa sadar, alamat tersebut sudah digunakan oleh Printer Server yang selalu online. Karyawan di seluruh kantor tiba-tiba tidak bisa mencetak dokumen, dan laptop teknisi baru juga sering kehilangan koneksi.',
    whyQuestion:
      'Mengapa Router menjadi kebingungan dan tidak bisa melayani kedua perangkat yang menggunakan IP yang sama secara normal?',
    hint:
      'Router menggunakan tabel ARP yang memetakan setiap IP Address ke satu MAC Address fisik. Bayangkan apa yang terjadi jika dua MAC Address berbeda mengklaim IP yang sama.',
    reasonOptions: [
      {
        id: 'r1',
        text: 'Router tidak tahu harus mengirimkan data ke MAC Address yang mana karena tabel ARP-nya terus-menerus diperbarui oleh dua perangkat yang berbeda.',
        isCorrect: true,
        feedback:
          'Tepat! Router mengirim data berdasarkan tabel ARP. Jika dua perangkat mengklaim IP yang sama, tabel ARP terus-menerus "direbut" — satu saat menunjuk ke MAC Laptop, saat berikutnya ke MAC Printer. Hasilnya, data dikirim ke perangkat yang salah secara acak.',
      },
      {
        id: 'r2',
        text: 'Router akan meledak atau rusak secara fisik jika menerima dua sinyal dari IP yang sama secara bersamaan.',
        isCorrect: false,
        feedback:
          'Tentu tidak. Router hanya mengalami kegagalan logika pengiriman data, bukan kerusakan fisik. Perangkat jaringan dirancang untuk menangani situasi ini tanpa kerusakan hardware.',
      },
      {
        id: 'r3',
        text: 'Router akan menggabungkan data dari kedua perangkat menjadi satu aliran data dan mengirimkannya ke keduanya secara bersamaan.',
        isCorrect: false,
        feedback:
          'Router tidak bekerja seperti itu. Setiap paket dikirim ke satu tujuan berdasarkan satu MAC Address. Penggabungan data seperti yang disebutkan tidak terjadi dalam mekanisme IP routing.',
      },
      {
        id: 'r4',
        text: 'Kedua perangkat dengan IP sama akan otomatis diblock oleh firewall router karena terdeteksi sebagai ancaman keamanan.',
        isCorrect: false,
        feedback:
          'Firewall tidak otomatis memblokir perangkat hanya karena konflik IP. Konflik IP adalah masalah administrasi jaringan, bukan ancaman keamanan yang ditangani firewall.',
      },
    ],
    questionBank: [
      {
        id: 'q1',
        text: 'Apa itu ARP dan mengapa penting dalam kasus konflik IP?',
        response:
          'ARP (Address Resolution Protocol) adalah mekanisme yang menghubungkan alamat IP (logis) ke MAC Address (fisik). Router menggunakan tabel ARP ini untuk mengirim data ke perangkat yang tepat. Saat dua perangkat punya IP sama, tabel ARP terus berubah dan pengiriman data menjadi tidak konsisten.',
      },
      {
        id: 'q2',
        text: 'Bagaimana cara mencegah konflik IP di jaringan yang besar?',
        response:
          'Gunakan DHCP (Dynamic Host Configuration Protocol) untuk memberikan IP secara otomatis — DHCP server memastikan tidak ada dua perangkat mendapat IP yang sama. Untuk perangkat penting seperti server dan printer, gunakan IP statis di luar range DHCP.',
      },
      {
        id: 'q3',
        text: 'Apakah dua perangkat di jaringan yang BERBEDA bisa menggunakan IP yang sama?',
        response:
          'Ya! Dua perangkat di jaringan yang berbeda (Network ID berbeda) bisa menggunakan Host ID yang sama karena alamat penuhnya tetap berbeda. Inilah juga mengapa IP Private (seperti 192.168.x.x) bisa digunakan ulang di jutaan jaringan rumah dan kantor di seluruh dunia.',
      },
    ],
    conclusionPrompt: 'Berdasarkan analisis skenario IP Address Conflict dan tanya jawab yang telah kamu lakukan, jelaskan bagaimana kamu mampu membedakan struktur alamat IPv4 berdasarkan format penulisannya. Tuliskan secara tepat dengan kata-katamu sendiri.',
  },

  {
    type: 'learning-community',
    title: 'Learning Community',
    description:
      'Siswa berkolaborasi dalam kelompok untuk merancang skema pengalamatan IP yang efisien untuk jaringan sekolah berdasarkan kebutuhan nyata.',
    objectiveCode: 'X.IP.4 & X.IP.5',
    activityGuide: [
      'Baca kebutuhan Lab Komputer: jumlah perangkat, jenis perangkat, dan kebutuhan administrasi.',
      'Analisis Studi Kasus 1 (Desain IP Lab): pilih strategi, tulis argumen, kirim ke kelompok.',
      'Analisis Studi Kasus 2 (Isolasi Jaringan): pilih strategi, tulis argumen, kirim ke kelompok.',
      'Diskusikan dan beri vote pada argumen terbaik di papan diskusi kelompok.',
    ],
    logicalThinkingIndicators: [
      'Kemampuan Berargumen: menyampaikan alasan teknis berbasis prinsip pengalamatan IP.',
      'Validasi Komunal: mengevaluasi strategi rekan dan memberikan vote berdasarkan kelayakan teknis.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menerapkan pengetahuan kelas IPv4 beserta rentang alamat Private & Public serta konsep range host IPv4',
      condition: 'melalui aktivitas learning community berupa papan kolaborasi studi kasus pada CONNETIC Module',
      degree: 'secara logis',
    },
    layers5: [
      { id: 'L5', name: 'Application', pdu: 'Data', color: '#8B5CF6', desc: 'Browser siswa mengakses aplikasi e-learning sekolah.' },
      { id: 'L4', name: 'Transport', pdu: 'Segment', color: '#628ECB', desc: 'TCP memastikan data halaman web sampai utuh ke browser.' },
      { id: 'L3', name: 'Network (IP)', pdu: 'Packet', color: '#10B981', desc: 'IP membawa paket dari laptop siswa ke server menggunakan alamat IP.' },
      { id: 'L2', name: 'Data Link', pdu: 'Frame', color: '#F59E0B', desc: 'Ethernet mengidentifikasi perangkat dalam jaringan lokal via MAC Address.' },
      { id: 'L1', name: 'Physical', pdu: 'Bits', color: '#395886', desc: 'Kabel UTP atau Wi-Fi mentransmisikan sinyal bit secara fisik.' },
    ],
    encapsulationCase: {
      id: 'X.IP.4.A',
      title: 'Studi Kasus: Desain Pengalamatan IP Lab Komputer',
      concept:
        'Merancang skema IP yang baik memerlukan pertimbangan: urutan yang logis (mudah diingat dan ditelusuri), pemisahan perangkat infrastruktur dari perangkat client, dan cadangan alamat untuk pengembangan.',
      scenario:
        'Sekolah akan membangun Lab Komputer dengan 30 PC siswa, 1 PC guru, 1 server e-learning, dan 1 printer. Teknisi memilih segmen 192.168.10.0/24. Bagaimana cara pemberian IP yang paling rapi dan mudah dikelola?',
      question:
        'Strategi pemberian IP mana yang paling profesional dan mudah untuk ditelusuri saat troubleshooting?',
      options: [
        {
          id: 'A',
          text: 'Server (.10), Guru (.20), Printer (.30), PC Siswa (.100–.129) — dengan pemisahan range yang jelas antara infrastruktur dan client.',
          logic: 'Pemisahan range memudahkan identifikasi: semua perangkat infrastruktur di range rendah, semua client di range tinggi. Ini praktik industri yang diakui.',
        },
        {
          id: 'B',
          text: 'Beri IP secara acak ke semua perangkat karena yang penting semua bisa terhubung.',
          logic: 'IP acak mempersulit troubleshooting. Saat ada masalah, teknisi harus memeriksa satu per satu tanpa pola yang jelas.',
        },
        {
          id: 'C',
          text: 'Beri semua perangkat range yang sama (100–133) dan biarkan DHCP yang mengaturnya secara otomatis tanpa reservasi.',
          logic: 'DHCP tanpa reservasi untuk server dan printer berisiko — alamat mereka bisa berubah setiap kali restart, menyebabkan koneksi client gagal.',
        },
      ],
    },
    decapsulationCase: {
      id: 'X.IP.9.B',
      title: 'Studi Kasus: Memisahkan Lab A dan Lab B',
      concept:
        'Dua lab komputer di sekolah yang sama bisa dipisahkan jaringannya menggunakan Network ID yang berbeda. Ini mencegah broadcast storm dan memudahkan manajemen bandwidth per lab.',
      scenario:
        'Sekolah memiliki Lab A (untuk Multimedia, 25 PC) dan Lab B (untuk Pemrograman, 20 PC). Keduanya berbagi satu router yang sama. Pengelola ingin memastikan trafik Lab A tidak mengganggu Lab B dan sebaliknya.',
      question:
        'Cara teknis mana yang paling tepat untuk memisahkan jaringan Lab A dan Lab B secara logis?',
      options: [
        {
          id: 'A',
          text: 'Menggunakan Network ID yang berbeda: Lab A = 192.168.1.0/24, Lab B = 192.168.2.0/24 — dengan router yang mengatur lalu lintas antar segmen.',
          logic: 'Ini solusi teknis yang benar. Network ID berbeda memastikan broadcast masing-masing lab tidak menyeberang ke lab lain, dan router bisa mengatur kebijakan trafik antar segmen.',
        },
        {
          id: 'B',
          text: 'Mengecat kabel LAN Lab A warna merah dan Lab B warna biru agar tidak tertukar.',
          logic: 'Perbedaan warna hanya identitas fisik untuk memudahkan pemasangan — tidak ada pengaruh pada logika jaringan atau pemisahan trafik.',
        },
        {
          id: 'C',
          text: 'Membatasi jam operasional Lab A pagi hari dan Lab B siang hari agar tidak bersamaan.',
          logic: 'Solusi manajemen waktu ini tidak menyelesaikan masalah teknis pemisahan jaringan. Jika keduanya beroperasi bersamaan, trafik tetap saling mengganggu.',
        },
      ],
    },
    groupActivity: {
      groupNames: ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'],
      discussionPrompt:
        'Diskusikan: Jika Lab A dan Lab B dipisahkan jaringannya, bagaimana siswa Lab A bisa tetap mengakses server e-learning yang ada di Lab B? Berikan vote pada solusi teknis yang paling realistis.',
    },
    conclusionPrompt: 'Berdasarkan diskusi kelompok tentang perancangan skema pengalamatan IP yang telah kamu lakukan, jelaskan bagaimana kamu mampu menerapkan pengetahuan kelas IPv4 beserta rentang alamat Private & Public serta konsep range host IPv4. Tuliskan secara logis dengan kata-katamu sendiri.',
  },

  {
    type: 'modeling',
    title: 'Modeling — Konversi Desimal ke Biner IPv4',
    description:
      'Siswa mempraktikkan konversi format IPv4 dari notasi desimal bertitik ke representasi biner 32-bit untuk memahami cara komputer membaca dan memproses alamat IP.',
    objectiveCode: 'X.IP.6',
    activityGuide: [
      'Ikuti demonstrasi sistem bobot bit (128, 64, 32, 16, 8, 4, 2, 1) untuk satu oktet.',
      'Praktikkan konversi oktet: ubah angka 192 dan 10 ke bentuk biner 8-bit.',
      'Gabungkan keempat oktet menjadi representasi biner 32-bit alamat IPv4 yang utuh.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengikuti proses konversi desimal ke biner secara sistematis.',
      'Penerapan Konsep: menghubungkan nilai desimal dengan posisi bit yang aktif.',
    ],
    facilitatorNotes: [
      'Guru menggunakan analogi timbangan biner: setiap bit adalah "batu timbangan" dengan berat 128, 64, 32, 16, 8, 4, 2, 1.',
      'Guru meminta siswa menghitung berapa host maksimal dalam /24 (jaringan Kelas C): 2^8 - 2 = 254 host.',
      'Guru menunjukkan bahwa 255.255.255.0 sebagai subnet mask berarti: Network ID = 24 bit pertama.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mensimulasikan proses konversi alamat IPv4 dari format desimal ke biner',
      condition: 'melalui aktivitas modeling berupa simulasi step-by-step pada CONNETIC Module',
      degree: 'secara sistematis',
    },
    practiceInstructions: {
      forTeacher: [
        'Gunakan papan tulis untuk menampilkan tabel bobot bit: 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1.',
        'Demonstrasikan: 192 = 128 + 64 → bit posisi 7 dan 6 aktif (1), sisanya 0: 11000000.',
        'Tunjukkan bahwa 255 = semua bit 1 = 11111111, dan 0 = semua bit 0 = 00000000.',
      ],
      forStudent: [
        'Identifikasi bit-bit yang harus bernilai "1" untuk menghasilkan angka desimal yang diminta.',
        'Verifikasi bahwa setiap oktet selalu tepat 8 bit, dan total IPv4 selalu tepat 32 bit.',
        'Klik "Jalankan Proses" untuk melihat hasil konversi dan validasi jawabanmu.',
      ],
    },
    modelingSteps: [
      {
        id: 'ipm1',
        type: 'example',
        title: 'Langkah 1: Memahami Sistem Bobot Bit',
        content:
          'Setiap oktet IPv4 terdiri dari 8 posisi bit. Nilai setiap posisi (dari kiri ke kanan): 128, 64, 32, 16, 8, 4, 2, 1. Total maksimum = 128+64+32+16+8+4+2+1 = 255. Inilah mengapa oktet IPv4 tidak bisa melebihi 255.',
        interactiveAction: 'Amati tabel bobot bit dan pahami nilai setiap posisi.',
      },
      {
        id: 'ipm2',
        type: 'example',
        title: 'Langkah 2: Konversi Angka 192 ke Biner',
        content:
          '192 = 128 + 64. Aktifkan bit posisi 128 (nilai 1) dan bit posisi 64 (nilai 1). Semua posisi lain bernilai 0. Hasil: 11000000. Verifikasi: 128+64 = 192 ✓.',
        interactiveAction: 'Simak demonstrasi aktivasi bit untuk angka 192.',
      },
      {
        id: 'ipm3',
        type: 'practice',
        title: 'Langkah 3: Tantangan Konversi Mandiri',
        content:
          'Sekarang giliranmu! Konversikan angka 168 ke biner 8-bit. (Petunjuk: 168 = 128 + 32 + 8. Aktifkan bit posisi 128, 32, dan 8 — sisanya 0. Hasilnya: 10101000).',
        interactiveAction: 'Klik "Jalankan Proses" setelah kamu menentukan posisi bit yang aktif untuk angka 168.',
      },
    ],
    conclusionPrompt: 'Berdasarkan simulasi konversi desimal ke biner IPv4 yang telah kamu praktikkan, jelaskan bagaimana kamu mampu mensimulasikan proses konversi alamat IPv4 dari format desimal ke biner. Tuliskan secara sistematis dengan kata-katamu sendiri.',
  },

  {
    type: 'reflection',
    title: 'Reflection',
    description:
      'Siswa menyusun peta konsep menyeluruh yang menghubungkan semua konsep IPv4 yang dipelajari: struktur, kelas, range alamat, komponen header, dan implikasinya.',
    objectiveCode: 'X.IP.7',
    activityGuide: [
      'Hubungkan konsep-konsep IPv4 dengan memilih label penghubung yang paling tepat.',
      'Pastikan peta konsepmu mencerminkan hubungan antara format IPv4, Kelas IP, Subnet Mask, dan Range Host.',
      'Tulis ringkasan menyeluruh tentang semua konsep IPv4 yang dipelajari hari ini secara runtut dan logis.',
    ],
    logicalThinkingIndicators: [
      'Penarikan Kesimpulan: menghubungkan semua konsep IPv4 menjadi gambaran utuh sistem pengalamatan jaringan.',
    ],
    facilitatorNotes: [
      'Guru mendorong siswa merefleksikan keterbatasan IPv4 (hanya 4,3 miliar alamat) sebagai jembatan ke materi IPv6.',
      'Guru menggunakan peta konsep untuk mengevaluasi kedalaman pemahaman siswa tentang hierarki pengalamatan.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menyimpulkan sistem pengalamatan IPv4 sebagai fondasi konfigurasi jaringan yang terstruktur',
      condition: 'melalui aktivitas reflection berupa konstruksi rekap materi pada CONNETIC Module',
      degree: 'secara tepat',
    },
    conceptMapNodes: [
      { id: 'cn1', label: 'IPv4', description: 'Protokol pengalamatan 32-bit di Internet Layer.', colorClass: 'blue' },
      { id: 'cn2', label: 'Format Dotted Decimal', description: '4 oktet desimal dipisahkan titik (0–255 per oktet).', colorClass: 'purple' },
      { id: 'cn3', label: 'Kelas IP (A/B/C)', description: 'Pengelompokan berdasarkan oktet pertama.', colorClass: 'green' },
      { id: 'cn4', label: 'Network ID', description: 'Bagian alamat yang mengidentifikasi jaringan.', colorClass: 'amber' },
      { id: 'cn5', label: 'Host ID', description: 'Bagian alamat yang mengidentifikasi perangkat.', colorClass: 'amber' },
      { id: 'cn6', label: 'Subnet Mask', description: 'Pemisah antara Network ID dan Host ID.', colorClass: 'indigo' },
      { id: 'cn7', label: 'IP Header', description: 'Informasi kontrol paket: TTL, Protocol, Src/Dst IP.', colorClass: 'pink' },
      { id: 'cn8', label: 'Range Host', description: 'Alamat yang bisa diberikan ke perangkat dalam jaringan.', colorClass: 'green' },
    ],
    conceptMapConnections: [
      { from: 'cn1', to: 'cn2', label: 'ditulis dalam format', options: ['ditulis dalam format', 'menghapus', 'mengabaikan', 'bertentangan dengan'] },
      { from: 'cn1', to: 'cn3', label: 'dibagi menjadi', options: ['dibagi menjadi', 'menyatukan', 'melewatkan', 'menyamakan'] },
      { from: 'cn1', to: 'cn7', label: 'memiliki struktur', options: ['memiliki struktur', 'meniadakan', 'mengabaikan', 'mengganti'] },
      { from: 'cn3', to: 'cn4', label: 'menentukan panjang', options: ['menentukan panjang', 'menolak', 'menghapus', 'melewatkan'] },
      { from: 'cn6', to: 'cn4', label: 'memisahkan dari Host ID', options: ['memisahkan dari Host ID', 'menghambat', 'menggantikan', 'menghilangkan'] },
      { from: 'cn4', to: 'cn8', label: 'membatasi jumlah', options: ['membatasi jumlah', 'sama dengan', 'lebih tinggi dari', 'tidak terkait dengan'] },
      { from: 'cn1', to: 'cn5', label: 'menggunakan bagian', options: ['menggunakan bagian', 'menghindari', 'mengganti', 'merusak'] },
    ],
    essayReflection: {
      materialSummaryPrompt:
        'Jelaskan secara runtut semua konsep IPv4 yang kamu pelajari hari ini: dimulai dari format penulisan IPv4, cara membaca IP Header, sistem kelas IP (A/B/C) beserta range-nya, fungsi Subnet Mask dalam memisahkan Network ID dan Host ID, hingga cara menghitung range host yang tersedia. Tulis dengan bahasamu sendiri secara lengkap.',
      easyPartPrompt: 'Konsep IPv4 mana yang paling mudah kamu pahami? Mengapa?',
      hardPartPrompt: 'Bagian IPv4 mana yang masih terasa sulit dan perlu kamu perdalam lagi?',
    },
    selfEvaluationCriteria: [
      { id: 'sc1', label: 'Saya memahami format penulisan IPv4 dalam notasi desimal bertitik.' },
      { id: 'sc2', label: 'Saya dapat membedakan Kelas A, B, dan C berdasarkan oktet pertama.' },
      { id: 'sc3', label: 'Saya memahami fungsi setiap field dalam IP Header.' },
      { id: 'sc4', label: 'Saya dapat menentukan Network ID dan Host ID menggunakan Subnet Mask.' },
      { id: 'sc5', label: 'Saya memahami dampak konflik IP terhadap operasional jaringan.' },
    ],
    conclusionPrompt: 'Berdasarkan penyusunan peta konsep dan refleksi yang telah kamu lakukan, jelaskan bagaimana kamu mampu menyimpulkan sistem pengalamatan IPv4 sebagai fondasi konfigurasi jaringan yang terstruktur. Tuliskan secara tepat dengan kata-katamu sendiri.',
  },

  {
    type: 'authentic-assessment',
    title: 'Authentic Assessment',
    description:
      'Siswa merancang skema pengalamatan IP untuk jaringan kantor UMKM dan mendiagnosis masalah koneksi berdasarkan pemahaman tentang kelas IP dan range host.',
    objectiveCode: 'X.IP.8',
    activityGuide: [
      'Baca data aset UMKM: jumlah perangkat, kebutuhan koneksi, dan segmen jaringan yang tersedia.',
      'Pilih desain pengalamatan IP yang paling logis dan sesuai standar industri.',
      'Jelaskan alasanmu dan ikuti cabang keputusan hingga solusi final.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menentukan urutan desain jaringan yang paling sistematis.',
      'Kemampuan Berargumen: memberi alasan teknis pada setiap keputusan desain IP.',
      'Penarikan Kesimpulan: memilih solusi yang tidak hanya jalan, tapi juga rapi dan scalable.',
    ],
    facilitatorNotes: [
      'Guru memosisikan diri sebagai pemilik UMKM yang meminta rekomendasi desain jaringan.',
      'Guru mendorong siswa mempertimbangkan skalabilitas: bagaimana jika perangkat bertambah di masa depan?',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menganalisis skenario perancangan pengalamatan IPv4 Private & Public pada arsitektur TCP/IP',
      condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
      degree: 'secara logis',
    },
    branchingScenario: {
      context:
        'Sebuah kedai kopi butuh bantuanmu menyeting jaringan. Aset mereka: 1 WiFi Router (Gateway), 1 Server Kasir (IP statis wajib), 1 Printer Struk (IP statis wajib), dan 8 tablet untuk pelayan (IP dinamis). Teknisi sebelumnya meninggalkan catatan: "Gunakan segmen 192.168.1.0/24 — sisa subnet Kelas C."',
      initialQuestion:
        'Berapakah alamat IP yang paling standar dan profesional untuk diberikan kepada WiFi Router sebagai default gateway jaringan ini?',
      focusAreas: ['Gateway Assignment', 'Static IP Planning', 'DHCP Range'],
      choices: [
        {
          id: 'c1',
          text: '192.168.1.1 — alamat pertama yang lazim digunakan sebagai gateway di jaringan Kelas C.',
          isOptimal: true,
          consequence:
            'Pilihan yang sangat umum dan profesional. Alamat .1 sudah menjadi konvensi industri untuk gateway — mudah diingat dan setiap teknisi baru langsung paham tanpa perlu penjelasan.',
          followUpQuestion:
            'Untuk Server Kasir dan Printer Struk yang membutuhkan IP statis tetap, range mana yang paling profesional agar tidak tertukar dengan tablet yang pakai DHCP?',
          followUpChoices: [
            {
              id: 'f1a',
              text: 'Server Kasir = .10, Printer = .11 (range rendah untuk infrastruktur statis), tablet DHCP di .100–.200.',
              isCorrect: true,
              explanation:
                'Sangat bagus! Memisahkan range statis (rendah) dan dinamis (tinggi) adalah praktik manajemen IP terbaik. Teknisi mana pun bisa langsung tahu: .1–.50 adalah infrastruktur statis, .100–.200 adalah client dinamis.',
            },
            {
              id: 'f1b',
              text: 'Server Kasir = .254, Printer = .253 (range akhir) agar tidak konflik dengan DHCP yang mulai dari depan.',
              isCorrect: false,
              explanation:
                'Boleh saja teknis-nya, tapi .254 adalah Broadcast Address — tidak bisa diberikan ke perangkat! (.255 untuk Kelas C /24 adalah broadcast, bukan .254). Hati-hati dengan nilai batas range.',
            },
          ],
        },
        {
          id: 'c2',
          text: '192.168.1.50 — angka tengah agar lebih "aman" dan tidak mudah ditebak.',
          isOptimal: false,
          consequence:
            'Boleh saja secara teknis, tapi sangat tidak lazim. Gateway biasanya di .1 atau .254. Angka tengah (.50) akan membingungkan teknisi lain saat troubleshooting di masa depan.',
          followUpQuestion:
            'Jika ingin mengikuti standar industri, ke alamat mana seharusnya kamu pindahkan gateway?',
          followUpChoices: [
            {
              id: 'f2a',
              text: '192.168.1.1 — mengikuti konvensi industri yang paling universal.',
              isCorrect: true,
              explanation:
                'Tepat. Konsistensi dengan standar industri sangat penting untuk kemudahan pengelolaan jangka panjang. Teknisi siapa pun yang datang pertama kali akan langsung mencoba .1 sebagai gateway.',
            },
            {
              id: 'f2b',
              text: 'Tetap di .50 saja karena sudah terlanjur diseting dan mengubahnya merepotkan.',
              isCorrect: false,
              explanation:
                'Resistensi terhadap perbaikan bukan sikap profesional. Mengubah gateway saat setup awal jauh lebih mudah daripada nanti saat sudah banyak perangkat terhubung.',
            },
          ],
        },
        {
          id: 'c3',
          text: '192.168.1.100 — di tengah range agar bisa diapit oleh perangkat statis di kiri dan kanan.',
          isOptimal: false,
          consequence:
            'Ini menunjukkan perencanaan yang tidak sistematis. Menempatkan gateway di tengah range mempersulit pengelolaan karena range statis dan dinamis menjadi tidak jelas batasnya.',
          followUpQuestion:
            'Mengapa penempatan gateway di range tengah (.100) mempersulit manajemen jaringan jangka panjang?',
          followUpChoices: [
            {
              id: 'f3a',
              text: 'Karena DHCP tidak tahu harus mengecualikan .100 saat memberikan IP ke perangkat baru, sehingga berpotensi terjadi konflik IP.',
              isCorrect: true,
              explanation:
                'Tepat. Saat gateway berada di tengah range DHCP, kamu harus secara manual mengecualikan .100 dari pool DHCP — langkah ekstra yang mudah terlupakan dan berisiko konflik.',
            },
            {
              id: 'f3b',
              text: 'Tidak ada masalah, asalkan semua perangkat lain diberi IP yang berbeda.',
              isCorrect: false,
              explanation:
                'Secara teknis bisa jalan, tetapi ini mengabaikan prinsip desain jaringan yang scalable dan mudah dikelola. Jaringan yang baik harus mudah dipahami oleh siapa pun yang mengelolanya.',
            },
          ],
        },
      ],
      finalEvaluation:
        'Tunjukkan bahwa kamu tidak hanya bisa membuat jaringan "bisa jalan", tapi juga bisa merancang jaringan yang rapi, mengikuti standar industri, dan mudah dikelola oleh siapa pun yang meneruskannya.',
    },
    conclusionPrompt: 'Berdasarkan studi kasus bercabang tentang perancangan IP kedai kopi yang telah kamu analisis, jelaskan bagaimana kamu mampu menganalisis skenario perancangan pengalamatan IPv4 Private & Public pada arsitektur TCP/IP. Tuliskan secara logis dengan kata-katamu sendiri.',
  },
];
