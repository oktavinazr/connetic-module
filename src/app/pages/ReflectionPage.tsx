import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ChevronRight, ChevronLeft, Lightbulb, CheckCircle, User } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getLessonProgress, saveReflectionResult } from '../utils/progress';
import { lessons } from '../data/lessons';
import { Logo } from '../components/layout/Logo';

export function ReflectionPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser);
  const lesson = lessonId ? lessons[lessonId] : null;

  const [essays, setEssays] = useState({
    easy: '',
    hard: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!lesson) {
      navigate('/dashboard');
      return;
    }
    getLessonProgress(user.id, lessonId!).then((progress) => {
      if (!progress.posttestCompleted) navigate(`/lesson/${lessonId}`);
    });
  }, [user, lesson, navigate, lessonId]);

  if (!lesson) return null;

  const handleSubmit = async () => {
    if (essays.easy.length < 15 || essays.hard.length < 15) {
      setError('Tuliskan refleksi yang lebih mendalam (minimal 15 karakter per isian).');
      return;
    }
    
    await saveReflectionResult(user!.id, lessonId!, essays);
    setSubmitted(true);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F0F3FA]">
      <header className="sticky top-0 z-50 w-full border-b border-[#C8D8F0] bg-white/95 shadow-md backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-3">
                <Logo size="sm" />
              </Link>
              <div className="h-8 w-px bg-[#D5DEEF] hidden sm:block" />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#628ECB]/10 px-3 py-1 text-xs font-bold text-[#628ECB] uppercase tracking-widest border border-[#628ECB]/20">
                Refleksi Belajar
              </span>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-[#395886] hover:text-[#628ECB] transition-colors text-sm font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pembuka */}
        <div className="bg-white rounded-3xl border-2 border-[#F59E0B]/20 shadow-sm p-8 flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#F59E0B] flex items-center justify-center text-white mb-6 shadow-md">
            <User className="w-10 h-10" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-[#395886] mb-3">Refleksi Belajar Mandiri</h1>
          <p className="text-sm font-bold text-[#395886]/60 leading-relaxed max-w-xl">
            Selamat! Kamu telah menyelesaikan modul <span className="text-[#F59E0B]">{lesson.title}</span>. Terakhir, mari renungkan pengalaman belajarmu hari ini.
          </p>
        </div>

        {/* Formulir Refleksi */}
        <div className="bg-white rounded-[2rem] border-2 border-[#D5DEEF] shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F59E0B]/10">
              <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <h3 className="text-lg font-bold text-[#395886]">Jurnal Pemahaman</h3>
          </div>

          <div className="space-y-8 mb-8">
            <div>
              <label className="block text-sm font-black text-[#395886] mb-3">
                1. Apa yang paling mudah kamu pahami dari pertemuan ini? Jelaskan alasannya!
              </label>
              <textarea
                value={essays.easy}
                onChange={(e) => setEssays(prev => ({ ...prev, easy: e.target.value }))}
                disabled={submitted}
                rows={4}
                className="w-full p-5 rounded-2xl border-2 border-[#D5DEEF] bg-[#F8FAFF] focus:bg-white focus:border-[#F59E0B] transition-all outline-none text-sm font-medium"
                placeholder="Misal: Saya mudah memahami three-way handshake karena analogi telepon sangat membantu..."
              />
            </div>

            <div>
              <label className="block text-sm font-black text-[#395886] mb-3">
                2. Apa yang paling sulit atau menantang untuk dipahami?
              </label>
              <textarea
                value={essays.hard}
                onChange={(e) => setEssays(prev => ({ ...prev, hard: e.target.value }))}
                disabled={submitted}
                rows={4}
                className="w-full p-5 rounded-2xl border-2 border-[#D5DEEF] bg-[#F8FAFF] focus:bg-white focus:border-[#F59E0B] transition-all outline-none text-sm font-medium"
                placeholder="Misal: Saya masih bingung membedakan antara segmentasi dan fragmentasi..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold p-4 rounded-2xl mb-6 text-center">
              {error}
            </div>
          )}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl bg-[#F59E0B] text-white font-black text-sm hover:bg-[#D97706] shadow-lg shadow-[#F59E0B]/20 transition-all active:scale-[0.98]"
            >
              Simpan dan Selesaikan Modul
            </button>
          ) : (
            <div className="space-y-6 animate-in zoom-in duration-500">
              <div className="bg-[#F0FDF4] p-6 rounded-2xl border-2 border-[#10B981]/20 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center text-white">
                  <CheckCircle className="w-8 h-8" strokeWidth={3} />
                </div>
                <p className="text-base font-black text-[#065F46]">Refleksi Berhasil Disimpan!</p>
                <p className="text-xs font-bold text-[#065F46]/60">Terima kasih atas dedikasimu dalam belajar.</p>
              </div>
              
              <Link
                to="/dashboard"
                className="block w-full py-4 rounded-2xl bg-[#628ECB] text-white font-black text-sm text-center hover:bg-[#395886] shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Kembali ke Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
