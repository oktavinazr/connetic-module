import type { Stage } from './lessons';

export const lesson2Stages: Stage[] = [
  {
    type: 'constructivism',
    title: 'Constructivism',
    description:
      'Siswa membangun pemahaman awal tentang struktur TCP Header dan fungsi setiap komponennya melalui eksplorasi animasi interaktif dan aktivitas mencocokkan fungsi komponen.',
    objectiveCode: 'X.TCP.9',
    activityGuide: [
      'Jelajahi animasi interaktif tentang komponen TCP Header secara bertahap.',
      'Pasangkan setiap komponen TCP Header dengan fungsinya menggunakan klik kiri-kanan (tarik garis).',
      'Tulis argumen logis tentang fungsi komponen TCP Header berdasarkan pasangan yang telah kamu buat.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengeksplorasi komponen TCP Header melalui animasi interaktif dan mencocokkan komponen dengan fungsinya secara runtut.',
      'Kemampuan Berargumen: menjelaskan alasan dan argumen tentang fungsi tiap komponen TCP Header dalam proses komunikasi data.',
      'Penarikan Kesimpulan: menyimpulkan apa yang telah dipelajari tentang TCP Header dan fungsi komponennya.',
    ],
    facilitatorNotes: [
      'Guru mendorong siswa memahami bahwa TCP Header adalah "amplop pintar" yang membawa informasi kontrol penting.',
      'Guru menekankan peran setiap komponen: Port untuk identitas aplikasi, Sequence Number untuk urutan, Checksum untuk verifikasi.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu mengidentifikasi TCP Header beserta fungsinya pada protokol TCP',
      condition: 'melalui aktivitas constructivism berupa animasi analogi interaktif pada CONNETIC Module',
      degree: 'dengan tepat',
    },
    apersepsi:
      'Pernahkah kamu mengirim paket lewat jasa ekspedisi? Di label paket ada informasi penting: alamat pengirim, alamat penerima, nomor resi, kode keamanan, dan jenis layanan. Tanpa label itu, kurir tidak tahu ke mana paket harus diantar! Nah, di dunia jaringan, TCP juga punya "label pintar" yang disebut TCP Header — berisi informasi penting agar data sampai dengan selamat dan berurutan.',
    constructivismEssay1:
      'Berdasarkan eksplorasi animasi TCP Header yang baru saja kamu pelajari, menurutmu mengapa setiap komponen TCP Header (Port, Sequence Number, ACK, Flags, Window Size, Checksum) memiliki peran yang berbeda? Mengapa tidak bisa hanya satu komponen saja yang menangani semuanya?',
    constructivismMatching: [
      {
        id: 'm1',
        left: 'Source Port & Destination Port',
        right: 'Mengidentifikasi aplikasi pengirim dan penerima. Port memastikan data masuk ke aplikasi yang tepat (nilai 0–65535).',
      },
      {
        id: 'm2',
        left: 'Sequence Number',
        right: 'Nomor urut byte pertama dalam segmen. Memungkinkan penerima menyusun ulang data meskipun segmen tiba tidak berurutan.',
      },
      {
        id: 'm3',
        left: 'Acknowledgment Number',
        right: 'Nomor byte berikutnya yang diharapkan penerima. Memberi tahu pengirim bahwa semua byte sebelum nomor ini sudah diterima.',
      },
      {
        id: 'm4',
        left: 'TCP Flags (SYN, ACK, FIN, RST)',
        right: 'Bit-bit penanda status koneksi. SYN=memulai koneksi, ACK=mengkonfirmasi data, FIN=menutup koneksi, RST=menghentikan darurat.',
      },
      {
        id: 'm5',
        left: 'Window Size',
        right: 'Mengatur jumlah data yang boleh dikirim sekaligus sebelum menunggu ACK. Mencegah pengirim membanjiri penerima (Flow Control).',
      },
      {
        id: 'm6',
        left: 'Checksum',
        right: 'Nilai verifikasi yang dihitung dari seluruh isi segmen. Penerima menghitung ulang untuk mendeteksi kerusakan data selama perjalanan.',
      },
    ],
    conclusionPrompt: 'Berdasarkan eksplorasi animasi TCP Header dan aktivitas memasangkan fungsi komponen yang telah kamu lakukan, jelaskan bagaimana kamu mampu mengidentifikasi TCP Header beserta fungsinya pada protokol TCP. Jelaskan juga mengapa Sequence Number dan Acknowledgment Number harus bekerja berpasangan, serta apa yang terjadi jika Checksum mendeteksi kerusakan data. Tuliskan dengan tepat menggunakan kata-katamu sendiri.',
  },

  {
    type: 'inquiry',
    title: 'Inquiry',
    description:
      'Siswa mengeksplorasi mekanisme TCP Sequence Number secara mendalam dan memahami bagaimana Sequence Number memastikan urutan pengiriman data yang andal.',
    objectiveCode: 'X.TCP.10',
    activityGuide: [
      'Buka dan pelajari materi tentang TCP Sequence Number melalui panel eksplorasi interaktif.',
      'Urutkan 5 tahapan proses pengiriman data menggunakan Sequence Number dengan drag & drop.',
      'Tulis argumen logis tentang pentingnya Sequence Number dalam menjaga urutan data.',
      'Tulis kesimpulan tentang mekanisme TCP Sequence Number yang telah dipelajari.',
    ],
    logicalThinkingIndicators: [
      'Keruntutan Berpikir: mengurutkan tahapan proses Sequence Number dalam siklus pengiriman data TCP secara runtut.',
      'Kemampuan Berargumen: menjelaskan alasan mengapa Sequence Number penting dalam memastikan data diterima secara berurutan.',
      'Penarikan Kesimpulan: menyimpulkan bagaimana mekanisme TCP Sequence Number bekerja dalam menjaga urutan pengiriman data.',
    ],
    facilitatorNotes: [
      'Guru menekankan bahwa TCP menomori setiap byte, bukan setiap segmen — ini kunci pemahaman Sequence Number.',
      'Guru mendorong siswa membandingkan pengiriman data dengan dan tanpa Sequence Number untuk memahami pentingnya mekanisme ini.',
    ],
    atpAbcd: {
      audience: 'Peserta didik',
      behavior: 'mampu menguraikan mekanisme TCP Sequence Number dalam memastikan urutan pengiriman',
      condition: 'melalui aktivitas inquiry berupa eksplorasi materi rangkai alur pada CONNETIC Module',
      degree: 'secara runtut',
    },
    material: {
      title: 'Mekanisme TCP Sequence Number',
      content: [
        'Sequence Number adalah komponen penting dalam TCP Header yang berfungsi sebagai "nomor urut" untuk setiap byte data yang dikirim. Dengan Sequence Number, penerima dapat menyusun kembali data yang tiba tidak berurutan menjadi urutan yang benar.',
        'TCP tidak menomori segmen, melainkan menomori setiap byte data. Jika ISN (Initial Sequence Number) = 1000 dan segmen pertama membawa 500 byte, maka segmen kedua dimulai dari Sequence Number 1500. Inilah yang membuat TCP sangat presisi dalam melacak data.',
        'Sequence Number bekerja berpasangan dengan Acknowledgment Number. Penerima mengirim ACK Number yang berisi byte berikutnya yang diharapkan. Jika ACK = 1501, artinya semua byte hingga nomor 1500 sudah diterima dengan benar.',
      ],
      examples: [
        'ISN (Initial Sequence Number): Nomor awal yang dipilih secara acak saat koneksi dimulai. Misal: ISN = 1000.',
        'Penomoran per byte: Segmen 1 (Seq=1000, 500 byte) → Segmen 2 (Seq=1500, 500 byte) → Segmen 3 (Seq=2000, 500 byte).',
        'ACK sebagai konfirmasi: Setelah terima byte 1000–1499, penerima kirim ACK=1500. Setelah byte 1500–1999, kirim ACK=2000.',
        'Deteksi kehilangan: Jika penerima menerima Seq=1000 lalu Seq=2000 (tanpa Seq=1500), ia tahu segmen tengah hilang dan meminta pengiriman ulang.',
        'Rekonstruksi data: Meskipun segmen tiba dengan urutan Seq=2000, Seq=1000, Seq=1500, penerima tetap bisa menyusun ulang berdasarkan Sequence Number.',
      ],
    },
    explorationSections: [
      {
        id: 'e1',
        title: 'Apa itu Sequence Number?',
        content:
          'Sequence Number adalah field 32-bit dalam TCP Header yang berisi nomor urut byte pertama dalam segmen data. Berbeda dengan penomoran halaman buku, TCP menomori setiap byte — bukan setiap segmen. Ini memberikan presisi tingkat byte dalam melacak data yang dikirim dan diterima.',
        example:
          'Bayangkan kamu mengirim novel 5000 kata. TCP tidak memberi nomor per bab, tapi per KATA. Jadi kamu tahu persis kata ke berapa yang hilang — bukan hanya bab mana yang bermasalah.',
      },
      {
        id: 'e2',
        title: 'Bagaimana Sequence Number Ditetapkan?',
        content:
          'Saat koneksi TCP dibuka (Three-Way Handshake), pengirim dan penerima saling bertukar ISN (Initial Sequence Number) — nomor awal yang dipilih secara acak. ISN tidak dimulai dari 0 atau 1 demi alasan keamanan, agar pihak luar tidak mudah menebak nomor urut koneksi.',
        example:
          'Client memilih ISN = 4500 secara acak, mengirim SYN dengan Seq=4500. Server membalas dengan SYN-ACK, Seq=8200 (ISN server), ACK=4501. Mulai saat ini, nomor urut dihitung dari ISN masing-masing.',
      },
      {
        id: 'e3',
        title: 'Bagaimana Sequence Number Memastikan Urutan?',
        content:
          'Setiap byte data yang dikirim mendapat nomor urut yang meningkat secara berurutan. Jika segmen tiba tidak sesuai urutan (out-of-order), penerima menyimpannya di buffer dan menunggu segmen yang hilang. Setelah segmen hilang tiba, semua data disusun ulang berdasarkan Sequence Number.',
        example:
          'Penerima menerima: Seq=1000 (byte 1000–1499), lalu Seq=2000 (byte 2000–2499). Data disimpan di buffer. Penerima tahu byte 1500–1999 belum tiba. Saat akhirnya Seq=1500 tiba, ketiga segmen langsung disusun: 1000→1500→2000 — urutan sempurna!',
      },
      {
        id: 'e4',
        title: 'Sequence Number & Acknowledgment Number',
        content:
          'ACK Number adalah "nomor konfirmasi" yang dikirim penerima. Nilainya adalah Sequence Number berikutnya yang diharapkan. Jika penerima sudah menerima byte hingga Seq=1499, maka ACK=1500. Dengan ACK, pengirim tahu persis data mana yang sudah sampai dan mana yang perlu dikirim ulang.',
        example:
          'Seperti percakapan telepon: Pengirim: "Aku kirim data 1–500." Penerima: "Diterima. Kirim 501." (ACK=501). Pengirim: "Data 501–1000." Penerima: "Diterima. Kirim 1001." — setiap bagian dikonfirmasi satu per satu, tidak bisa ada yang terlewat.',
      },
      {
        id: 'e5',
        title: 'Apa yang Terjadi Jika Sequence Number Hilang?',
        content:
          'Jika segmen dengan Sequence Number tertentu tidak kunjung mendapat ACK dalam batas waktu (timeout), TCP menganggap segmen tersebut hilang. Pengirim secara otomatis mengirim ulang segmen tersebut — mekanisme ini disebut retransmission. Tanpa Sequence Number, tidak mungkin tahu segmen mana yang hilang dan perlu dikirim ulang.',
        example:
          'Pengirim mengirim Seq=1000, Seq=1500, Seq=2000. ACK untuk Seq=1500 tidak kunjung datang. Setelah timeout, pengirim mengirim ulang Seq=1500. Begitu sampai, penerima mengirim ACK=2500 — artinya semua data hingga byte 2499 sudah lengkap!',
      },
    ],
    flowInstruction:
      'Urutkan 5 tahapan proses pengiriman data menggunakan Sequence Number berikut, mulai dari pemilihan ISN hingga rekonstruksi data di sisi penerima.',
    flowItems: [
      { id: 'fl1', text: 'Client dan Server bertukar ISN (Initial Sequence Number) saat Three-Way Handshake — nomor awal dipilih acak untuk keamanan.', correctOrder: 1, description: 'ISN ditetapkan saat koneksi dibuka.', colorClass: 'purple' },
      { id: 'fl2', text: 'Data dipecah menjadi segmen-segmen. Setiap segmen diberi Sequence Number berdasarkan posisi byte pertamanya (misal: Seq=1000 untuk byte ke-1000).', correctOrder: 2, description: 'Setiap byte data diberi nomor urut.', colorClass: 'blue' },
      { id: 'fl3', text: 'Segmen dikirim satu per satu. Penerima menyimpan setiap segmen di buffer dan memeriksa Sequence Number-nya.', correctOrder: 3, description: 'Segmen dikirim dan diperiksa urutannya.', colorClass: 'green' },
      { id: 'fl4', text: 'Penerima mengirim ACK Number (nomor byte berikutnya yang diharapkan) untuk mengkonfirmasi data yang sudah diterima dengan benar.', correctOrder: 4, description: 'ACK mengkonfirmasi penerimaan data.', colorClass: 'amber' },
      { id: 'fl5', text: 'Jika ada segmen hilang (timeout tanpa ACK), TCP mengirim ulang segmen tersebut. Setelah semua segmen lengkap, data disusun ulang sesuai Sequence Number menjadi data utuh.', correctOrder: 5, description: 'Data hilang dikirim ulang, lalu disusun ulang.', colorClass: 'pink' },
    ],
    inquiryReflection1:
      'Berdasarkan urutan tahapan Sequence Number yang baru saja kamu susun, jelaskan mengapa Sequence Number sangat penting dalam memastikan data diterima secara berurutan! Apa yang akan terjadi jika TCP tidak memiliki mekanisme Sequence Number? Jelaskan argumenmu secara logis.',
    inquiryReflection2:
      'Setelah mengeksplorasi seluruh materi tentang TCP Sequence Number, jelaskan bagaimana mekanisme Sequence Number dan Acknowledgment Number bekerja sama dalam menjaga keandalan pengiriman data. Berikan contoh konkret dengan nilai Sequence Number tertentu untuk memperjelas penjelasanmu.',
    conclusionPrompt: 'Berdasarkan eksplorasi materi dan aktivitas penyusunan tahapan Sequence Number yang telah kamu lakukan, jelaskan bagaimana kamu mampu menguraikan mekanisme TCP Sequence Number dalam memastikan urutan pengiriman. Tuliskan secara runtut dengan kata-katamu sendiri.',
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
