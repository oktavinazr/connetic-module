import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, CheckCircle, Home, ShieldCheck, UserPlus } from 'lucide-react';
import { register } from '../utils/auth';
import { Logo } from '../components/layout/Logo';

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [classRoom, setClassRoom] = useState('');
  const [nis, setNis] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login?registered=1');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 3) {
      setError('Nama minimal 3 karakter.');
      return;
    }

    if (username.trim().length < 4) {
      setError('Username minimal 4 karakter.');
      return;
    }

    if (!email.includes('@')) {
      setError('Email tidak valid.');
      return;
    }

    if (!classRoom.trim()) {
      setError('Kelas harus diisi.');
      return;
    }

    if (!nis.trim()) {
      setError('NIS harus diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    try {
      const result = await register(name, username, email, password, gender, classRoom, nis);
      if (!result) {
        setError('Username, email, atau NIS sudah terdaftar.');
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError('Gagal mendaftar: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(98,142,203,0.18),_transparent_30%),linear-gradient(160deg,#eef4ff_0%,#f9fbff_52%,#ecf2ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_18px_55px_rgba(57,88,134,0.08)] backdrop-blur sm:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
          </Link>
          <div className="mx-4 hidden h-8 w-px bg-[#D5DEEF] sm:block" />
          <span className="hidden sm:inline-flex items-center rounded-lg bg-[#628ECB]/10 px-3 py-1 text-xs font-bold text-[#628ECB] uppercase tracking-widest border border-[#628ECB]/20">Register</span>
        </div>
        <Link
          to="/"
          className="hidden items-center gap-2 rounded-xl border border-[#D5DEEF] bg-white px-4 py-2 text-sm font-semibold text-[#395886] transition-all hover:border-[#628ECB] hover:text-[#628ECB] sm:inline-flex"
        >
          <Home className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-7.5rem)] max-w-[1280px] items-center py-6">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_30px_80px_rgba(57,88,134,0.14)] backdrop-blur lg:grid-cols-[0.8fr_1.2fr]">
          <section className="relative overflow-hidden bg-[linear-gradient(165deg,#395886_0%,#4e79b0_46%,#7fb3ea_100%)] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.12),_transparent_35%)]" />
            <div className="relative flex h-full flex-col justify-center py-10 lg:py-12 gap-7">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold w-fit">
                  <UserPlus className="h-4 w-4" />
                  Pendaftaran Siswa
                </div>
                <h1 className="max-w-md text-3xl font-bold leading-tight sm:text-4xl tracking-tight">
                  Buat Akun untuk Memulai Belajar
                </h1>
                <p className="max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                  Lengkapi formulir pendaftaran dengan data diri yang valid agar Anda dapat mengakses seluruh materi pembelajaran dan memantau progres belajar Anda.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm shadow-sm transition-all hover:bg-white/15">
                  <ShieldCheck className="mb-3 h-7 w-7 text-[#D5DEEF]" />
                  <p className="mb-1 text-sm font-semibold">Data Valid & Akurat</p>
                  <p className="text-xs text-white/75 leading-relaxed">Pastikan Nama, NIS, dan Kelas sesuai dengan data sekolah Anda untuk sinkronisasi nilai yang tepat.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-2xl">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#628ECB]">Register</p>
                <h2 className="mt-2 text-3xl font-bold text-[#395886]">Buat akun siswa</h2>
                <p className="mt-2 text-sm leading-6 text-[#395886]/70">
                  Lengkapi data berikut. Setelah berhasil, Anda akan diarahkan ke halaman login.
                </p>
              </div>

              {success && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 px-5 py-4">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[#10B981] mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#10B981]">Data berhasil disimpan!</p>
                    <p className="text-xs text-[#10B981]/80 mt-0.5">
                      Kamu akan diarahkan ke halaman login dalam beberapa detik...
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-[#395886]">
                      Nama Lengkap
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-[#D5DEEF] bg-white px-4 py-3.5 text-[#395886] outline-none transition focus:border-[#628ECB] focus:ring-4 focus:ring-[#628ECB]/15"
                      placeholder="Nama lengkap"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-semibold text-[#395886]">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-2xl border border-[#D5DEEF] bg-white px-4 py-3.5 text-[#395886] outline-none transition focus:border-[#628ECB] focus:ring-4 focus:ring-[#628ECB]/15"
                      placeholder="Masukkan username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-[#395886]">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-[#D5DEEF] bg-white px-4 py-3.5 text-[#395886] outline-none transition focus:border-[#628ECB] focus:ring-4 focus:ring-[#628ECB]/15"
                      placeholder="nama@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="gender" className="block text-sm font-semibold text-[#395886]">
                      Jenis Kelamin
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                      className="w-full rounded-2xl border border-[#D5DEEF] bg-white px-4 py-3.5 text-[#395886] outline-none transition focus:border-[#628ECB] focus:ring-4 focus:ring-[#628ECB]/15"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="class" className="block text-sm font-semibold text-[#395886]">
                      Kelas
                    </label>
                    <input
                      id="class"
                      type="text"
                      value={classRoom}
                      onChange={(e) => setClassRoom(e.target.value)}
                      className="w-full rounded-2xl border border-[#D5DEEF] bg-white px-4 py-3.5 text-[#395886] outline-none transition focus:border-[#628ECB] focus:ring-4 focus:ring-[#628ECB]/15"
                      placeholder="Contoh: X TJKT 1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nis" className="block text-sm font-semibold text-[#395886]">
                      NIS
                    </label>
                    <input
                      id="nis"
                      type="text"
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      className="w-full rounded-2xl border border-[#D5DEEF] bg-white px-4 py-3.5 text-[#395886] outline-none transition focus:border-[#628ECB] focus:ring-4 focus:ring-[#628ECB]/15"
                      placeholder="Masukkan NIS"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-[#395886]">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-[#D5DEEF] bg-white px-4 py-3.5 text-[#395886] outline-none transition focus:border-[#628ECB] focus:ring-4 focus:ring-[#628ECB]/15"
                      placeholder="Minimal 6 karakter"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#395886]">
                      Konfirmasi Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-2xl border border-[#D5DEEF] bg-white px-4 py-3.5 text-[#395886] outline-none transition focus:border-[#628ECB] focus:ring-4 focus:ring-[#628ECB]/15"
                      placeholder="Ulangi password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={success}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#628ECB] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#628ECB]/20 transition hover:bg-[#395886] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {success ? 'Mendaftarkan...' : 'Daftar'}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#395886]/75">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-semibold text-[#628ECB] hover:text-[#395886]">
                  Login di sini
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
