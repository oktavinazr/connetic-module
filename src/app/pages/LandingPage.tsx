import React from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Home,
  Info,
  Instagram,
  Linkedin,
  LogIn,
  Mail,
  Network,
  ShieldCheck,
  Target,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import { MobileSidebar } from '../components/MobileSidebar';
import { useEffect, useState } from 'react';
import profileImg from '../../assets/images/Profil.jpeg';
import { Logo } from '../components/layout/Logo';

const desktopContainer = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

export function LandingPage() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = ['home', 'about', 'profile'];
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const navItems = [
    { label: 'Beranda', href: '#home', id: 'home' },
    { label: 'Tentang', href: '#about', id: 'about' },
    { label: 'Profil', href: '#profile', id: 'profile' },
  ];

  const stages = [
    { name: 'Constructivism', desc: 'Membangun pemahaman dengan menghubungkan pengetahuan baru dengan pengalaman nyata.' },
    { name: 'Inquiry', desc: 'Proses perpindahan dari pengamatan menjadi pemahaman melalui siklus penyelidikan.' },
    { name: 'Questioning', desc: 'Mendorong rasa ingin tahu siswa melalui interaksi tanya jawab yang produktif.' },
    { name: 'Learning Community', desc: 'Menciptakan lingkungan belajar kolaboratif melalui diskusi kelompok.' },
    { name: 'Modeling', desc: 'Pemberian model atau contoh yang dapat ditiru oleh siswa untuk menguasai keterampilan.' },
    { name: 'Reflection', desc: 'Meninjau kembali apa yang telah dipelajari untuk memperkuat struktur kognitif.' },
    { name: 'Authentic Assessment', desc: 'Proses pengumpulan berbagai data yang memberikan gambaran perkembangan belajar.' },
  ];

  const features = [
    {
      icon: <Network className="h-8 w-8" />,
      title: 'Keruntutan Berpikir',
      desc: 'Kemampuan menyusun gagasan secara sistematis, logis, dan berurutan dalam memahami konsep jaringan komputer.',
      color: 'bg-[#10B981]',
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Kemampuan Berargumen',
      desc: 'Kemampuan memberikan alasan yang kuat dan relevan untuk mendukung suatu pendapat atau solusi dalam konteks jaringan.',
      color: 'bg-[#628ECB]',
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Penarikan Kesimpulan',
      desc: 'Kemampuan mengambil kesimpulan yang tepat berdasarkan fakta dan data yang diperoleh selama proses pembelajaran.',
      color: 'bg-[#F59E0B]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F3FA] text-[#395886]">
      <header className="sticky top-0 z-50 w-full border-b border-[#D5DEEF] bg-white/90 shadow-sm backdrop-blur-md transition-all">
        <div className={`${desktopContainer}`}>
          <div className="flex min-h-[76px] items-center justify-between gap-4">
            {/* Logo – selalu di kiri */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden sm:block">
                <Logo />
              </div>
              <div className="sm:hidden">
                <Logo size="sm" />
              </div>
            </div>

            {/* Navigasi – tengah, hanya desktop */}
            <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`relative py-1 transition-colors hover:text-[#628ECB] ${
                    activeSection === item.id ? 'text-[#628ECB]' : 'text-[#395886]'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-[#628ECB] transition-all" />
                  )}
                </a>
              ))}
            </nav>

            {/* Tombol Aksi – selalu di kanan */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden rounded-full bg-[#628ECB] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#395886] hover:shadow-lg active:scale-95 md:block"
              >
                Login
              </Link>
              <MobileSidebar
                title="Menu Utama"
                description="Navigasi cepat ke seluruh bagian halaman."
                items={[
                  { label: 'Beranda', href: '#home', icon: <Home className="h-4 w-4" /> },
                  { label: 'Tentang', href: '#about', icon: <Info className="h-4 w-4" /> },
                  { label: 'Profil', href: '#profile', icon: <User className="h-4 w-4" /> },
                  { label: 'Login', to: '/login', icon: <LogIn className="h-4 w-4" /> },
                ]}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── BERANDA ─────────────────────────────────────────────────────────── */}
      <section id="home" className="relative flex min-h-[calc(100vh-76px)] scroll-mt-20 items-center overflow-hidden py-16 lg:py-0">
        <div className="absolute inset-0 bg-[#F0F3FA]" />
        
        <div className={`${desktopContainer} relative`}>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
              {/* Brand Label — Modernized */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2.5 rounded-[1.25rem] bg-white border border-[#10B981]/20 px-5 py-2 text-sm font-bold text-[#0F8A66] shadow-sm">
                  <GraduationCap className="h-4 w-4" />
                  Media Pembelajaran Interaktif Berbasis CTL
                </div>
              </div>

              {/* Headline & Subheadline */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tighter text-[#395886]">
                    Selamat Datang <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#395886] to-[#628ECB]">di CONNETIC Module</span>
                  </h1>
                  <p className="text-base sm:text-lg font-bold text-[#628ECB] tracking-tight">
                    Belajar Lebih Terarah & Logis.
                  </p>
                </div>

                <div className="h-1.5 w-24 rounded-full bg-[#628ECB]" />

                <p className="max-w-xl text-lg leading-relaxed text-[#395886]/70 font-medium">
                  Optimalkan pemahaman konsep <span className="text-[#395886] font-bold">TCP</span> dan <span className="text-[#395886] font-bold">IP Address</span> melalui model 7 tahapan CTL yang dirancang khusus untuk meningkatkan <span className="font-bold text-[#395886]">Logical Thinking</span> siswa SMK.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/login"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-[2rem] bg-[#395886] px-10 py-5 text-base font-black text-white shadow-xl shadow-[#395886]/20 transition-all hover:bg-[#628ECB] hover:-translate-y-1 active:scale-95"
                >
                  Mulai Belajar Sekarang
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <div className="relative overflow-hidden rounded-[3.5rem] border border-[#D5DEEF] bg-white p-3 shadow-xl">
                <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#395886] to-[#628ECB] p-10 text-white shadow-inner">
                  <div className="relative space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white/20 shadow-lg border border-white/20">
                        <Network className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black tracking-tight">Kurikulum TJKT</h3>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Pertemuan Terstruktur</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { num: 1, topic: 'TCP' },
                        { num: 2, topic: 'Mekanisme TCP' },
                        { num: 3, topic: 'IPv4' },
                        { num: 4, topic: 'IPv6' },
                      ].map((item) => (
                        <div key={item.num} className="group relative overflow-hidden rounded-2xl bg-white/10 p-4 transition-all border border-white/10 hover:border-white/30">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white/70 transition-colors">Modul {item.num}</p>
                          <p className="mt-1 text-sm font-extrabold text-white">{item.topic}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-white/10 p-6 border border-white/10">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Evaluasi Terintegrasi</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-white/70 font-medium">
                        Dilengkapi sistem Pre-test & Post-test untuk mengukur tingkat pemahaman siswa secara realtime dan akurat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Overlay — Floating */}
              <div className="absolute -right-8 bottom-12 grid gap-3">
                {[
                  { val: '4', label: 'Modul', color: 'text-[#628ECB]' },
                  { val: '7', label: 'CTL Stages', color: 'text-[#10B981]' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center rounded-2xl border border-[#D5DEEF] bg-white p-4 shadow-xl transition-transform hover:-translate-x-1">
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#395886]/50">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TENTANG ─────────────────────────────────────────────────────────── */}
      <section id="about" className="scroll-mt-20 border-y border-[#D5DEEF] bg-[#F8FAFD] pt-7 pb-12 sm:pt-9 sm:pb-14">
        <div className={`${desktopContainer}`}>
          {/* Kepala bagian */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tentang CONNETIC</h2>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-[#628ECB]" />
            <p className="mt-3 text-base text-[#395886]/70">
              Media pembelajaran digital berbasis CTL untuk mata pelajaran DDTJKT kelas X TJKT.
            </p>
          </div>

          {/* Kiri: deskripsi + fitur | Kanan: tahapan CTL */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start">
            {/* Kolom kiri: teks deskripsi + Keunggulan */}
            <div className="space-y-7">
              {/* Deskripsi */}
              <div className="space-y-4 text-base leading-relaxed text-[#395886]/80">
                <p>
                  <strong>CONNETIC Module</strong> adalah media pembelajaran interaktif berbasis web yang dirancang untuk mendukung pembelajaran mata pelajaran <strong>Dasar-Dasar Teknik Jaringan Komputer dan Telekomunikasi (DDTJKT)</strong> pada siswa kelas X TJKT SMK.
                </p>
                <p>
                  Media ini menggunakan pendekatan <strong>Contextual Teaching and Learning (CTL)</strong> yang menghubungkan materi pembelajaran dengan situasi nyata, sehingga siswa dapat memahami konsep secara lebih mendalam. Materi yang dibahas meliputi <strong>TCP, Mekanisme TCP, IPv4,</strong> dan <strong>IPv6</strong>.
                </p>
                <p>
                  Tujuan utama pengembangan media ini adalah meningkatkan kemampuan <strong>logical thinking</strong> (berpikir logis) siswa melalui aktivitas pembelajaran yang terstruktur, interaktif, dan bermakna dengan 7 tahapan CTL.
                </p>
              </div>

              {/* Indikator Logical Thinking */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#395886]">Indikator Logical Thinking</h3>
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-4 rounded-2xl border border-[#D5DEEF] bg-white p-4 shadow-sm transition-all hover:border-[#628ECB] hover:shadow-md"
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${feature.color} text-white shadow-md transition-transform group-hover:scale-105`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#395886]">{feature.title}</h4>
                      <p className="mt-0.5 text-sm leading-relaxed text-[#395886]/60">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom kanan: tahapan CTL */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#395886]">7 Tahapan Pembelajaran CTL</h3>
              <div className="space-y-2.5">
                {stages.map((stage, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-2xl border border-white bg-white p-4 shadow-sm transition-all hover:shadow-md hover:translate-x-1"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#628ECB]/10 text-sm font-bold text-[#628ECB]">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#395886] text-sm">{stage.name}</h4>
                      <p className="mt-0.5 text-xs text-[#395886]/60 leading-relaxed">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFIL PEMBUAT ──────────────────────────────────────────────────── */}
      <section id="profile" className="scroll-mt-20 bg-white pt-7 pb-12 sm:pt-9 sm:pb-14">
        <div className={`${desktopContainer}`}>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Profil Pembuat Media</h2>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-[#628ECB]" />
            <p className="mt-3 text-base text-[#395886]/70 whitespace-nowrap">
              Dikembangkan sebagai bagian dari penelitian skripsi.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-12">
            {/* Kartu Profil */}
            <div className="flex flex-col items-center lg:items-start">
              {/* Foto Profil */}
              <div className="relative mb-6 group">
                <div className="relative h-44 w-44 overflow-hidden rounded-[2.5rem] border-4 border-white bg-[#D5DEEF] shadow-lg transition-all duration-500 group-hover:scale-[1.02]">
                  <img
                    src={profileImg}
                    alt="Oktavina Zahra Rahmawati"
                    className="h-full w-full object-cover transition-opacity duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.profile-fallback');
                        if (fallback) fallback.classList.remove('hidden');
                      }
                    }}
                  />
                  {/* Fallback initials if image fails to load */}
                  <div className="profile-fallback absolute inset-0 flex items-center justify-center bg-[#395886] hidden">
                    <span className="text-5xl font-black text-white tracking-tighter">OZ</span>
                  </div>
                  {/* Always show if profileImg is not defined or fails immediately */}
                  {!profileImg && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#395886]">
                      <span className="text-5xl font-black text-white tracking-tighter">OZ</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10B981] shadow-md transition-transform duration-500 group-hover:rotate-12">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Identitas */}
              <div className="text-center lg:text-left space-y-1">
                <h3 className="text-2xl font-bold text-[#395886]">Oktavina Zahra Rahmawati</h3>
                <p className="text-[#628ECB] font-semibold text-sm">Pendidikan Ilmu Komputer</p>
                <p className="text-[#395886]/60 text-sm font-medium">Universitas Pendidikan Indonesia</p>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#628ECB]/10 px-3 py-1 text-xs font-bold text-[#628ECB] mt-2">
                  Angkatan 2022
                </div>
              </div>

              {/* Kontak */}
              <div className="mt-6 flex flex-wrap justify-center gap-2.5 lg:justify-start">
                <a
                  href="https://instagram.com/oktavinazr_"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  className="flex items-center gap-2 rounded-xl border border-[#D5DEEF] bg-white px-3.5 py-2 text-sm font-semibold text-[#395886] shadow-sm transition-all hover:border-[#E1306C] hover:text-[#E1306C]"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
                <a
                  href="https://linkedin.com/in/oktavinazr"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  className="flex items-center gap-2 rounded-xl border border-[#D5DEEF] bg-white px-3.5 py-2 text-sm font-semibold text-[#395886] shadow-sm transition-all hover:border-[#0A66C2] hover:text-[#0A66C2]"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
                <a
                  href="mailto:oktavinazahrarahmawati@gmail.com"
                  title="Gmail"
                  className="flex items-center gap-2 rounded-xl border border-[#D5DEEF] bg-white px-3.5 py-2 text-sm font-semibold text-[#395886] shadow-sm transition-all hover:border-[#EA4335] hover:text-[#EA4335]"
                >
                  <Mail className="h-4 w-4" />
                  Gmail
                </a>
                <a
                  href="mailto:oktavinazahrarahmawati@upi.edu"
                  title="Email UPI"
                  className="flex items-center gap-2 rounded-xl border border-[#D5DEEF] bg-white px-3.5 py-2 text-sm font-semibold text-[#395886] shadow-sm transition-all hover:border-[#628ECB] hover:text-[#628ECB]"
                >
                  <Mail className="h-4 w-4" />
                  UPI
                </a>
              </div>
            </div>

            {/* Kartu Detail */}
            <div className="space-y-5">
              {/* Skripsi */}
              <div className="rounded-[1.5rem] border border-[#D5DEEF] bg-[#F8FAFD] p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#628ECB] mb-2">Judul Skripsi</p>
                <p className="text-[#395886] font-semibold leading-relaxed">
                  CONNETIC Module: Media Pembelajaran Interaktif Berbasis CTL untuk Meningkatkan Logical Thinking Siswa
                  pada Materi TCP/IP
                </p>
              </div>

              {/* Pembimbing */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[#D5DEEF] bg-[#F8FAFD] p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#628ECB] mb-3">Pembimbing I</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#628ECB]/10 text-[#628ECB]">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#395886] text-sm">Drs. H. Eka Fitrajaya Rahman, M.T.</p>
                      <p className="text-xs text-[#395886]/60">Dosen Pembimbing I</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-[#D5DEEF] bg-[#F8FAFD] p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#628ECB] mb-3">Pembimbing II</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#628ECB]/10 text-[#628ECB]">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#395886] text-sm">Jajang Kusnendar, M.T.</p>
                      <p className="text-xs text-[#395886]/60">Dosen Pembimbing II</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ucapan Terima Kasih */}
              <div className="rounded-[1.5rem] border border-[#10B981]/20 bg-[#10B981]/5 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[#10B981] mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#10B981] mb-2">Ucapan Terima Kasih</p>
                    <p className="text-sm text-[#395886]/80 leading-relaxed">
                      Terima kasih kepada Allah SWT atas segala karunia-Nya, kedua orang tua dan keluarga yang
                      selalu memberikan doa dan dukungan, kepada dosen pembimbing yang telah membimbing dengan
                      sabar, serta seluruh pihak yang telah membantu terselesaikannya penelitian dan pengembangan
                      media pembelajaran CONNETIC ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-gradient-to-br from-[#2d4a73] via-[#395886] to-[#4a6fa0] text-white">
        {/* Konten utama footer */}
        <div className={`${desktopContainer} py-12`}>
          <div className="grid gap-10 lg:grid-cols-[1.8fr_1fr_1fr]">
            {/* Identitas Merek */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Logo theme="dark" />
              </div>
              <p className="text-sm leading-relaxed text-white/60">
                Media pembelajaran interaktif berbasis web untuk menunjang proses belajar mengajar pada mata pelajaran DDTJKT SMK kelas X. Dikembangkan dengan model CTL untuk meningkatkan kemampuan logical thinking siswa.
              </p>
            </div>

            {/* Navigasi */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">Navigasi</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-white/70">
                <a href="#home" className="inline-block transition-all hover:text-white hover:translate-x-1">Beranda</a>
                <a href="#about" className="inline-block transition-all hover:text-white hover:translate-x-1">Tentang</a>
                <a href="#profile" className="inline-block transition-all hover:text-white hover:translate-x-1">Profil Pembuat</a>
              </nav>
            </div>

            {/* Akses */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">Akses Platform</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-white/70">
                <Link to="/login" className="inline-block transition-all hover:text-white hover:translate-x-1">Masuk Sistem</Link>
                <Link to="/register" className="inline-block transition-all hover:text-white hover:translate-x-1">Registrasi Siswa</Link>
              </nav>
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">Materi</h4>
                <div className="flex flex-wrap gap-2">
                  {['TCP', 'Mekanisme TCP', 'IPv4', 'IPv6'].map((m) => (
                    <span key={m} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/70">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bilah hak cipta */}
        <div className="border-t border-white/10">
          <div className={`${desktopContainer} py-5 text-center`}>
            <p className="text-xs text-white/40">
              &copy; 2026 CONNETIC Module. All rights reserved. &nbsp;·&nbsp; Designed for Modern Education
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
