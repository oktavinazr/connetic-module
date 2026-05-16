import { X, BookOpen, CheckCircle, List, Trophy, HelpCircle } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Latar belakang */}
      <div
        className="absolute inset-0 bg-[#395886]/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col border-2 border-[#D5DEEF]">
        {/* Kepala */}
        <div className="px-8 pt-8 pb-5 flex items-center justify-between border-b border-[#3A6CB5]/30 bg-gradient-to-br from-[#395886] to-[#628ECB]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-lg">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Panduan Penggunaan</h2>
              <p className="text-sm font-semibold text-white/65 uppercase tracking-wider">CONNETIC Module</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-[#D5DEEF]">
          {/* Tentang */}
          <div className="bg-gradient-to-br from-[#EEF3FB] to-[#F0F5FF] p-6 rounded-[1.5rem] border border-[#C4D7F5]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#628ECB]/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-[#628ECB]" />
              </div>
              <h3 className="text-[#395886] text-lg font-bold">Tentang CONNETIC Module</h3>
            </div>
            <p className="text-[#395886]/80 leading-relaxed text-sm md:text-base font-medium">
              CONNETIC Module adalah media pembelajaran interaktif untuk mata pelajaran{' '}
              <span className="text-[#628ECB] font-bold">Dasar-Dasar Teknik Jaringan Komputer dan Telekomunikasi (DDTJKT)</span> kelas X SMK.
              Media ini menerapkan model pembelajaran <span className="text-[#395886] font-extrabold underline decoration-[#628ECB]/30">Contextual Teaching and Learning (CTL)</span>{' '}
              dengan 7 tahapan yang harus diselesaikan secara berurutan.
            </p>
          </div>

          {/* Alur Pembelajaran */}
          <div>
            <div className="flex items-center gap-3 mb-5 px-2">
              <div className="p-2 bg-[#628ECB]/10 rounded-xl">
                <List className="w-6 h-6 text-[#628ECB]" />
              </div>
              <h3 className="text-[#395886] text-lg font-bold">Alur Penggunaan Media</h3>
            </div>
            <div className="space-y-3">
              {[
                {
                  step: 1,
                  title: 'Pre-Test Umum (±30 menit)',
                  desc: 'Langkah pertama sebelum memulai pembelajaran. Kerjakan Pre-Test Umum untuk mengukur pemahaman awal Anda. Pertemuan 1 akan terbuka setelah selesai.',
                },
                {
                  step: 2,
                  title: 'Pertemuan 1–4 (Berurutan)',
                  desc: 'Setiap pertemuan memiliki alur: Pendahuluan → Pre-Test Pertemuan → 7 Tahapan CTL → Post-Test Pertemuan. Pertemuan berikutnya terbuka setelah pertemuan sebelumnya selesai.',
                },
                {
                  step: 3,
                  title: 'Post-Test Umum (±30 menit)',
                  desc: 'Setelah semua pertemuan selesai, kerjakan Post-Test Umum sebagai evaluasi akhir untuk mengukur capaian pembelajaran Anda.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start bg-white p-5 rounded-2xl border-2 border-[#D5DEEF] hover:border-[#628ECB]/30 transition-colors shadow-sm">
                  <div className="bg-[#628ECB] text-white rounded-xl w-9 h-9 flex items-center justify-center flex-shrink-0 font-black text-base shadow-md">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#395886] mb-1.5 text-base">{item.title}</h4>
                    <p className="text-[#395886]/70 text-sm leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7 Tahapan CTL */}
          <div className="bg-gradient-to-br from-[#EEF3FB] to-[#E8F0FA] p-6 rounded-[2rem] border border-[#628ECB]/25">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#10B981]/10 rounded-xl">
                <CheckCircle className="w-6 h-6 text-[#10B981]" />
              </div>
              <h3 className="text-[#395886] text-lg font-bold">7 Tahapan CTL</h3>
            </div>
            <div className="grid gap-2.5">
              {[
                { name: 'Constructivism', desc: 'Membangun pengetahuan awal melalui skenario apersepsi dan video pembelajaran.' },
                { name: 'Inquiry', desc: 'Menemukan konsep melalui eksplorasi materi dan aktivitas interaktif.' },
                { name: 'Questioning', desc: 'Menganalisis skenario dan menjawab pertanyaan kritis dengan alasan logis.' },
                { name: 'Learning Community', desc: 'Belajar bersama melalui aktivitas kelompok dan diskusi studi kasus.' },
                { name: 'Modeling', desc: 'Mengikuti peragaan media langkah demi langkah yang dipandu fasilitator.' },
                { name: 'Reflection', desc: 'Merefleksikan pemahaman melalui tulisan refleksi dan penilaian diri.' },
                { name: 'Authentic Assessment', desc: 'Penilaian otentik berbasis skenario — pilih keputusan dan ikuti konsekuensinya.' },
              ].map((stage, idx) => (
                <div key={idx} className="flex items-start gap-4 bg-white/80 backdrop-blur-sm px-4 py-3.5 rounded-xl border border-[#D5DEEF] shadow-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#628ECB] text-white text-xs font-black mt-0.5 shadow-sm">{idx + 1}</span>
                  <div>
                    <h4 className="font-bold text-[#395886] text-sm">{stage.name}</h4>
                    <p className="text-[#395886]/65 text-xs md:text-sm leading-relaxed font-medium mt-0.5">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <div className="flex items-center gap-3 mb-5 px-2">
              <div className="p-2 bg-[#F59E0B]/10 rounded-xl">
                <Trophy className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-[#395886] text-lg font-bold">Tips Belajar</h3>
            </div>
            <div className="grid gap-3">
              {[
                'Kerjakan setiap tahapan secara berurutan — jangan lewati tahapan apapun.',
                'Perhatikan timer pada setiap tes dan jawab dengan tenang dan fokus.',
                'Setelah pertemuan selesai, Anda dapat me-review semua tahapan kapan saja.',
                'Pilih kelompok belajar Anda melalui menu Kelompok di dashboard.',
                'Hasil belajar (nilai pretest & posttest) dapat dilihat di tab "Hasil Belajar".',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 text-[#395886]/80 text-sm font-medium bg-[#F8FAFD] p-3 rounded-xl border border-[#D5DEEF]">
                  <div className="h-5 w-5 rounded-full bg-[#F59E0B]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                  </div>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kaki */}
        <div className="bg-gradient-to-r from-[#EEF3FB] to-[#F0F5FF] px-6 py-4 flex justify-end flex-shrink-0 border-t border-[#C4D7F5]">
          <button
            onClick={onClose}
            className="bg-[#628ECB] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#395886] transition-colors shadow-md active:scale-95"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
