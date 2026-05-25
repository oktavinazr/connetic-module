import type { Stage } from './lessons';

export const lesson4Stages: Stage[] = [
  // ─── Tahap 1: Constructivism — X.IP.9 ───────────────────────────────────────
  {
    type: 'constructivism',
    title: 'Constructivism',
    description:
      'Siswa membangun pemahaman awal tentang keterbatasan IPv4 dan kebutuhan IPv6 melalui analogi pertumbuhan perangkat digital yang terus meningkat pesat.',
    objectiveCode: 'X.IP.9',
    activityGuide: [
      'Klik setiap infografis kronologis pertumbuhan IoT dan habisnya alamat IPv4 secara berurutan untuk memahami konteks krisis.',
      'Tulis argumen mengapa teknik NAT pada IPv4 tidak lagi ideal untuk masa depan jaringan yang terus berkembang.',
      'Susun perbandingan IPv4 vs IPv6 melalui aktivitas Analogy Sorting.',
      'Lengkapi Box Refleksi Standar untuk menyimpulkan mengapa migrasi ke IPv6 bersifat mutlak.',
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
        'Bagaimana dunia menyadari kebutuhan mendesak akan IPv6 dan mengapa transisi ini tidak bisa dihindari? Susun 6 potongan infografis kronologis berikut menjadi urutan yang logis.',
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
      'Teknik NAT (Network Address Translation) awalnya dirancang sebagai "solusi sementara" atas keterbatasan alamat IPv4 — satu IP publik digunakan bersama oleh banyak perangkat di jaringan lokal. Namun, mengapa teknik NAT ini tidak lagi ideal untuk masa depan jaringan yang semakin penuh dengan perangkat IoT, smart city, dan komunikasi end-to-end? Jelaskan kelemahan teknis NAT dan mengapa IPv6 memberikan solusi yang lebih fundamental!',
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
        courierAnalogy: 'Seperti memberikan alamat unik pada setiap butir pasir di seluruh pantai di dunia, masih tersisa cadangan yang hampir tidak terhitung.',
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
        text: 'IPv4 memerlukan NAT untuk mengatasi keterbatasan alamat — satu IP publik dipakai bersama banyak perangkat lokal.',
        courierAnalogy: 'Seperti apartemen dengan satu alamat gedung tapi ratusan kamar di dalamnya — hanya gedung yang punya alamat publik, isi tidak dikenal dari luar.',
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
      'Berdasarkan perbandingan IPv4 dan IPv6 yang baru saja kamu susun, jelaskan apa keuntungan terbesar dari beralih ke IPv6 selain sekadar jumlah alamat yang lebih banyak! Pertimbangkan aspek keamanan (IPsec), efisiensi header, dan kemampuan end-to-end connectivity.',
    conclusionPrompt: 'Berdasarkan aktivitas infografis kronologis dan Analogy Sorting tentang keterbatasan IPv4 & kebutuhan IPv6 yang telah kamu lakukan, jelaskan bagaimana kamu mampu menjelaskan konsep dasar IPv6 sebagai solusi keterbatasan ruang alamat IPv4. Mengapa migrasi ke struktur bit IPv6 bersifat mutlak? Tuliskan dengan tepat menggunakan kata-katamu sendiri.',
  },

  // ─── Tahap 2: Inquiry — X.IP.10 ─────────────────────────────────────────────
  {
    type: 'inquiry',
    title: 'Inquiry',
    description:
      'Siswa mengeksplorasi format penulisan IPv6 dan secara mandiri mengurutkan 6 langkah standar EUI-64 untuk membentuk IPv6 Link Local Address dari MAC Address.',
    objectiveCode: 'X.IP.10',
    activityGuide: [
      'Pelajari format 128-bit IPv6 dan jenis-jenis alamatnya melalui panel eksplorasi.',
      'Urutkan 6 langkah proses EUI-64 (MAC → split → sisipkan FF:FE → format 64-bit → flip bit ke-7 → tambah prefix fe80::) secara tepat.',
      'Jelaskan mengapa bit ke-7 pada oktet pertama harus dibalik berdasarkan standar IEEE.',
      'Tulis hasil akhir IPv6 Link-Local Address yang terbentuk dari proses EUI-64.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengurutkan 6 langkah EUI-64 dari MAC Address hingga IPv6 Link-Local Address secara tepat.',
      'Kemampuan Berargumen: menjelaskan alasan teknis mengapa bit ke-7 harus dibalik sesuai standar IEEE 802.',
      'Penarikan Kesimpulan: mengetikkan hasil akhir IPv6 Link-Local Address yang terbentuk dari proses EUI-64.',
    ],
    facilitatorNotes: [
      'Guru menekankan bahwa "FF:FE" adalah penanda standar IEEE untuk membedakan EUI-64 yang diturunkan dari EUI-48 (MAC).',
      'Guru mendemonstrasikan "flip bit ke-7" dalam EUI-64: AA (10101010) → A8 (10101000) — bit ke-7 dihitung dari kiri = bit ke-2 dari kanan pada oktet pertama.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menerapkan tahapan standar EUI-64 untuk membentuk IPv6 Link Local Address dari alamat MAC secara berurutan',
      condition: 'melalui aktivitas inquiry berupa eksplorasi materi dan rangkai alur pada CONNETIC Module',
      degree: 'secara runtut',
    },
    material: {
      title: 'Format IPv6 dan Proses EUI-64',
      content: [
        'IPv6 menggunakan 128-bit yang ditulis dalam 8 kelompok (blok) heksadesimal 16-bit, dipisahkan tanda titik dua. Contoh lengkap: 2001:0db8:85a3:0000:0000:8a2e:0370:7334.',
        'Link Local Address (fe80::/10) adalah alamat IPv6 yang otomatis dibuat perangkat untuk berkomunikasi dalam satu jaringan lokal. Pembentukannya menggunakan standar EUI-64 dari MAC Address 48-bit.',
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
        title: 'Format Heksadesimal 128-bit IPv6',
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
          '2001:0db8:0000:0000:0000:0000:0000:0001 → Setelah hapus leading zeros: 2001:db8:0:0:0:0:0:1.',
      },
      {
        id: 'e3',
        title: 'Aturan Kompresi 2: Double Colon (::)',
        content:
          'SATU kelompok berurutan dari blok "0" bisa disingkat menjadi "::". PERINGATAN KRITIS: "::" hanya boleh muncul SATU KALI dalam satu alamat IPv6! Jika muncul dua kali, alamat menjadi ambigu dan tidak valid.',
        example:
          '2001:db8:0:0:0:0:0:1 → Gunakan "::" untuk 5 blok nol berurutan: 2001:db8::1. SALAH: 2001::db8::1 (dua "::" tidak diizinkan).',
      },
      {
        id: 'e4',
        title: 'Proses EUI-64: MAC Address → IPv6 Link-Local',
        content:
          'EUI-64 (Extended Unique Identifier 64-bit) adalah standar IEEE untuk menghasilkan Interface ID 64-bit dari MAC Address 48-bit. Langkah-langkahnya: (1) Ambil MAC 48-bit, (2) Pisah dua bagian 24-bit, (3) Sisipkan FF:FE di tengah, (4) Format sebagai 64-bit hex, (5) Flip bit ke-7 oktet pertama, (6) Gabungkan dengan prefix fe80::.',
        example:
          'MAC: AA:BB:CC:DD:EE:FF → Split: [AA:BB:CC] & [DD:EE:FF] → Sisip FF:FE: AA:BB:CC:FF:FE:DD:EE:FF → Format 64-bit: AABB:CCFF:FEDD:EEFF → Flip bit ke-7: A8BB:CCFF:FEDD:EEFF → Link-Local: fe80::A8BB:CCFF:FEDD:EEFF.',
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
      'Urutkan 6 langkah proses pembentukan IPv6 Link Local Address dari MAC Address menggunakan standar EUI-64 berikut — dari langkah awal hingga hasil akhir yang benar.',
    flowItems: [
      {
        id: 'fl1',
        text: 'Ambil MAC Address 48-bit perangkat (contoh: AA:BB:CC:DD:EE:FF)',
        correctOrder: 1,
        description: 'Titik awal: MAC Address adalah identitas hardware 48-bit yang akan dikonversi menjadi Interface ID IPv6.',
        colorClass: 'purple',
      },
      {
        id: 'fl2',
        text: 'Pisahkan MAC Address menjadi dua bagian 24-bit: OUI (AA:BB:CC) dan NIC ID (DD:EE:FF)',
        correctOrder: 2,
        description: 'MAC Address dipecah persis di tengah — 3 oktet pertama (OUI/vendor) dan 3 oktet terakhir (nomor seri perangkat).',
        colorClass: 'blue',
      },
      {
        id: 'fl3',
        text: 'Sisipkan "FF:FE" di antara OUI dan NIC ID → AA:BB:CC:FF:FE:DD:EE:FF',
        correctOrder: 3,
        description: '"FF:FE" adalah penanda standar IEEE 802 bahwa Interface ID ini berasal dari EUI-48 (MAC Address 48-bit), bukan EUI-64 asli.',
        colorClass: 'green',
      },
      {
        id: 'fl4',
        text: 'Tulis ulang dalam format blok IPv6 64-bit heksadesimal: AABB:CCFF:FEDD:EEFF',
        correctOrder: 4,
        description: 'Kelompokkan 8 oktet EUI-64 menjadi 4 blok 16-bit sesuai format IPv6 — siap menjadi Interface ID 64-bit.',
        colorClass: 'amber',
      },
      {
        id: 'fl5',
        text: 'Balik (flip) bit ke-7 dari oktet pertama: AA (10101010) → A8 (10101000)',
        correctOrder: 5,
        description: 'Bit ke-7 disebut Universal/Local (U/L) bit. Membaliknya dari 1 ke 0 menandai bahwa alamat ini locally administered — dibentuk secara lokal, bukan dari registry global.',
        colorClass: 'pink',
      },
      {
        id: 'fl6',
        text: 'Gabungkan dengan prefix fe80::/10 → IPv6 Link-Local: fe80::A8BB:CCFF:FEDD:EEFF',
        correctOrder: 6,
        description: 'IPv6 Link-Local selalu diawali prefix fe80::/10. Interface ID hasil EUI-64 melengkapi sisa 64-bit untuk membentuk alamat 128-bit.',
        colorClass: 'indigo',
      },
    ],
    inquiryReflection1:
      'Pada langkah ke-5 proses EUI-64, bit ke-7 dari oktet pertama MAC Address harus dibalik (flip). Mengapa IEEE mewajibkan pembalikan bit ini? Apa makna teknis dari bit ke-7 (disebut Universal/Local bit) dan apa yang terjadi jika bit ini TIDAK dibalik?',
    matchingPairs: [
      { left: '2001::/3', right: 'Global Unicast — alamat untuk komunikasi internet publik.' },
      { left: 'fe80::/10', right: 'Link-Local — hanya berlaku dalam satu jaringan lokal langsung.' },
      { left: 'fc00::/7', right: 'Unique Local — seperti Private IP, untuk jaringan internal.' },
      { left: 'ff00::/8', right: 'Multicast — untuk mengirim ke sekelompok perangkat sekaligus.' },
      { left: '::1', right: 'Loopback — untuk testing komunikasi dengan dirinya sendiri.' },
    ],
    inquiryReflection2:
      'Setelah memahami proses EUI-64, jelaskan mengapa IPv6 tidak memerlukan NAT (Network Address Translation) seperti IPv4! Bagaimana kemampuan setiap perangkat memiliki IP publik unik berdampak pada koneksi perangkat IoT di masa depan?',
    conclusionPrompt: 'Berdasarkan eksplorasi materi IPv6 dan aktivitas mengurutkan 6 langkah EUI-64 yang telah kamu lakukan, jelaskan bagaimana kamu mampu menerapkan tahapan standar EUI-64 untuk membentuk IPv6 Link Local Address dari alamat MAC secara berurutan. Tuliskan juga hasil akhir IPv6 Link-Local Address dari MAC AA:BB:CC:DD:EE:FF menggunakan proses EUI-64. Jawab secara runtut dengan kata-katamu sendiri.',
  },

  // ─── Tahap 3: Questioning — X.IP.11 ─────────────────────────────────────────
  {
    type: 'questioning',
    title: 'Questioning',
    description:
      'Siswa menganalisis aturan penyederhanaan IPv6 melalui interaksi tanya jawab dua arah, menerapkan hierarki aturan kompresi dengan benar, dan mengidentifikasi alamat jebakan dengan double "::".',
    objectiveCode: 'X.IP.11',
    activityGuide: [
      'Pelajari aturan kompresi IPv6 melalui tanya jawab dengan Virtual Assistant.',
      'Terapkan hierarki aturan: hapus leading zeros dulu sebelum menerapkan "::".',
      'Identifikasi dan berikan sanggahan terhadap alamat IPv6 jebakan yang menggunakan double "::".',
      'Tuliskan bentuk paling sederhana yang valid dari alamat IPv6 yang diberikan.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: menerapkan hierarki aturan kompresi (hapus leading zeros terlebih dahulu, baru terapkan ::) secara berurutan.',
      'Kemampuan Berargumen: memberikan sanggahan teknis ketika disajikan alamat IPv6 jebakan dengan double "::".',
      'Penarikan Kesimpulan: menuliskan bentuk paling sederhana dan valid dari alamat IPv6 yang diberikan.',
    ],
    facilitatorNotes: [
      'Guru menekankan hierarki aturan: WAJIB hapus leading zeros dulu di setiap blok, BARU kemudian terapkan "::" untuk blok nol berurutan.',
      'Guru mendorong siswa menemukan sendiri contoh alamat tidak valid dengan double "::" sebelum Virtual Assistant mengonfirmasi.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menerapkan aturan penyederhanaan IPv6 (leading zeros dan double colon) pada skenario yang diberikan',
      condition: 'melalui aktivitas questioning berupa tanya jawab dua arah dengan Virtual Assistant pada CONNETIC Module',
      degree: 'secara tepat',
    },
    problemVisual: {
      icon: '?',
      title: 'Aturan Kompresi IPv6 yang Membingungkan',
      description:
        'Ada dua aturan kompresi IPv6 — namun banyak siswa salah menerapkan urutannya atau menggunakan "::" lebih dari sekali. Mana yang benar?',
      problemType: 'delay',
    },
    teacherQuestion:
      'Diberikan alamat IPv6 penuh: 2001:0DB8:0000:0000:0000:0000:0000:0001 — berapa banyak cara kompresi yang valid untuk alamat ini, dan mana yang PALING SINGKAT?',
    scenario:
      'Seorang siswa bernama Rudi ingin menyingkat alamat IPv6 berikut: 2001:0DB8:0000:0000:0034:0000:0000:0001. Rudi langsung menggunakan "::" di dua tempat sekaligus dan menghasilkan: 2001:DB8::34::1. Guru mengatakan hasil Rudi SALAH. Temukan apa yang salah dan tentukan bentuk paling singkat yang benar!',
    whyQuestion:
      'Mengapa aturan "::" (double colon) HANYA boleh digunakan SATU KALI dalam satu alamat IPv6, dan apa yang terjadi jika digunakan dua kali seperti yang dilakukan Rudi?',
    hint:
      'Pikirkan: jika ada dua "::" dalam satu alamat, bagaimana router akan tahu berapa blok nol yang diwakili oleh masing-masing "::"? Total blok yang ada harus selalu 8.',
    reasonOptions: [
      {
        id: 'r1',
        text: 'Karena "::" mewakili satu kelompok nol berurutan yang jumlahnya tidak tentu — jika ada dua "::", router tidak bisa menghitung dengan pasti berapa blok nol total yang dihilangkan.',
        isCorrect: true,
        feedback:
          'Tepat! Jika "2001::34::1" digunakan, apakah "::" pertama mewakili 2 blok atau 3 blok nol? Tidak ada cara untuk menentukan ini secara algoritmik. Itulah mengapa standar RFC 5952 melarang keras penggunaan "::" lebih dari sekali. Bentuk paling singkat yang benar untuk alamat Rudi adalah: 2001:db8:0:0:34::1',
      },
      {
        id: 'r2',
        text: 'Karena "::" adalah simbol spesial yang hanya boleh muncul di awal atau akhir alamat saja, bukan di tengah-tengah alamat IPv6.',
        isCorrect: false,
        feedback:
          'Kurang tepat. "::" boleh muncul di mana saja dalam alamat — di awal (::1 = loopback), di tengah (2001:db8::1), atau di akhir (fe80::). Yang dilarang adalah kemunculannya LEBIH DARI SATU KALI dalam satu alamat.',
      },
      {
        id: 'r3',
        text: 'Karena aturan "::" hanya berlaku untuk blok nol yang berjumlah minimal 4 blok berurutan — jika hanya 2-3 blok nol, tidak boleh menggunakan "::".',
        isCorrect: false,
        feedback:
          'Tidak benar. "::" bisa digunakan untuk menggantikan berapa pun blok nol berurutan — bahkan satu blok nol "0" yang berdiri sendiri pun bisa diganti "::" (meskipun tidak efisien). Tidak ada batasan jumlah minimum blok.',
      },
      {
        id: 'r4',
        text: 'Karena aturan "::" adalah opsional dan tidak wajib digunakan — cukup hapus leading zeros saja untuk menyingkat IPv6.',
        isCorrect: false,
        feedback:
          'Penggunaan "::" memang opsional, tapi pernyataan ini tidak menjawab MENGAPA "::" tidak boleh dua kali. Jika hanya menghapus leading zeros tanpa "::", alamat 2001:db8:0:0:34:0:0:1 sudah lebih pendek tapi bukan yang paling singkat.',
      },
    ],
    questionBank: [
      {
        id: 'q1',
        text: 'Apa aturan pertama yang HARUS dilakukan sebelum menerapkan "::"?',
        response:
          'Aturan pertama yang WAJIB dilakukan terlebih dahulu adalah menghapus leading zeros dari setiap blok. Contoh: "0DB8" → "DB8", "0034" → "34", "0000" → "0". Setelah semua blok sudah bersih dari leading zeros, baru identifikasi kelompok blok nol terpanjang untuk diterapkan "::".',
      },
      {
        id: 'q2',
        text: 'Jika ada dua kelompok blok nol dengan panjang yang SAMA, kelompok mana yang dipilih untuk "::"?',
        response:
          'Berdasarkan RFC 5952 (standar penulisan IPv6), jika ada dua kelompok blok nol dengan panjang sama, pilih kelompok yang pertama (paling di kiri). Contoh: 2001:db8:0:0:1234:0:0:1 — ada dua kelompok "0:0" yang sama panjang, pilih yang pertama → 2001:db8::1234:0:0:1.',
      },
      {
        id: 'q3',
        text: 'Berapa blok nol yang diwakili oleh "::" dalam alamat fe80::1?',
        response:
          'Total blok dalam IPv6 harus selalu 8. Dalam "fe80::1", kita punya 2 blok yang dituliskan (fe80 dan 1). Jadi "::" mewakili 8 - 2 = 6 blok nol. Bentuk lengkap: fe80:0000:0000:0000:0000:0000:0000:0001.',
      },
    ],
    conclusionPrompt: 'Berdasarkan tanya jawab tentang aturan kompresi IPv6 yang telah kamu lakukan, jelaskan bagaimana kamu mampu menerapkan aturan penyederhanaan IPv6 secara tepat. Sertakan juga bentuk paling singkat dari alamat 2001:0DB8:0000:0000:0034:0000:0000:0001 beserta langkah-langkah singkatnya. Tuliskan dengan kata-katamu sendiri.',
  },

  // ─── Tahap 4: Learning Community — X.IP.12 ──────────────────────────────────
  {
    type: 'learning-community',
    title: 'Learning Community',
    description:
      'Siswa menganalisis dan mengaudit kartu hasil kerja rekan sejawat fiktif yang mengandung error konseptual pada proses EUI-64, menentukan letak kesalahan spesifik, dan memberikan koreksi objektif.',
    objectiveCode: 'X.IP.12',
    activityGuide: [
      'Baca kartu hasil kerja Rekan A — audit baris demi baris proses EUI-64 untuk menemukan letak error.',
      'Tandai langkah spesifik yang salah dan tulis komentar koreksi yang objektif dan teknis.',
      'Baca kartu hasil kerja Rekan B — lakukan audit yang sama.',
      'Tentukan keputusan akhir (Approved / Rejected) untuk setiap kartu beserta intisari temuanmu.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengaudit baris demi baris setiap langkah EUI-64 untuk menemukan letak spesifik error konversi.',
      'Kemampuan Berargumen: menulis komentar sanggahan dan koreksi yang objektif berdasarkan pemahaman teknis EUI-64.',
      'Penarikan Kesimpulan: menentukan keputusan Approved/Rejected beserta intisari audit yang tepat.',
    ],
    facilitatorNotes: [
      'Guru mengarahkan siswa untuk menelusuri setiap langkah EUI-64 secara sistematis, bukan langsung menebak hasilnya salah.',
      'Guru mendorong siswa menuliskan koreksi dengan bahasa teknis yang spesifik, bukan sekadar "salah" tanpa penjelasan.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menganalisis setiap langkah proses EUI-64 untuk menentukan kebenaran hasil konversi alamat MAC menjadi IPv6 Link Local Address',
      condition: 'melalui aktivitas learning community berupa papan peer-review studi kasus pada CONNETIC Module',
      degree: 'secara logis',
    },
    layers5: [
      { id: 'L5', name: 'Application', pdu: 'Data', color: '#8B5CF6', desc: 'Aplikasi menggunakan IPv6 Link-Local untuk auto-discovery perangkat dalam LAN.' },
      { id: 'L4', name: 'Transport', pdu: 'Segment', color: '#628ECB', desc: 'TCP/UDP menggunakan IPv6 sebagai alamat sumber dan tujuan di header.' },
      { id: 'L3', name: 'Network (IPv6)', pdu: 'Packet', color: '#10B981', desc: 'IPv6 Link-Local (EUI-64) mengidentifikasi perangkat dalam satu segmen LAN.' },
      { id: 'L2', name: 'Data Link', pdu: 'Frame', color: '#F59E0B', desc: 'MAC Address 48-bit di layer ini menjadi bahan baku proses EUI-64.' },
      { id: 'L1', name: 'Physical', pdu: 'Bits', color: '#395886', desc: 'Kabel atau sinyal wireless membawa frame yang berisi alamat IPv6 EUI-64.' },
    ],
    encapsulationCase: {
      id: 'X.IPv6.LC.A',
      title: 'Kartu Peer Review A — Hasil Kerja Siti (Error pada Langkah ke-5)',
      concept:
        'Audit proses EUI-64 Siti: MAC Address DD:33:44:55:66:77 harus dikonversi menjadi IPv6 Link-Local. Temukan di langkah mana Siti melakukan kesalahan.',
      scenario:
        'Siti mengumpulkan hasil kerja konversi EUI-64 berikut: MAC: DD:33:44:55:66:77 → Split: [DD:33:44] & [55:66:77] → Sisip FF:FE: DD:33:44:FF:FE:55:66:77 → Format 64-bit: DD33:44FF:FE55:6677 → LANGSUNG gabung dengan prefix → Link-Local: fe80::DD33:44FF:FE55:6677. Apakah hasil Siti benar?',
      question:
        'Di langkah mana Siti melakukan kesalahan dalam proses EUI-64, dan apa dampak teknis dari kesalahan tersebut?',
      options: [
        {
          id: 'A',
          text: 'Siti melewati langkah flip bit ke-7 (Universal/Local bit). Seharusnya: DD (11011101) dibalik bit ke-7 → DF (11011111), sehingga Interface ID yang benar adalah DF33:44FF:FE55:6677.',
          logic: 'Tepat! Siti melewati langkah ke-5: flip bit ke-7 oktet pertama. DD dalam biner adalah 11011101 — bit ke-7 (dari kiri) adalah 1, dibalik menjadi 0 → hasilnya DF = 11011111. Link-Local yang benar: fe80::DF33:44FF:FE55:6677. Tanpa flip, alamat yang dihasilkan tidak sesuai standar IEEE EUI-64.',
        },
        {
          id: 'B',
          text: 'Siti salah memisahkan MAC Address — seharusnya dipotong 2 oktet bukan 3 oktet per bagian.',
          logic: 'Tidak tepat. Pemisahan MAC Address pada EUI-64 selalu di tengah: 3 oktet pertama (OUI) dan 3 oktet terakhir (NIC ID). Siti memisahkan dengan benar [DD:33:44] & [55:66:77].',
        },
        {
          id: 'C',
          text: 'Siti menggunakan FF:FE sebagai penanda sisipan, padahal seharusnya menggunakan FE:FF.',
          logic: 'Tidak tepat. Berdasarkan standar IEEE 802 dan RFC 2373, penanda yang disisipkan adalah "FF:FE" (bukan "FE:FF"). Siti menggunakan "FF:FE" dengan benar.',
        },
      ],
    },
    decapsulationCase: {
      id: 'X.IPv6.LC.B',
      title: 'Kartu Peer Review B — Hasil Kerja Budi (Error pada Posisi Sisipan)',
      concept:
        'Audit proses EUI-64 Budi: MAC Address 00:1A:2B:3C:4D:5E harus dikonversi menjadi IPv6 Link-Local. Temukan di mana Budi membuat kesalahan posisi sisipan.',
      scenario:
        'Budi mengumpulkan hasil kerja berikut: MAC: 00:1A:2B:3C:4D:5E → Split: [00:1A:2B] & [3C:4D:5E] → Budi menyisipkan FF:FE di AKHIR: 00:1A:2B:3C:4D:5E:FF:FE → Format 64-bit: 001A:2B3C:4D5E:FFFE → Flip bit ke-7 oktet pertama: 02 (00→02 flip) → Link-Local: fe80::021A:2B3C:4D5E:FFFE. Apakah proses Budi benar?',
      question:
        'Apa yang salah dari cara Budi menyisipkan "FF:FE" dalam proses EUI-64, dan bagaimana seharusnya posisi yang benar?',
      options: [
        {
          id: 'A',
          text: 'Budi sudah benar — FF:FE boleh disisipkan di mana saja, termasuk di akhir, selama total oktetnya menjadi 8.',
          logic: 'Salah. Posisi "FF:FE" dalam EUI-64 sudah ditentukan standar — wajib disisipkan DI ANTARA OUI dan NIC ID, bukan di akhir atau tempat lain. Posisi yang spesifik ini penting agar alat dan router dapat mengidentifikasi bahwa Interface ID ini berasal dari EUI-48.',
        },
        {
          id: 'B',
          text: 'Budi menyisipkan FF:FE di posisi yang salah — seharusnya disisipkan DI ANTARA OUI (3 oktet pertama) dan NIC ID (3 oktet terakhir), bukan di akhir.',
          logic: 'Tepat! Standar EUI-64 mengharuskan "FF:FE" disisipkan DI TENGAH — persis antara OUI dan NIC ID. Untuk MAC 00:1A:2B:3C:4D:5E, hasil yang benar setelah sisipan adalah: 00:1A:2B:FF:FE:3C:4D:5E → Format 64-bit: 001A:2BFF:FE3C:4D5E → Flip bit ke-7: 021A:2BFF:FE3C:4D5E → Link-Local: fe80::021A:2BFF:FE3C:4D5E.',
        },
        {
          id: 'C',
          text: 'Budi tidak perlu menyisipkan apa pun — cukup tambah 2 oktet 00:00 di akhir MAC untuk menghasilkan EUI-64 64-bit.',
          logic: 'Salah. Standar EUI-64 menggunakan "FF:FE" — bukan "00:00" — sebagai penanda khusus. Penggunaan "FF:FE" secara spesifik menandai bahwa Interface ID ini diturunkan dari MAC 48-bit (EUI-48), sehingga router dapat mengidentifikasinya secara otomatis.',
        },
      ],
    },
    groupActivity: {
      groupNames: ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'],
      discussionPrompt:
        'Diskusikan: Dari kedua kartu peer review yang baru saja diaudit, kesalahan mana yang lebih berbahaya — lupa flip bit ke-7 atau salah posisi sisipan FF:FE? Jelaskan konsekuensi teknis dari masing-masing kesalahan, dan berikan keputusan akhir Approved/Rejected beserta intisari audit untuk setiap kartu.',
    },
    conclusionPrompt: 'Berdasarkan aktivitas peer-review audit proses EUI-64 yang telah kamu lakukan, jelaskan bagaimana kamu mampu menganalisis setiap langkah proses EUI-64 untuk menentukan kebenaran hasil konversi alamat MAC menjadi IPv6 Link Local Address. Sertakan keputusan Approved/Rejected untuk kartu A dan kartu B beserta alasan teknisnya. Tuliskan secara logis dengan kata-katamu sendiri.',
  },

  // ─── Tahap 5: Modeling — X.IP.13 ────────────────────────────────────────────
  {
    type: 'modeling',
    title: 'Modeling — Simulasi Konfigurasi IPv6 Gateway pada Router',
    description:
      'Siswa mempraktikkan simulasi perencanaan pengalamatan IPv6 Global Unicast pada interface router melalui rangkaian perintah CLI yang terstruktur, dari conf t hingga verifikasi ping.',
    objectiveCode: 'X.IP.13',
    activityGuide: [
      'Ikuti perintah CLI router secara berurutan: enable → conf t → int → ipv6 address → no shutdown.',
      'Jawab pertanyaan mengapa prefix /64 dipilih untuk segmen LAN pada router IPv6.',
      'Jalankan "Run Ping Test" dan evaluasi status keterhubungan perangkat setelah konfigurasi.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengeksekusi perintah CLI secara terstruktur mengikuti hierarki konfigurasi router (conf t → int → ipv6 address → no shutdown).',
      'Kemampuan Berargumen: menjelaskan alasan logis pemilihan alokasi prefix /64 dibandingkan prefix lainnya pada segmen LAN router.',
      'Penarikan Kesimpulan: mengevaluasi status keterhubungan perangkat setelah tombol "Run Ping Test" dieksekusi.',
    ],
    facilitatorNotes: [
      'Guru menjelaskan hierarki perintah Cisco IOS: EXEC mode → Privileged EXEC → Global Config → Interface Config.',
      'Guru mendorong siswa memahami mengapa "no shutdown" wajib dieksekusi — interface router defaultnya dalam kondisi "administratively down".',
      'Guru mendiskusikan mengapa /64 adalah standar de facto untuk segmen LAN IPv6 — berkaitan dengan EUI-64 yang membutuhkan tepat 64-bit untuk Interface ID.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mensimulasikan proses perencanaan pengalamatan IPv6 Gateway (Global Unicast) pada interface router',
      condition: 'melalui aktivitas modeling berupa simulasi CLI router step-by-step pada CONNETIC Module',
      degree: 'secara sistematis',
    },
    practiceInstructions: {
      forTeacher: [
        'Tampilkan topologi: Router (R1) terhubung ke Switch, 3 PC client dalam satu LAN segment.',
        'Demonstrasikan urutan CLI: enable → configure terminal → interface GigabitEthernet0/0 → ipv6 address 2001:db8:1::1/64 → no shutdown → exit → show ipv6 interface brief.',
        'Jelaskan output "show ipv6 interface brief": interface UP/UP, alamat IPv6 tertera, status "FE80" (Link-Local) otomatis terbentuk.',
        'Jalankan simulasi ping: ping ipv6 2001:db8:1::10 untuk verifikasi koneksi ke PC client.',
      ],
      forStudent: [
        'Ikuti setiap langkah CLI secara berurutan sesuai panduan yang ditampilkan.',
        'Klik "Jalankan" setelah setiap perintah untuk melihat respons simulator.',
        'Setelah semua langkah selesai, klik "Run Ping Test" untuk mengevaluasi hasil konfigurasi.',
      ],
    },
    modelingSteps: [
      {
        id: 'v6m1',
        type: 'example',
        title: 'Langkah 1: Masuk Privileged EXEC Mode',
        content:
          'Dari prompt "Router>", ketikkan perintah "enable" untuk masuk ke mode Privileged EXEC (ditandai prompt "Router#"). Mode ini diperlukan untuk mengakses konfigurasi global. Tanpa ini, kamu tidak bisa mengubah konfigurasi apapun di router.\n\n🖥️ Simulator CLI:\nRouter> enable\nRouter#',
        interactiveAction: 'Klik "Jalankan enable" — amati prompt berubah dari ">" menjadi "#", tanda kamu masuk Privileged EXEC Mode.',
      },
      {
        id: 'v6m2',
        type: 'example',
        title: 'Langkah 2: Masuk Global Configuration Mode',
        content:
          'Dari "Router#", ketikkan "configure terminal" (disingkat "conf t") untuk masuk ke Global Configuration Mode (prompt: "Router(config)#"). Di sinilah semua perubahan konfigurasi global diterapkan, termasuk pengaktifan IPv6 routing.\n\n🖥️ Simulator CLI:\nRouter# configure terminal\nRouter(config)# ipv6 unicast-routing',
        interactiveAction: 'Klik "Jalankan conf t" — aktifkan IPv6 unicast routing agar router bisa mem-forward paket IPv6.',
      },
      {
        id: 'v6m3',
        type: 'example',
        title: 'Langkah 3: Masuk Interface Configuration Mode',
        content:
          'Dari "Router(config)#", ketikkan "interface GigabitEthernet0/0" (disingkat "int g0/0") untuk masuk konfigurasi interface spesifik (prompt: "Router(config-if)#"). Interface ini yang akan terhubung ke LAN dan berfungsi sebagai Default Gateway IPv6.\n\n🖥️ Simulator CLI:\nRouter(config)# interface GigabitEthernet0/0\nRouter(config-if)#',
        interactiveAction: 'Klik "Masuk Interface G0/0" — amati perubahan prompt ke (config-if) yang menandai kamu berada di konteks interface.',
      },
      {
        id: 'v6m4',
        type: 'practice',
        title: 'Langkah 4: Assign Alamat IPv6 Global Unicast /64',
        content:
          'Ketikkan "ipv6 address 2001:db8:1::1/64" untuk menetapkan alamat IPv6 Global Unicast pada interface. Prefix /64 dipilih karena ini adalah standar de facto untuk segmen LAN IPv6 — prefix /64 menyediakan tepat 64-bit untuk Interface ID yang dibutuhkan mekanisme EUI-64 dan SLAAC.\n\n🖥️ Simulator CLI:\nRouter(config-if)# ipv6 address 2001:db8:1::1/64\nRouter(config-if)# [Alamat berhasil dikonfigurasi]',
        interactiveAction: 'Klik "Assign IPv6 Address" — verifikasi bahwa alamat 2001:db8:1::1/64 berhasil diterapkan pada interface.',
      },
      {
        id: 'v6m5',
        type: 'practice',
        title: 'Langkah 5: Aktifkan Interface dengan "no shutdown"',
        content:
          'Interface router secara default dalam kondisi "administratively down" untuk alasan keamanan. Ketikkan "no shutdown" untuk mengaktifkannya. Setelah perintah ini, interface berubah status menjadi "up/up" dan siap memproses paket IPv6.\n\n🖥️ Simulator CLI:\nRouter(config-if)# no shutdown\n%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to up',
        interactiveAction: 'Klik "no shutdown" — amati pesan sistem yang mengonfirmasi interface berubah ke status "up". Ini tanda konfigurasi IPv6 berhasil!',
      },
    ],
    conclusionPrompt: 'Berdasarkan simulasi konfigurasi IPv6 Gateway pada router yang telah kamu praktikkan, jelaskan bagaimana kamu mampu mensimulasikan proses perencanaan pengalamatan IPv6 Gateway (Global Unicast) pada interface router. Sertakan urutan perintah CLI yang benar dan jelaskan mengapa prefix /64 adalah standar untuk segmen LAN IPv6. Tuliskan secara sistematis dengan kata-katamu sendiri.',
  },

  // ─── Tahap 6: Reflection — X.IP.14 ──────────────────────────────────────────
  {
    type: 'reflection',
    title: 'Reflection',
    description:
      'Siswa menyusun matriks sintesis perbandingan IPv4 vs IPv6 secara menyeluruh, memilih strategi transisi yang tepat (Dual-Stack vs Tunneling), dan merumuskan satu kalimat sintesis final tentang masa depan arsitektur jaringan.',
    objectiveCode: 'X.IP.14',
    activityGuide: [
      'Lengkapi peta konsep perbandingan IPv4 vs IPv6 menggunakan label koneksi yang tepat dari dropdown.',
      'Kelompokkan fitur-fitur dari layer header (terbawah) hingga layer aplikasi menggunakan urutan yang terstruktur.',
      'Pilih argumen strategi transisi (Dual-Stack vs Tunneling) yang tepat untuk skenario perusahaan modern.',
      'Tulis 1 kalimat sintesis final tentang masa depan arsitektur jaringan global.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengelompokkan komparasi fitur IPv4/IPv6 dari layer header (terbawah) ke layer aplikasi menggunakan dropdown terstruktur.',
      'Kemampuan Berargumen: memilih argumen risiko transisi (Dual-Stack vs Tunneling) yang tepat untuk skenario perusahaan modern.',
      'Penarikan Kesimpulan: menyusun 1 kalimat sintesis final tentang masa depan arsitektur jaringan global.',
    ],
    facilitatorNotes: [
      'Guru mendorong siswa merefleksikan perjalanan belajar selama 4 pertemuan: dari TCP → IP → IPv4/IPv6.',
      'Guru mengajak siswa membandingkan Dual-Stack dan Tunneling dari perspektif risiko operasional perusahaan besar.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menyimpulkan perbedaan karakteristik antara pengalamatan IPv4 dan IPv6 serta kesesuaian penggunaannya dalam konteks jaringan modern',
      condition: 'melalui aktivitas reflection berupa konstruksi matriks sintesis dan peta konsep pada CONNETIC Module',
      degree: 'secara tepat',
    },
    conceptMapNodes: [
      { id: 'cn1', label: 'IPv6', description: 'Protokol pengalamatan 128-bit generasi berikutnya.', colorClass: 'blue' },
      { id: 'cn2', label: 'Format Heksadesimal', description: '8 blok 16-bit dipisahkan titik dua.', colorClass: 'purple' },
      { id: 'cn3', label: 'Kompresi "::"', description: 'Menyingkat blok nol berurutan menjadi :: (hanya sekali).', colorClass: 'green' },
      { id: 'cn4', label: 'Link Local (fe80::)', description: 'Dibentuk otomatis menggunakan EUI-64 dari MAC Address.', colorClass: 'amber' },
      { id: 'cn5', label: 'EUI-64', description: 'Standar pembentukan Interface ID 64-bit dari MAC Address 48-bit.', colorClass: 'pink' },
      { id: 'cn6', label: 'Dual Stack', description: 'Metode transisi menjalankan IPv4 dan IPv6 bersamaan — migrasi bertahap.', colorClass: 'indigo' },
      { id: 'cn7', label: 'IPv4', description: 'Protokol 32-bit yang sedang digantikan — membutuhkan NAT.', colorClass: 'amber' },
      { id: 'cn8', label: 'IPsec Built-in', description: 'Keamanan enkripsi terintegrasi sebagai fitur wajib IPv6.', colorClass: 'purple' },
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
        'Bandingkan secara sistematis IPv4 dan IPv6 dalam format matriks perbandingan: mulai dari panjang bit header (layer terbawah), format penulisan, mekanisme pengalamatan (NAT vs langsung), dukungan keamanan (IPsec), hingga strategi transisi (Dual-Stack vs Tunneling). Untuk perusahaan besar yang ingin mempertahankan layanan 24/7 tanpa downtime, mana yang lebih aman diterapkan: Dual-Stack atau Tunneling, dan mengapa?',
      easyPartPrompt: 'Konsep IPv6 mana yang paling mudah kamu pahami dalam pertemuan ini dan mengapa?',
      hardPartPrompt: 'Bagian IPv6 mana yang paling menantang dan perlu kamu eksplorasi lebih lanjut?',
    },
    selfEvaluationCriteria: [
      { id: 'sc1', label: 'Saya memahami mengapa IPv6 diciptakan untuk menggantikan IPv4 dan apa kelemahan NAT.' },
      { id: 'sc2', label: 'Saya dapat menerapkan aturan kompresi alamat IPv6 (leading zeros + ::) dengan benar.' },
      { id: 'sc3', label: 'Saya memahami 6 langkah proses pembentukan IPv6 Link Local menggunakan EUI-64.' },
      { id: 'sc4', label: 'Saya dapat membedakan jenis-jenis alamat IPv6 (Global Unicast, Link-Local, Loopback, Multicast).' },
      { id: 'sc5', label: 'Saya dapat mensimulasikan konfigurasi IPv6 pada interface router dengan perintah CLI yang benar.' },
    ],
    conclusionPrompt: 'Berdasarkan penyusunan peta konsep dan matriks perbandingan IPv4 vs IPv6 yang telah kamu lakukan, tuliskan SATU kalimat sintesis final yang merangkum masa depan arsitektur jaringan global — mengapa dunia pasti akan beralih penuh ke IPv6 dan apa yang menjadi kunci keberhasilannya. Kemudian jelaskan bagaimana kamu mampu menyimpulkan perbedaan karakteristik antara IPv4 dan IPv6 serta kesesuaian penggunaannya. Tuliskan secara tepat dengan kata-katamu sendiri.',
  },

  // ─── Tahap 7: Authentic Assessment — X.IP.15 ────────────────────────────────
  {
    type: 'authentic-assessment',
    title: 'Authentic Assessment',
    description:
      'Siswa mengevaluasi penerapan pengalamatan dan konektivitas IPv6 melalui studi kasus investigasi paket IPv6 yang gagal terkirim, mengikuti alur diagnosis yang runtut, dan menyusun dokumen Root Cause Analysis (RCA) sebagai output akhir.',
    objectiveCode: 'X.IP.15',
    activityGuide: [
      'Baca laporan insiden: paket IPv6 tidak sampai ke tujuan di jaringan SMK Nusantara.',
      'Ikuti alur investigasi dari layer Physical (kabel/sinyal) → Network/IPv6 (routing/prefix) → Transport/TCP (port/firewall).',
      'Pilih tindakan diagnosis yang tepat di setiap percabangan dan jelaskan alasan teknisnya.',
      'Susun dokumen Root Cause Analysis (RCA) final berdasarkan temuan investigasimu.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengikuti hierarki investigasi TCP/IP dari Physical Layer → Network/IPv6 Layer → Transport/TCP Layer secara terstruktur.',
      'Kemampuan Berargumen: memilih dan menjelaskan alasan teknis di setiap percabangan rute diagnosis.',
      'Penarikan Kesimpulan: menyusun dokumen Root Cause Analysis (RCA) dengan format: Problem Statement, Root Cause, Evidence, Corrective Action.',
    ],
    facilitatorNotes: [
      'Guru mengingatkan: investigasi jaringan yang benar selalu dimulai dari layer terbawah (Physical) naik ke atas — jangan langsung melompat ke layer Transport.',
      'Guru mendorong siswa memahami mengapa "paket IPv6 drop" bisa disebabkan oleh banyak layer yang berbeda dan pentingnya metodologi sistematis.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mengevaluasi penerapan pengalamatan dan konektivitas IPv6 pada proses komunikasi jaringan modern',
      condition: 'melalui aktivitas authentic assessment berupa studi kasus bercabang investigasi paket IPv6 pada CONNETIC Module',
      degree: 'secara logis',
    },
    branchingScenario: {
      context:
        'Laporan masuk dari Lab TKJ SMK Nusantara: sebuah PC Client (IPv6: 2001:db8:1::10) tidak bisa melakukan ping ke Server IPv6 (2001:db8:1::100) yang berada di ruangan berbeda namun satu LAN segment. Router R1 sudah dikonfigurasi Dual Stack. Semua PC lain di lab yang sama bisa ping normal. Tugas kamu: investigasi sistematis menggunakan hierarki layer TCP/IP.',
      initialQuestion:
        'Berdasarkan hierarki layer TCP/IP, layer mana yang harus kamu periksa PERTAMA KALI sebelum melangkah ke layer berikutnya?',
      focusAreas: ['Konektivitas Fisik', 'Pengalamatan IPv6', 'Layanan Jaringan'],
      choices: [
        {
          id: 'c1',
          text: 'Physical Layer — periksa kondisi kabel, koneksi port switch, dan status lampu indikator NIC pada PC yang bermasalah.',
          isOptimal: true,
          consequence:
            'Metodologi investigasi yang tepat! Kamu memulai dari layer terbawah sesuai prinsip OSI/TCP-IP troubleshooting. Kamu memeriksa kabel UTP — ternyata kabel dari PC ke switch longgar di port switch. Setelah dipasang ulang, lampu indikator NIC berubah hijau. Namun ping IPv6 masih gagal — berarti masalahnya ada di layer yang lebih tinggi juga.',
          followUpQuestion:
            'Physical Layer sudah beres. Sekarang pindah ke Network/IPv6 Layer. Perintah apa yang kamu jalankan di PC client untuk memeriksa konfigurasi alamat IPv6-nya?',
          followUpChoices: [
            {
              id: 'f1a',
              text: 'ipconfig /all (Windows) — melihat apakah PC sudah mendapat alamat IPv6 yang benar dan default gateway-nya menunjuk ke Router R1.',
              isCorrect: true,
              explanation:
                'Langkah yang tepat! Dari output ipconfig, terlihat PC client memiliki alamat Autoconfiguration IPv6 (fe80::... saja, tanpa Global Unicast 2001:db8:1::/64). Ini berarti PC tidak mendapat alamat IPv6 dari Router karena RA (Router Advertisement) tidak diterima — kemungkinan IPv6 routing belum diaktifkan di R1.',
            },
            {
              id: 'f1b',
              text: 'ping 8.8.8.8 — menguji apakah koneksi internet bekerja untuk mengkonfirmasi Physical Layer sudah oke.',
              isCorrect: false,
              explanation:
                'Ping ke 8.8.8.8 menguji koneksi internet (IPv4), bukan masalah IPv6 lokal yang kita investigasi. Untuk mendiagnosis masalah IPv6 di LAN, perintah yang tepat adalah ipconfig /all atau ip -6 addr show (Linux) untuk memeriksa apakah alamat IPv6 sudah dikonfigurasi dengan benar.',
            },
          ],
        },
        {
          id: 'c2',
          text: 'Transport/TCP Layer — langsung periksa apakah firewall Windows memblokir paket ICMPv6 yang digunakan oleh ping IPv6.',
          isOptimal: false,
          consequence:
            'Melompat ke Transport Layer tanpa memeriksa Physical dan Network Layer dulu adalah kesalahan metodologi. Kamu mematikan Windows Firewall sementara — ping IPv6 masih gagal. Kamu sudah menghabiskan waktu di layer yang salah. Prinsip investigasi jaringan: SELALU mulai dari Physical Layer, naik ke atas secara berurutan.',
          followUpQuestion:
            'Setelah menghabiskan waktu di Transport Layer tanpa hasil, apa langkah korektif yang harus kamu ambil?',
          followUpChoices: [
            {
              id: 'f2a',
              text: 'Kembali ke metodologi yang benar: mulai dari Physical Layer (periksa kabel dan port switch), kemudian naik ke Network Layer untuk memeriksa konfigurasi IPv6.',
              isCorrect: true,
              explanation:
                'Mengakui kesalahan dan kembali ke metodologi yang sistematis adalah sikap teknisi profesional. Investigasi dari Physical Layer → Network/IPv6 Layer → Transport/TCP Layer adalah urutan yang tepat dan efisien untuk menemukan root cause.',
            },
            {
              id: 'f2b',
              text: 'Reinstall operating system PC client karena kemungkinan ada kerusakan pada stack IPv6 Windows.',
              isCorrect: false,
              explanation:
                'Reinstall OS adalah solusi terakhir (last resort) yang drastis dan membuang waktu. Sebelum ke sana, investigasi sistematis dari Physical Layer akan jauh lebih cepat dan efektif menemukan masalah sebenarnya.',
            },
          ],
        },
        {
          id: 'c3',
          text: 'Network/IPv6 Layer — langsung periksa routing table IPv6 di Router R1 menggunakan "show ipv6 route".',
          isOptimal: false,
          consequence:
            'Memeriksa routing table di router tanpa memastikan Physical Layer dulu bisa menyesatkan. Kamu menemukan routing table normal, tapi masalah sebenarnya ada di kabel longgar yang tidak kamu periksa. Diagnosis yang tidak lengkap menghasilkan kesimpulan yang salah. Ingat: Physical Layer SELALU diperiksa pertama.',
          followUpQuestion:
            'Routing table R1 terlihat normal. PC masih tidak bisa ping. Apa yang seharusnya kamu periksa sebelum routing table?',
          followUpChoices: [
            {
              id: 'f3a',
              text: 'Kembali ke Physical Layer: periksa kabel, port switch, dan status lampu NIC di PC yang bermasalah — sebelum naik ke layer yang lebih tinggi.',
              isCorrect: true,
              explanation:
                'Tepat! Kabel longgar di port switch adalah root cause sebenarnya. Jika Physical Layer diperiksa dulu, masalah akan ditemukan lebih cepat. Metodologi bottom-up (Physical → Network → Transport) adalah pendekatan standar industri untuk troubleshooting jaringan.',
            },
            {
              id: 'f3b',
              text: 'Periksa konfigurasi VLAN di switch karena mungkin PC client dan server berada di VLAN berbeda.',
              isCorrect: false,
              explanation:
                'VLAN mismatch adalah kemungkinan yang valid, tapi pemeriksaan ini juga masuk di layer 2 (Data Link), yang artinya masih di atas Physical Layer. Urutan pemeriksaan yang benar: Physical (kabel/sinyal fisik) → Data Link (VLAN, MAC, switch) → Network (IP, routing).',
            },
          ],
        },
      ],
      finalEvaluation:
        'Sekarang susunlah Dokumen Root Cause Analysis (RCA) berdasarkan investigasi yang kamu lakukan. Format RCA: (1) Problem Statement — deskripsikan masalah yang terjadi secara singkat, (2) Root Cause — apa penyebab utama yang ditemukan, (3) Evidence — bukti teknis apa yang mendukung temuanmu, (4) Corrective Action — langkah perbaikan yang telah atau harus dilakukan. Dokumen RCA yang baik adalah bukti bahwa kamu tidak hanya bisa memperbaiki masalah, tapi juga memahami mengapa masalah itu terjadi.',
    },
    conclusionPrompt: 'Berdasarkan studi kasus investigasi paket IPv6 yang telah kamu analisis, susunlah dokumen Root Cause Analysis (RCA) dengan format: (1) Problem Statement, (2) Root Cause, (3) Evidence teknis, (4) Corrective Action. Kemudian jelaskan bagaimana kamu mampu mengevaluasi penerapan pengalamatan dan konektivitas IPv6 pada proses komunikasi jaringan modern. Tuliskan secara logis dengan kata-katamu sendiri.',
  },
];
