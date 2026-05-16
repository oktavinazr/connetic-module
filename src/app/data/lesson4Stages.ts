import type { Stage } from './lessons';

export const lesson4Stages: Stage[] = [
  {
    type: 'constructivism',
    title: 'Constructivism',
    description:
      'Siswa membangun pemahaman awal tentang keterbatasan IPv4 dan kebutuhan IPv6 melalui analogi pertumbuhan perangkat digital yang pesat.',
    objectiveCode: 'X.IP.9',
    activityGuide: [
      'Susun 6 potongan cerita tentang mengapa dunia membutuhkan IPv6 menjadi urutan yang logis.',
      'Tulis refleksi: apa yang terjadi jika alamat IPv4 habis sementara perangkat terus bertambah.',
      'Urutkan proses evolusi dari IPv4 ke IPv6 melalui aktivitas Process Chain.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menjelaskan konsep dasar IPv6 sebagai solusi keterbatasan ruang alamat IPv4',
      condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif pada CONNETIC Module',
      degree: 'dengan tepat',
    },
    apersepsi:
      'Pernahkah kamu membayangkan apa yang terjadi jika semua orang di dunia punya 10 gadget yang butuh internet? IPv4 hanya punya sekitar 4,3 miliar alamat. Penduduk bumi saja sudah 8 miliar — belum termasuk jutaan kamera CCTV, sensor rumah pintar, dan kendaraan otonom. Kita butuh sistem pengalamatan yang jauh lebih besar!',
    storyScramble: {
      instruction:
        'Bagaimana dunia menyadari kebutuhan mendesak akan IPv6 dan mengapa transisi ini tidak bisa dihindari? Susun 6 potongan cerita berikut menjadi urutan yang logis.',
      fragments: [
        {
          id: 'f1',
          text: 'Internet diciptakan pada era 1970-an menggunakan IPv4 dengan sekitar 4,3 miliar alamat yang pada saat itu dianggap lebih dari cukup.',
          order: 1,
        },
        {
          id: 'f2',
          text: 'Jumlah pengguna internet bertumbuh pesat — dari jutaan di era 90-an menjadi miliaran pada tahun 2010-an, menghabiskan alamat IPv4 jauh lebih cepat dari prediksi.',
          order: 2,
        },
        {
          id: 'f3',
          text: 'Ledakan perangkat IoT (Internet of Things) seperti sensor, kamera pintar, dan peralatan rumah tangga terhubung semakin memperparah kelangkaan alamat IPv4.',
          order: 3,
        },
        {
          id: 'f4',
          text: 'IANA (lembaga pengelola alamat IP global) mengumumkan kehabisan blok IPv4 terakhir pada Februari 2011 — penanda era krisis alamat IP.',
          order: 4,
        },
        {
          id: 'f5',
          text: 'IPv6 dikembangkan dengan ruang alamat 128-bit yang menghasilkan sekitar 340 undecillion alamat — secara praktis tidak akan pernah habis.',
          order: 5,
        },
        {
          id: 'f6',
          text: 'Dunia mulai beralih ke IPv6 secara bertahap menggunakan strategi Dual Stack (menjalankan IPv4 dan IPv6 bersamaan) untuk masa transisi.',
          order: 6,
        },
      ],
      successMessage:
        'Tepat! IPv6 lahir bukan karena sekadar pembaruan teknologi, melainkan karena kebutuhan mendesak akan ruang alamat yang hampir tak terbatas.',
    },
    constructivismEssay1:
      'Jika IPv4 sudah memiliki 4,3 miliar alamat, mengapa kita baru merasakan kekurangannya sekarang dan bukan 30 tahun yang lalu? Jelaskan faktor-faktor apa saja yang mempercepat habisnya alamat IPv4!',
    analogySortGroups: [
      { id: 'ipv6', label: 'Perbandingan IPv4 vs IPv6', colorClass: 'blue' },
    ],
    analogySortItems: [
      {
        id: 'ap1',
        text: 'IPv4 menggunakan 32-bit biner, menghasilkan ~4,3 miliar alamat unik.',
        courierAnalogy: 'Seperti buku telepon kota kecil — cukup untuk dulu, tapi tidak untuk miliaran pengguna modern.',
        correctGroup: 'ipv6',
        correctOrder: 1,
      },
      {
        id: 'ap2',
        text: 'IPv6 menggunakan 128-bit, menghasilkan ~340 undecillion alamat — secara praktis tidak terbatas.',
        courierAnalogy: 'Seperti memberikan alamat unik pada setiap pasir di pantai di seluruh dunia, masih tersisa cadangan yang hampir tidak terhitung.',
        correctGroup: 'ipv6',
        correctOrder: 2,
      },
      {
        id: 'ap3',
        text: 'IPv4 ditulis dalam format dotted decimal: 4 angka 0–255 dipisahkan titik (contoh: 192.168.1.1).',
        courierAnalogy: 'Seperti nomor telepon 8 digit — relatif mudah diingat manusia.',
        correctGroup: 'ipv6',
        correctOrder: 3,
      },
      {
        id: 'ap4',
        text: 'IPv6 ditulis dalam format heksadesimal: 8 kelompok 4-digit hex dipisahkan titik dua (contoh: 2001:0db8:85a3::8a2e:0370:7334).',
        courierAnalogy: 'Seperti nomor seri perangkat elektronik — panjang dan kompleks, tapi dirancang untuk mesin, bukan manusia.',
        correctGroup: 'ipv6',
        correctOrder: 4,
      },
      {
        id: 'ap5',
        text: 'IPv4 memerlukan NAT (Network Address Translation) untuk mengatasi keterbatasan alamat di jaringan lokal.',
        courierAnalogy: 'Seperti apartemen dengan satu alamat gedung tapi ratusan kamar di dalamnya — hanya gedung yang punya alamat publik.',
        correctGroup: 'ipv6',
        correctOrder: 5,
      },
      {
        id: 'ap6',
        text: 'IPv6 setiap perangkat bisa memiliki IP publik unik — tidak perlu NAT karena alamat tersedia untuk semua.',
        courierAnalogy: 'Seperti setiap penghuni apartemen memiliki alamat pos sendiri yang unik — pengiriman langsung tanpa perantara.',
        correctGroup: 'ipv6',
        correctOrder: 6,
      },
    ],
    constructivismEssay2:
      'Berdasarkan perbandingan IPv4 dan IPv6 yang baru saja kamu susun, jelaskan apa keuntungan terbesar dari beralih ke IPv6 selain sekadar jumlah alamat yang lebih banyak!',
  },

  {
    type: 'inquiry',
    title: 'Inquiry',
    description:
      'Siswa mengeksplorasi format penulisan IPv6, aturan kompresi alamat, jenis-jenis alamat IPv6, dan proses pembentukan IPv6 Link Local menggunakan standar EUI-64.',
    objectiveCode: 'X.IP.10',
    activityGuide: [
      'Pelajari struktur 128-bit IPv6 dan aturan kompresi (Zero Suppression & Double Colon) melalui panel eksplorasi.',
      'Urutkan 5 langkah proses kompresi alamat IPv6 dari format lengkap ke format paling singkat.',
      'Cocokkan jenis alamat IPv6 (Global Unicast, Link-Local, Loopback, dll.) dengan karakteristiknya.',
      'Tulis refleksi: mengapa IPv6 perlu aturan kompresi yang ketat?',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengurutkan proses kompresi IPv6 secara sistematis.',
      'Analisis Format: membedakan jenis alamat IPv6 berdasarkan prefix dan karakteristiknya.',
      'Refleksi Konsep: menjelaskan mengapa desain IPv6 memprioritaskan skalabilitas over kemudahan manusia.',
    ],
    facilitatorNotes: [
      'Guru menekankan bahwa aturan "::" hanya boleh digunakan SATU KALI dalam satu alamat IPv6.',
      'Guru mendorong siswa mencoba kompresi sendiri sebelum melihat jawabannya di panel eksplorasi.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menerapkan tahapan standar EUI-64 untuk membentuk IPv6 Link Local Address dari alamat MAC secara berurutan',
      condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
      degree: 'secara runtut',
    },
    material: {
      title: 'Format dan Struktur Alamat IPv6',
      content: [
        'IPv6 menggunakan 128-bit yang ditulis dalam 8 kelompok (blok) heksadesimal 16-bit, dipisahkan tanda titik dua. Contoh lengkap: 2001:0db8:85a3:0000:0000:8a2e:0370:7334.',
        'Karena sangat panjang untuk diketik dan dibaca manusia, IPv6 memiliki dua aturan kompresi: (1) Leading zeros boleh dihapus dari setiap blok, (2) satu kelompok berurutan blok nol bisa disingkat menjadi "::".',
      ],
      examples: [
        '2001:db8::1 → Alamat Global Unicast (untuk routing internet publik).',
        'fe80::1 → Alamat Link-Local (hanya berlaku dalam satu jaringan lokal).',
        '::1 → Loopback Address (seperti 127.0.0.1 di IPv4).',
        'fc00::/7 → Unique Local (seperti Private IP di IPv4).',
      ],
    },
    explorationSections: [
      {
        id: 'e1',
        title: 'Format Heksadesimal 128-bit',
        content:
          'IPv6 menggunakan sistem bilangan heksadesimal (basis 16: angka 0–9 dan huruf A–F). Setiap blok terdiri dari 4 digit hex (16-bit). Total: 8 blok × 16-bit = 128-bit. Contoh satu blok: "0db8" = 0000 1101 1011 1000 dalam biner.',
        example:
          'Bandingkan: IPv4 punya 4 oktet × 8-bit = 32-bit. IPv6 punya 8 blok × 16-bit = 128-bit. Inilah alasan IPv6 memiliki 2^128 ≈ 340 undecillion kombinasi alamat yang berbeda.',
      },
      {
        id: 'e2',
        title: 'Aturan Kompresi 1: Hapus Leading Zeros',
        content:
          'Nol di posisi paling kiri dalam setiap blok boleh dihilangkan. Contoh: "0db8" → "db8", "0001" → "1", "0000" → "0" (minimal satu digit harus ada). Aturan ini berlaku untuk setiap blok secara independen.',
        example:
          '2001:0db8:0000:0000:0000:0000:0000:0001 → Setelah hapus leading zeros: 2001:db8:0:0:0:0:0:1. (Perhatikan: "0000" menjadi "0", bukan kosong.)',
      },
      {
        id: 'e3',
        title: 'Aturan Kompresi 2: Double Colon (::)',
        content:
          'SATU kelompok berurutan dari blok "0" bisa disingkat menjadi "::". PERINGATAN KRITIS: "::" hanya boleh muncul SATU KALI dalam satu alamat IPv6! Jika muncul dua kali, alamat menjadi ambigu dan tidak valid.',
        example:
          '2001:db8:0:0:0:0:0:1 → Gunakan "::" untuk 5 blok nol berurutan: 2001:db8::1. SALAH: 2001::db8::1 (dua "::" tidak diizinkan karena tidak jelas berapa blok yang dihilangkan masing-masing).',
      },
      {
        id: 'e4',
        title: 'IPv6 Link Local Address & EUI-64',
        content:
          'Link Local Address (fe80::/10) adalah alamat IPv6 yang otomatis dibuat perangkat untuk berkomunikasi dalam satu jaringan lokal tanpa konfigurasi manual. Pembentukannya menggunakan standar EUI-64: ambil MAC Address 48-bit, sisipkan "FFFE" di tengahnya, flip bit ke-7, lalu gabungkan dengan prefix fe80::.',
        example:
          'MAC: AA:BB:CC:DD:EE:FF → EUI-64: AABB:CCFF:FEDD:EEFF → Flip bit ke-7 → A8BB:CCFF:FEDD:EEFF → Link Local: fe80::a8bb:ccff:fedd:eeff.',
      },
      {
        id: 'e5',
        title: 'Jenis-Jenis Alamat IPv6',
        content:
          'IPv6 memiliki tiga jenis alamat: (1) Unicast — untuk satu perangkat spesifik (Global, Link-Local, Unique Local), (2) Multicast — untuk sekelompok perangkat (ff00::/8), (3) Anycast — untuk perangkat terdekat dalam sebuah grup. IPv6 TIDAK memiliki Broadcast seperti IPv4 — fungsinya digantikan Multicast.',
        example:
          '2001:db8::/32 = Global Unicast (internet publik). fe80::/10 = Link-Local (lokal otomatis). ::1 = Loopback. ff02::1 = Multicast semua node (pengganti broadcast).',
      },
    ],
    flowInstruction:
      'Urutkan 5 langkah proses kompresi alamat IPv6 berikut dari format paling lengkap (awal) hingga format paling singkat yang valid (akhir).',
    flowItems: [
      { id: 'fl1', text: 'Alamat IPv6 Penuh (128-bit, 8 blok lengkap)', correctOrder: 1, description: 'Format asli tanpa kompresi apapun.', colorClass: 'purple' },
      { id: 'fl2', text: 'Hapus Leading Zeros tiap blok', correctOrder: 2, description: 'Hilangkan nol di kiri setiap blok 4-digit.', colorClass: 'blue' },
      { id: 'fl3', text: 'Identifikasi Kelompok Blok Nol Terpanjang', correctOrder: 3, description: 'Cari kelompok nol berurutan yang paling panjang.', colorClass: 'green' },
      { id: 'fl4', text: 'Terapkan "::" pada Kelompok Nol Terpanjang', correctOrder: 4, description: 'Singkat satu kelompok nol berurutan terpanjang dengan ::.', colorClass: 'amber' },
      { id: 'fl5', text: 'Verifikasi: "::" hanya muncul Satu Kali', correctOrder: 5, description: 'Pastikan alamat tidak ambigu dan valid.', colorClass: 'pink' },
    ],
    inquiryReflection1:
      'Jelaskan pemahamanmu tentang kedua aturan kompresi IPv6. Mengapa aturan "::" hanya boleh digunakan satu kali? Apa yang terjadi jika "::" muncul dua kali dalam satu alamat?',
    matchingPairs: [
      { left: '2001::/3', right: 'Global Unicast — alamat untuk komunikasi internet publik.' },
      { left: 'fe80::/10', right: 'Link-Local — hanya berlaku dalam satu jaringan lokal langsung.' },
      { left: 'fc00::/7', right: 'Unique Local — seperti Private IP, untuk jaringan internal.' },
      { left: 'ff00::/8', right: 'Multicast — untuk mengirim ke sekelompok perangkat sekaligus.' },
      { left: '::1', right: 'Loopback — untuk testing komunikasi dengan dirinya sendiri.' },
    ],
    inquiryReflection2:
      'Setelah mempelajari jenis-jenis alamat IPv6, jelaskan mengapa IPv6 tidak memerlukan NAT (Network Address Translation) seperti IPv4! Apa implikasinya bagi koneksi perangkat IoT di masa depan?',
  },

  {
    type: 'questioning',
    title: 'Questioning',
    description:
      'Siswa menganalisis tantangan kompatibilitas saat perangkat lama IPv4 dan perangkat baru IPv6 harus berkomunikasi di jaringan yang sama.',
    objectiveCode: 'X.IP.11',
    activityGuide: [
      'Amati skenario "IPv4-IPv6 Incompatibility": perangkat lama tidak bisa langsung berkomunikasi dengan perangkat IPv6.',
      'Pilih strategi transisi yang paling tepat untuk skenario yang diberikan.',
      'Jelaskan alasan teknis mengapa strategi tersebut lebih baik dari alternatif lainnya.',
    ],
    logicalThinkingIndicators: [
      'Kemampuan Berargumen: memilih strategi transisi yang tepat berdasarkan kondisi infrastruktur yang ada.',
      'Penarikan Kesimpulan: menghubungkan keterbatasan IPv4 dengan solusi teknis yang tersedia.',
    ],
    facilitatorNotes: [
      'Guru menjelaskan perbedaan antara Dual Stack (menjalankan keduanya), Tunneling (membungkus IPv6 dalam IPv4), dan NAT64 (menerjemahkan).',
      'Guru mendorong siswa berpikir tentang trade-off: kemudahan vs biaya vs risiko setiap strategi.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menerapkan aturan penyederhanaan IPv6 pada skenario yang diberikan',
      condition: 'melalui aktivitas questioning berupa tanya jawab dua arah pada CONNETIC Module',
      degree: 'secara tepat',
    },
    problemVisual: {
      icon: '!',
      title: 'Inkompatibilitas IPv4 dan IPv6',
      description:
        'Laptop baru dengan IPv6 tidak bisa berkomunikasi langsung dengan server lama yang hanya paham IPv4. Mereka berbicara "bahasa" yang berbeda!',
      problemType: 'delay',
    },
    teacherQuestion:
      'Bisakah satu kabel jaringan yang sama membawa trafik IPv4 dan IPv6 secara bersamaan? Bagaimana cara memastikan perangkat lama dan baru bisa saling berkomunikasi?',
    scenario:
      'Sekolah mendapat hibah bandwidth internet 1 Gbps yang menggunakan IPv6 murni dari ISP. Namun, Lab Komputer masih memiliki 20 PC lama dengan Windows 7 yang driver jaringannya hanya mendukung IPv4. Server e-learning sekolah sudah IPv6-ready. Siswa mengeluh beberapa website tidak bisa diakses dari PC lama.',
    whyQuestion:
      'Metode transisi mana yang paling direkomendasikan agar semua perangkat (lama dan baru) bisa mengakses internet dan server sekolah tanpa harus mengganti semua hardware sekaligus?',
    hint:
      'Cari metode yang memungkinkan KEDUA protokol (IPv4 dan IPv6) berjalan bersamaan di perangkat yang sama tanpa harus memilih salah satu.',
    reasonOptions: [
      {
        id: 'r1',
        text: 'Dual Stack — perangkat yang mendukung menjalankan IPv4 dan IPv6 secara bersamaan, sedangkan perangkat lama tetap pakai IPv4 saja.',
        isCorrect: true,
        feedback:
          'Tepat! Dual Stack adalah metode transisi paling aman dan direkomendasikan IETF. Perangkat baru bisa bicara dalam dua "bahasa" sekaligus. Perangkat lama tetap pakai IPv4. Migrasi bisa dilakukan bertahap tanpa downtime.',
      },
      {
        id: 'r2',
        text: 'Mematikan semua IPv4 seketika dan memaksa seluruh jaringan sekolah beralih ke IPv6 dalam satu malam.',
        isCorrect: false,
        feedback:
          'Migrasi "big bang" seperti ini sangat berisiko. PC Windows 7 lama tidak mendukung IPv6 penuh — semuanya akan kehilangan koneksi sekaligus dan kegiatan belajar terhenti total.',
      },
      {
        id: 'r3',
        text: 'Tunneling — membungkus paket IPv6 di dalam paket IPv4 agar bisa melintas jaringan yang hanya mengenal IPv4.',
        isCorrect: false,
        feedback:
          'Tunneling adalah solusi valid untuk menghubungkan dua "pulau IPv6" melewati jaringan IPv4. Namun untuk skenario ini (PC lama yang hanya IPv4 ingin akses resource IPv6), Dual Stack lebih tepat karena menangani kompatibilitas dua arah secara langsung.',
      },
      {
        id: 'r4',
        text: 'Membeli semua perangkat baru yang mendukung IPv6 dan membuang semua PC lama.',
        isCorrect: false,
        feedback:
          'Ini solusi brute-force yang tidak efisien secara biaya. Dual Stack memungkinkan perangkat lama tetap digunakan selama masa transisi — penggantian hardware bisa dilakukan secara bertahap sesuai anggaran.',
      },
    ],
    questionBank: [
      {
        id: 'q1',
        text: 'Apa perbedaan utama antara Dual Stack dan Tunneling?',
        response:
          'Dual Stack: perangkat menjalankan IPv4 DAN IPv6 secara bersamaan — bisa berkomunikasi dengan siapa pun. Tunneling: paket IPv6 "dibungkus" dalam paket IPv4 untuk melintas jaringan IPv4 — seperti mengirim surat modern menggunakan amplop lama.',
      },
      {
        id: 'q2',
        text: 'Apa itu NAT64 dan kapan digunakan?',
        response:
          'NAT64 adalah mekanisme yang menerjemahkan alamat IPv6 ke IPv4 agar perangkat IPv6-only bisa mengakses server IPv4-only (dan sebaliknya dengan DNS64). Berguna saat jaringan sudah full IPv6 tapi masih ada resource lama yang hanya IPv4.',
      },
      {
        id: 'q3',
        text: 'Apakah IPv6 lebih aman dari IPv4 secara bawaan?',
        response:
          'Ya, IPv6 dirancang dengan dukungan IPsec (enkripsi dan autentikasi) sebagai fitur wajib (bukan opsional seperti di IPv4). Ini membuat komunikasi end-to-end lebih mudah dienkripsi secara standar. Namun implementasinya tetap tergantung pada konfigurasi pengguna.',
      },
    ],
  },

  {
    type: 'learning-community',
    title: 'Learning Community',
    description:
      'Siswa berdiskusi dalam kelompok tentang implementasi IPv6 dalam konteks masa depan: IoT, Smart City, dan keamanan jaringan.',
    objectiveCode: 'X.IP.12',
    activityGuide: [
      'Baca skenario Smart Agriculture: ribuan sensor IoT yang butuh IP publik unik.',
      'Analisis Studi Kasus 1 (IPv6 untuk IoT): pilih jawaban, tulis argumen, kirim ke kelompok.',
      'Analisis Studi Kasus 2 (Keamanan Header IPv6): pilih jawaban, tulis argumen, kirim ke kelompok.',
      'Diskusikan dan beri vote pada argumen paling logis dan visioner secara teknis.',
    ],
    logicalThinkingIndicators: [
      'Kemampuan Berargumen: menghubungkan fitur teknis IPv6 dengan manfaat praktis di dunia nyata.',
      'Validasi Komunal: mengevaluasi argumen rekan berdasarkan pemahaman teknis IPv6.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menganalisis setiap langkah proses EUI-64 untuk menentukan kebenaran hasil konversi alamat MAC menjadi IPv6 Link Local Address',
      condition: 'melalui aktivitas learning community berupa papan kolaborasi studi kasus pada CONNETIC Module',
      degree: 'secara logis',
    },
    layers5: [
      { id: 'L5', name: 'Application', pdu: 'Data', color: '#8B5CF6', desc: 'Aplikasi sensor mengirim data kelembapan ke server pertanian cloud.' },
      { id: 'L4', name: 'Transport', pdu: 'Segment', color: '#628ECB', desc: 'UDP membawa data sensor secara cepat (realtime tidak perlu TCP).' },
      { id: 'L3', name: 'Network (IPv6)', pdu: 'Packet', color: '#10B981', desc: 'IPv6 memberi setiap sensor IP publik unik tanpa NAT.' },
      { id: 'L2', name: 'Data Link', pdu: 'Frame', color: '#F59E0B', desc: 'IEEE 802.15.4 atau LoRaWAN untuk transmisi IoT jarak jauh.' },
      { id: 'L1', name: 'Physical', pdu: 'Bits', color: '#395886', desc: 'Gelombang radio atau kabel sensor membawa bit di lapangan.' },
    ],
    encapsulationCase: {
      id: 'X.IPv6.5.A',
      title: 'Studi Kasus: IPv6 untuk Smart Agriculture',
      concept:
        'Dengan IPv6, setiap sensor IoT bisa memiliki IP publik unik secara global — tidak perlu NAT, tidak perlu konfigurasi router rumit. Ini memungkinkan pemantauan langsung dari mana saja di dunia.',
      scenario:
        'Seorang petani modern ingin memasang 1.000 sensor kelembapan dan suhu tanah di kebun seluas 50 hektar. Setiap sensor perlu terhubung ke internet secara mandiri untuk mengirim data realtime ke dashboard pertanian cloud-nya.',
      question:
        'Apa keuntungan TEKNIS terbesar menggunakan IPv6 murni (tanpa NAT) untuk ribuan sensor ini dibandingkan tetap menggunakan IPv4 dengan NAT?',
      options: [
        {
          id: 'A',
          text: 'Setiap sensor mendapat IP publik unik sehingga bisa dipantau langsung dari cloud tanpa konfigurasi port forwarding yang rumit di router.',
          logic: 'Tepat. Dengan IPv6, end-to-end connectivity menjadi langsung. Tidak perlu NAT = tidak perlu port forwarding = konfigurasi lebih sederhana dan lebih scalable untuk ribuan sensor.',
        },
        {
          id: 'B',
          text: 'Sensor menjadi lebih tahan air karena IPv6 memiliki lapisan perlindungan fisik tambahan.',
          logic: 'Salah. Protokol jaringan (IPv4/IPv6) tidak berpengaruh pada ketahanan fisik perangkat. Ketahanan air adalah masalah desain hardware, bukan protokol.',
        },
        {
          id: 'C',
          text: 'Sinyal WiFi sensor menjadi lebih kuat karena IPv6 memancarkan gelombang radio yang lebih efisien.',
          logic: 'Salah. IPv6 adalah protokol layer 3 (logis) — sama sekali tidak mengubah kekuatan sinyal radio di layer 1 (fisik). Sinyal bergantung pada hardware antena, bukan protokol IP.',
        },
      ],
    },
    decapsulationCase: {
      id: 'X.IPv6.6.B',
      title: 'Studi Kasus: Keamanan Header IPv6 untuk Perbankan',
      concept:
        'Header IPv6 dirancang lebih sederhana dari IPv4 tetapi dengan dukungan IPsec yang lebih kuat sejak awal. Ini memudahkan implementasi enkripsi end-to-end untuk aplikasi kritis seperti perbankan.',
      scenario:
        'Sebuah bank nasional sedang memigrasi infrastruktur mereka ke IPv6. Tim keamanan ingin memanfaatkan fitur IPsec yang sudah terintegrasi dalam IPv6 untuk mengamankan transaksi nasabah.',
      question:
        'Bagaimana dukungan IPsec built-in dalam IPv6 membantu keamanan transaksi perbankan digital dibandingkan IPv4?',
      options: [
        {
          id: 'A',
          text: 'Mempermudah implementasi enkripsi end-to-end secara standar — setiap koneksi bisa dienkripsi tanpa perlu konfigurasi tambahan yang rumit.',
          logic: 'Tepat. IPsec sebagai fitur wajib IPv6 berarti semua perangkat yang compliant sudah siap untuk enkripsi — tidak perlu plugin atau software tambahan yang berbeda-beda di setiap perangkat.',
        },
        {
          id: 'B',
          text: 'Nasabah tidak perlu lagi menggunakan password karena IPv6 address sudah membuktikan identitas pemilik rekening.',
          logic: 'Berbahaya dan salah. IP address bisa dipalsukan (spoofed). Autentikasi identitas manusia tetap harus menggunakan password, MFA, atau biometrik — bukan IP address.',
        },
        {
          id: 'C',
          text: 'Saldo nasabah otomatis bertambah karena efisiensi pengiriman data paket IPv6 lebih hemat biaya operasional bank.',
          logic: 'Tidak logis. Efisiensi protokol jaringan tidak berkaitan dengan saldo rekening nasabah. Protokol mengoptimalkan pengiriman data, bukan keuangan.',
        },
      ],
    },
    groupActivity: {
      groupNames: ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'],
      discussionPrompt:
        'Diskusikan: Apakah Indonesia harus segera migrasi total ke IPv6, atau tetap menggunakan IPv4 selama mungkin dengan NAT? Apa hambatan terbesar migrasi IPv6 di Indonesia? Berikan vote pada argumen yang paling realistis dan berbasis data.',
    },
  },

  {
    type: 'modeling',
    title: 'Modeling — Kompresi IPv6 & Pembentukan Link Local',
    description:
      'Siswa mempraktikkan teknik penyederhanaan penulisan IPv6 dan memahami proses pembentukan IPv6 Link Local Address menggunakan standar EUI-64.',
    objectiveCode: 'X.IP.13',
    activityGuide: [
      'Ikuti demonstrasi penghapusan leading zeros dari setiap blok IPv6.',
      'Terapkan aturan "::" untuk menyingkat blok nol berurutan terpanjang.',
      'Praktikkan pembentukan IPv6 Link Local dari MAC Address menggunakan EUI-64.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengikuti langkah kompresi IPv6 secara sistematis tanpa melanggar aturan.',
      'Penerapan Konsep: menerapkan proses EUI-64 untuk menghasilkan Link Local dari MAC Address.',
    ],
    facilitatorNotes: [
      'Guru memperingatkan: "::" hanya boleh satu kali. Minta siswa menunjukkan alamat yang SALAH jika "::" dua kali.',
      'Guru mendemonstrasikan "flip bit ke-7" dalam EUI-64 sebagai mekanisme untuk membedakan alamat global dari lokal.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mensimulasikan proses perencanaan pengalamatan IPv6 Gateway (Global Unicast) pada interface router',
      condition: 'melalui aktivitas modeling berupa simulasi step-by-step pada CONNETIC Module',
      degree: 'secara sistematis',
    },
    practiceInstructions: {
      forTeacher: [
        'Tampilkan alamat penuh: 2001:0db8:0000:0000:0000:0000:0000:0001.',
        'Demonstrasikan step 1 (hapus leading zeros): 2001:db8:0:0:0:0:0:1.',
        'Demonstrasikan step 2 (gunakan ::): 2001:db8::1 — hitung ada 5 blok nol yang disingkat.',
        'Untuk EUI-64: MAC AA:BB:CC:DD:EE:FF → sisipkan FFFE → AA:BB:CC:FF:FE:DD:EE:FF → flip bit ke-7 → A8:BB:CC:FF:FE:DD:EE:FF → Link Local: fe80::a8bb:ccff:fedd:eeff.',
      ],
      forStudent: [
        'Hapus leading zeros dari setiap blok IPv6 yang diberikan.',
        'Identifikasi kelompok blok nol terpanjang dan terapkan "::".',
        'Klik "Jalankan Proses" untuk memvalidasi hasil kompresimu.',
      ],
    },
    modelingSteps: [
      {
        id: 'v6m1',
        type: 'example',
        title: 'Langkah 1: Hapus Leading Zeros Setiap Blok',
        content:
          'Ambil alamat: 2001:0db8:0000:0000:1234:0000:0000:0567. Hapus nol di kiri setiap blok: 0db8 → db8, 0000 → 0, 0567 → 567. Hasil: 2001:db8:0:0:1234:0:0:567.',
        interactiveAction: 'Amati animasi penghapusan leading zeros satu per satu dari setiap blok.',
      },
      {
        id: 'v6m2',
        type: 'example',
        title: 'Langkah 2: Terapkan "::" pada Blok Nol Terpanjang',
        content:
          'Dari hasil sebelumnya: 2001:db8:0:0:1234:0:0:567. Ada dua kelompok nol: "0:0" di posisi 3-4 dan "0:0" di posisi 6-7 (sama panjang). Pilih SALAH SATU (pilih yang lebih di kiri sebagai konvensi). Hasil: 2001:db8::1234:0:0:567.',
        interactiveAction: 'Amati pemilihan kelompok nol dan penerapan "::".',
      },
      {
        id: 'v6m3',
        type: 'practice',
        title: 'Langkah 3: Tantangan Kompresi Mandiri',
        content:
          'Singkatlah alamat ini: 2001:0000:0000:0000:0000:0000:0000:0001. (Petunjuk: ada 6 blok nol berurutan di tengah. Hapus leading zeros, lalu gunakan "::" untuk semua nol tersebut. Jawaban: 2001::1).',
        interactiveAction: 'Klik "Jalankan Proses" setelah kamu menentukan bentuk paling singkat yang valid.',
      },
    ],
  },

  {
    type: 'reflection',
    title: 'Reflection',
    description:
      'Siswa menyusun peta konsep menyeluruh yang membandingkan IPv4 dan IPv6 serta menghubungkan semua konsep yang dipelajari dalam Pertemuan 4.',
    objectiveCode: 'X.IP.14',
    activityGuide: [
      'Hubungkan konsep-konsep IPv6 dan perbandingannya dengan IPv4 menggunakan label yang tepat.',
      'Pastikan peta konsepmu mencerminkan perbedaan format, mekanisme, dan kegunaan IPv4 vs IPv6.',
      'Tulis ringkasan menyeluruh tentang semua konsep IPv6 yang dipelajari hari ini secara runtut dan logis.',
    ],
    logicalThinkingIndicators: [
      'Penarikan Kesimpulan: menghubungkan fitur-fitur IPv6 dengan keterbatasan IPv4 yang diatasi.',
    ],
    facilitatorNotes: [
      'Guru mendorong siswa merefleksikan perjalanan belajar selama 4 pertemuan: dari TCP hingga IPv6.',
      'Guru mengajak siswa membayangkan bagaimana internet akan terlihat jika IPv6 sudah diadopsi 100%.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menyimpulkan perbedaan karakteristik antara pengalamatan IPv4 dan IPv6 serta kesesuaian penggunaannya dalam konteks jaringan modern',
      condition: 'melalui aktivitas reflection berupa konstruksi rekap materi pada CONNETIC Module',
      degree: 'secara tepat',
    },
    conceptMapNodes: [
      { id: 'cn1', label: 'IPv6', description: 'Protokol pengalamatan 128-bit generasi berikutnya.', colorClass: 'blue' },
      { id: 'cn2', label: 'Format Heksadesimal', description: '8 blok 16-bit dipisahkan titik dua.', colorClass: 'purple' },
      { id: 'cn3', label: 'Kompresi "::"', description: 'Menyingkat blok nol berurutan menjadi ::.', colorClass: 'green' },
      { id: 'cn4', label: 'Link Local (fe80::)', description: 'Dibentuk otomatis menggunakan EUI-64.', colorClass: 'amber' },
      { id: 'cn5', label: 'EUI-64', description: 'Standar pembentukan Interface ID dari MAC Address.', colorClass: 'pink' },
      { id: 'cn6', label: 'Dual Stack', description: 'Metode transisi menjalankan IPv4 dan IPv6 bersamaan.', colorClass: 'indigo' },
      { id: 'cn7', label: 'IPv4', description: 'Protokol 32-bit yang sedang digantikan.', colorClass: 'amber' },
      { id: 'cn8', label: 'IPsec Built-in', description: 'Keamanan terintegrasi sebagai fitur wajib IPv6.', colorClass: 'purple' },
    ],
    conceptMapConnections: [
      { from: 'cn1', to: 'cn2', label: 'menggunakan format', options: ['menggunakan format', 'menghapus', 'mengabaikan', 'bertentangan dengan'] },
      { from: 'cn2', to: 'cn3', label: 'disederhanakan dengan', options: ['disederhanakan dengan', 'menyatukan', 'melewatkan', 'menyamakan'] },
      { from: 'cn4', to: 'cn5', label: 'dibentuk menggunakan', options: ['dibentuk menggunakan', 'meniadakan', 'mengabaikan', 'mengganti'] },
      { from: 'cn1', to: 'cn4', label: 'memiliki jenis alamat', options: ['memiliki jenis alamat', 'menolak', 'menghapus', 'melewatkan'] },
      { from: 'cn6', to: 'cn7', label: 'menjembatani ke', options: ['menjembatani ke', 'menghambat', 'menggantikan', 'menghilangkan'] },
      { from: 'cn1', to: 'cn8', label: 'dilengkapi fitur', options: ['dilengkapi fitur', 'sama dengan', 'lebih rendah dari', 'tidak terkait dengan'] },
      { from: 'cn1', to: 'cn6', label: 'ditransisikan dengan', options: ['ditransisikan dengan', 'menghindari', 'mengganti', 'merusak'] },
    ],
    essayReflection: {
      materialSummaryPrompt:
        'Jelaskan secara runtut semua konsep IPv6 yang kamu pelajari hari ini: mulai dari alasan kebutuhan IPv6, format penulisannya yang berbeda dengan IPv4, aturan kompresi (leading zeros dan double colon), cara pembentukan IPv6 Link Local menggunakan EUI-64, jenis-jenis alamat IPv6, hingga strategi transisi dari IPv4 ke IPv6. Tulis perbandingan IPv4 vs IPv6 dengan bahasamu sendiri secara lengkap.',
      easyPartPrompt: 'Konsep IPv6 mana yang paling mudah kamu pahami dibandingkan IPv4? Mengapa?',
      hardPartPrompt: 'Bagian IPv6 mana yang paling menantang untuk dipahami dan perlu kamu pelajari lebih lanjut?',
    },
    selfEvaluationCriteria: [
      { id: 'sc1', label: 'Saya memahami mengapa IPv6 diciptakan untuk menggantikan IPv4.' },
      { id: 'sc2', label: 'Saya dapat menerapkan aturan kompresi alamat IPv6 dengan benar.' },
      { id: 'sc3', label: 'Saya memahami proses pembentukan IPv6 Link Local menggunakan EUI-64.' },
      { id: 'sc4', label: 'Saya dapat membedakan jenis-jenis alamat IPv6 (Global, Link-Local, Loopback).' },
      { id: 'sc5', label: 'Saya memahami perbedaan mendasar antara IPv4 dan IPv6.' },
    ],
  },

  {
    type: 'authentic-assessment',
    title: 'Authentic Assessment',
    description:
      'Siswa merancang strategi implementasi IPv6 untuk jaringan sekolah dengan mempertimbangkan kompatibilitas perangkat lama dan kebutuhan transisi yang aman.',
    objectiveCode: 'X.IP.15',
    activityGuide: [
      'Analisis kondisi jaringan sekolah: 50% perangkat IPv4 lama, 50% perangkat baru IPv6-ready.',
      'Pilih metode transisi (Dual Stack, Tunneling, atau langsung IPv6) yang paling aman dan realistis.',
      'Jelaskan rencana implementasi bertahap dan ikuti cabang keputusan hingga solusi final.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: merencanakan migrasi IPv6 secara bertahap dan sistematis.',
      'Kemampuan Berargumen: membenarkan strategi transisi dengan pertimbangan teknis dan operasional.',
      'Penarikan Kesimpulan: menyeimbangkan kebutuhan masa depan dengan realitas infrastruktur yang ada.',
    ],
    facilitatorNotes: [
      'Guru memosisikan diri sebagai kepala IT sekolah yang meminta proposal implementasi IPv6.',
      'Guru mendorong siswa mempertimbangkan: waktu downtime, biaya, kompetensi staf, dan risiko operasional.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mengevaluasi keterkaitan TCP dan IP dalam arsitektur model TCP/IP saat proses komunikasi jaringan',
      condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang pada CONNETIC Module',
      degree: 'secara logis',
    },
    branchingScenario: {
      context:
        'Sekolahmu mendapat hibah bandwidth internet 1 Gbps murni IPv6 dari pemerintah. Kondisi infrastruktur: 15 PC Lab A menggunakan Windows 7 (IPv4 only), 15 PC Lab B menggunakan Windows 11 (IPv6-ready), 1 server e-learning (IPv6-ready), dan 1 router utama yang mendukung Dual Stack. Guru-guru mengeluh ingin semua bisa internetan tanpa gangguan.',
      initialQuestion:
        'Strategi pertama apa yang kamu rekomendasikan untuk diterapkan di Router utama agar semua perangkat — lama maupun baru — tetap bisa terhubung internet?',
      focusAreas: ['Dual Stack Router', 'Kompatibilitas PC Lama', 'Migrasi Bertahap'],
      choices: [
        {
          id: 'c1',
          text: 'Aktifkan Dual Stack di Router — router menangani IPv4 dan IPv6 sekaligus, PC lama pakai IPv4, PC baru pakai IPv6.',
          isOptimal: true,
          consequence:
            'Keputusan sangat tepat! PC Windows 11 langsung menikmati IPv6 penuh. PC Windows 7 tetap terhubung via IPv4. Server e-learning bisa diakses dari kedua jenis PC. Tidak ada downtime, tidak ada perangkat yang terputus.',
          followUpQuestion:
            'Ada website penting yang HANYA bisa diakses via IPv4, tapi ISP sekolah HANYA memberikan IPv6. Teknik apa yang bisa digunakan untuk menjembatani akses ini?',
          followUpChoices: [
            {
              id: 'f1a',
              text: 'NAT64 + DNS64 — router menerjemahkan request IPv6 ke IPv4 secara otomatis untuk website yang belum IPv6.',
              isCorrect: true,
              explanation:
                'Sangat profesional! NAT64/DNS64 adalah standar industri untuk menghubungkan jaringan IPv6-only ke resource IPv4 lama. Pengguna tidak perlu tahu perbedaannya — akses tetap mulus.',
            },
            {
              id: 'f1b',
              text: 'Meminta pemilik website tersebut segera upgrade server mereka ke IPv6.',
              isCorrect: false,
              explanation:
                'Ini bukan wewenangmu dan tidak menyelesaikan masalah akses segera. Ribuan website masih IPv4-only dan tidak bisa langsung diubah — solusi teknis di sisi jaringanmu yang diperlukan.',
            },
          ],
        },
        {
          id: 'c2',
          text: 'Matikan IPv4 sepenuhnya di router dan paksa semua perangkat pakai IPv6 mulai hari pertama.',
          isOptimal: false,
          consequence:
            'Semua PC Windows 7 di Lab A langsung kehilangan koneksi internet! Driver kartu jaringan Windows 7 tidak mendukung IPv6 penuh. Kelas menjadi kacau, guru-guru mengeluh, dan kepala sekolah memanggil kamu.',
          followUpQuestion:
            'Setelah terjadi kekacauan, apa langkah mitigasi tercepat yang bisa kamu lakukan?',
          followUpChoices: [
            {
              id: 'f2a',
              text: 'Aktifkan kembali IPv4 di router dan beralih ke strategi Dual Stack sambil merencanakan migrasi bertahap.',
              isCorrect: true,
              explanation:
                'Mengakui kesalahan dan kembali ke pendekatan yang lebih aman adalah sikap teknisi yang profesional. Dual Stack memungkinkan migrasi bertahap tanpa mengorbankan operasional sekolah.',
            },
            {
              id: 'f2b',
              text: 'Biarkan Lab A tanpa internet sambil mencari solusi — Lab B yang IPv6 bisa tetap dipakai.',
              isCorrect: false,
              explanation:
                'Membiarkan setengah lab tanpa internet tidak bisa diterima. Semua siswa berhak mendapat akses yang sama. Solusi harus mencakup SEMUA perangkat, bukan hanya sebagian.',
            },
          ],
        },
        {
          id: 'c3',
          text: 'Tunda semua perubahan sampai semua PC di sekolah diganti yang baru (IPv6-ready).',
          isOptimal: false,
          consequence:
            'Menunda bukan strategi teknis — ini penghindaran masalah. ISP sudah memberikan bandwidth IPv6, dan menolak menggunakannya berarti kehilangan manfaat teknologi yang sudah tersedia.',
          followUpQuestion:
            'Jika anggaran terbatas dan tidak bisa mengganti semua PC sekaligus, apa alternatif teknis yang tetap memungkinkan sekolah memanfaatkan IPv6 sambil PC lama masih digunakan?',
          followUpChoices: [
            {
              id: 'f3a',
              text: 'Terapkan Dual Stack di router — PC lama tetap pakai IPv4, PC baru menikmati IPv6, kedua jenis bisa bekerja bersamaan.',
              isCorrect: true,
              explanation:
                'Tepat! Dual Stack adalah solusi paling pragmatis: memanfaatkan IPv6 untuk perangkat baru sekarang, sambil memastikan perangkat lama tetap berfungsi. Penggantian PC bisa dilakukan bertahap sesuai anggaran.',
            },
            {
              id: 'f3b',
              text: 'Gunakan koneksi internet cadangan IPv4 untuk Lab A dan koneksi IPv6 untuk Lab B.',
              isCorrect: false,
              explanation:
                'Memelihara dua infrastruktur internet terpisah adalah pemborosan biaya dan kompleksitas. Dual Stack di satu router sudah cukup menangani kedua kebutuhan tanpa biaya tambahan.',
            },
          ],
        },
      ],
      finalEvaluation:
        'Tunjukkan bahwa kamu mampu menjaga stabilitas operasional sekolah sambil mengadopsi teknologi IPv6 secara bertahap dan terencana. Keputusan teknisi yang baik selalu mempertimbangkan dampak nyata terhadap pengguna, bukan hanya kecanggihan teknologi.',
    },
  },
];
