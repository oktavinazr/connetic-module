import { X, User, Mail, GraduationCap, Calendar, Edit2, Save, AtSign } from 'lucide-react';
import { useState } from 'react';
import { updateUser } from '../utils/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    gender: 'Laki-laki' | 'Perempuan';
    class: string; 
    nis: string;
    registeredAt?: string;
    role: string;
  };
  onUpdate: () => void;
}

export function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
  const isAdmin = user.role === 'admin';
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    gender: user.gender,
    class: user.class,
    nis: user.nis,
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setError('');

    if (!editedData.email.includes('@')) {
      setError('Email tidak valid');
      return;
    }

    if (editedData.username.trim().length < 4) {
      setError('Username minimal 4 karakter');
      return;
    }

    const success = await updateUser(user.id, editedData);
    if (success) {
      setIsEditing(false);
      onUpdate();
      window.location.reload();
    } else {
      setError('Username, email, atau NIS sudah digunakan oleh akun lain');
    }
  };

  const handleCancel = () => {
    setEditedData({
      name: user.name,
      username: user.username,
      email: user.email,
      gender: user.gender,
      class: user.class,
      nis: user.nis,
    });
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#395886]/10 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#D5DEEF] flex flex-col max-h-[92vh]">
        {/* Kepala */}
        <div className="px-8 pt-8 pb-6 border-b border-[#3A6CB5]/30 bg-gradient-to-br from-[#395886] to-[#628ECB] flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-lg">
              <span className="text-2xl font-black text-white">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65 mb-1">
                {isAdmin ? 'Administrator' : 'Profil Siswa'}
              </p>
              <h2 className="text-2xl font-black text-white tracking-tight">{user.name}</h2>
              <p className="text-sm font-bold text-white/60 mt-0.5">{isAdmin ? 'Akun Administrator' : user.class}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi */}
        <div className="px-8 py-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-gradient-to-br from-[#EEF3FB] to-[#F0F5FF] rounded-2xl border border-[#C4D7F5]">
              <div className="flex items-center gap-2 text-[#628ECB]">
                <User className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#628ECB]/80">Nama Lengkap</p>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                  className="w-full text-base font-semibold bg-white px-3 py-2.5 border border-[#D5DEEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#628ECB]/20"
                />
              ) : (
                <p className="text-base font-bold text-[#395886]">{user.name}</p>
              )}
            </div>

            <div className="space-y-2 p-4 bg-gradient-to-br from-[#EEF3FB] to-[#F0F5FF] rounded-2xl border border-[#C4D7F5]">
              <div className="flex items-center gap-2 text-[#628ECB]">
                <AtSign className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#628ECB]/80">Username</p>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.username}
                  onChange={(e) => setEditedData({ ...editedData, username: e.target.value })}
                  className="w-full text-base font-semibold bg-white px-3 py-2.5 border border-[#D5DEEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#628ECB]/20"
                />
              ) : (
                <p className="text-base font-bold text-[#395886]">{user.username}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 p-4 bg-gradient-to-br from-[#EEF3FB] to-[#F0F5FF] rounded-2xl border border-[#C4D7F5]">
            <div className="flex items-center gap-2 text-[#628ECB]">
              <Mail className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-wider text-[#628ECB]/80">Email Address</p>
            </div>
            {isEditing ? (
              <input
                type="email"
                value={editedData.email}
                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                className="w-full text-base font-semibold bg-white px-3 py-2.5 border border-[#D5DEEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#628ECB]/20"
              />
            ) : (
              <p className="text-base font-bold text-[#395886]">{user.email}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-gradient-to-br from-[#EEF3FB] to-[#F0F5FF] rounded-2xl border border-[#C4D7F5]">
              <div className="flex items-center gap-2 text-[#628ECB]">
                <User className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#628ECB]/80">Jenis Kelamin</p>
              </div>
              {isEditing && !isAdmin ? (
                <select
                  value={editedData.gender}
                  onChange={(e) => setEditedData({ ...editedData, gender: e.target.value as 'Laki-laki' | 'Perempuan' })}
                  className="w-full text-base font-semibold bg-white px-3 py-2.5 border border-[#D5DEEF] rounded-xl focus:outline-none"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              ) : (
                <p className="text-base font-bold text-[#395886]">{user.gender}</p>
              )}
            </div>

            {!isAdmin && (
              <div className="space-y-2 p-4 bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] rounded-2xl border border-[#A7F3D0]">
                <div className="flex items-center gap-2 text-[#10B981]">
                  <GraduationCap className="w-4 h-4" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#10B981]/80">NIS / Student ID</p>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.nis}
                    onChange={(e) => setEditedData({ ...editedData, nis: e.target.value })}
                    className="w-full text-base font-semibold bg-white px-3 py-2.5 border border-[#D5DEEF] rounded-xl focus:outline-none"
                  />
                ) : (
                  <p className="text-base font-bold text-[#395886]">{user.nis}</p>
                )}
              </div>
            )}
          </div>

          {!isAdmin && (
            <div className="space-y-2 p-4 bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-2xl border border-[#C4B5FD]">
              <div className="flex items-center gap-2 text-[#7C3AED]">
                <GraduationCap className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]/80">Kelas</p>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.class}
                  onChange={(e) => setEditedData({ ...editedData, class: e.target.value })}
                  className="w-full text-base font-semibold bg-white px-3 py-2.5 border border-[#D5DEEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#628ECB]/20"
                />
              ) : (
                <p className="text-base font-bold text-[#395886]">{user.class}</p>
              )}
            </div>
          )}

          {user.registeredAt && (
            <div className="p-4 bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] rounded-2xl border border-[#FCD34D]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs font-bold text-[#92400E]/70 uppercase tracking-widest">Terdaftar Sejak</span>
              </div>
              <p className="text-sm font-bold text-[#395886]">
                {new Date(user.registeredAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Kaki */}
        <div className="bg-gradient-to-r from-[#EEF3FB] to-[#F0F5FF] px-8 py-4 flex justify-end gap-3 border-t border-[#C4D7F5] flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-bold text-[#395886]/60 hover:text-[#395886] transition-colors rounded-xl hover:bg-[#F0F3FA]"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="bg-[#628ECB] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#395886] transition-all flex items-center gap-2 shadow-md"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-[#395886]/60 hover:text-[#395886] transition-colors rounded-xl hover:bg-[#F0F3FA]"
              >
                Tutup
              </button>
              {!isAdmin && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#628ECB] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#395886] transition-all flex items-center gap-2 shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profil
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
