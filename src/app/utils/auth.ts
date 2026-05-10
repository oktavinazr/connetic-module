import { supabase } from './supabase';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  gender: 'Laki-laki' | 'Perempuan';
  class: string;
  nis: string;
  role: 'student' | 'admin';
  groupName?: string;
  registeredAt?: string;
}

const ADMIN_CREDENTIALS = {
  id: 'admin-root',
  username: 'admin',
  email: 'admin@connetic.local',
  password: 'Admin123', // Admin password tetap plain untuk pengecekan hardcode
  name: 'Administrator',
  gender: 'Laki-laki' as const,
  class: '',
  nis: '',
  role: 'admin' as const,
};

const CURRENT_USER_KEY = 'currentUser';

// ==========================================
// FUNGSI BANTUAN UNTUK HASHING PASSWORD
// ==========================================
const hashPassword = async (password: string): Promise<string> => {
  try {
    // Coba pakai Web Crypto API (Standar aman, hanya jalan di localhost/HTTPS)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback darurat jika diakses lewat HP / IP Lokal tanpa HTTPS
    console.warn("Crypto API diblokir browser, menggunakan fallback darurat.");
    return btoa(unescape(encodeURIComponent(password + "_connetic_secret")));
  }
};
// ==========================================

const persistCurrentUser = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const register = async (
  name: string,
  username: string,
  email: string,
  password: string,
  gender: 'Laki-laki' | 'Perempuan',
  classRoom: string,
  nis: string
): Promise<boolean> => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedNis = nis.trim();

  try {
    const hashedPassword = await hashPassword(password);

    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${normalizedEmail},username.eq.${normalizedUsername},nis.eq.${normalizedNis}`);

    if (checkError) throw new Error(checkError.message || checkError.code || 'Gagal cek data pengguna');

    if (existing && existing.length > 0) {
      return false;
    }

    const { error } = await supabase.from('users').insert([{
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      gender,
      class: classRoom.trim(),
      nis: normalizedNis,
      role: 'student',
      registered_at: new Date().toISOString(),
    }]);

    if (error) throw new Error(error.message || error.code || 'Gagal menyimpan data');

    return true;
  } catch (err) {
    console.error('Registration error:', err);
    throw err;
  }
};

export const login = async (identifier: string, password: string): Promise<User | null> => {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  // Admin Check (Tetap menggunakan teks asli untuk pengecekan)
  if (
    (normalizedIdentifier === ADMIN_CREDENTIALS.username || normalizedIdentifier === ADMIN_CREDENTIALS.email) &&
    password === ADMIN_CREDENTIALS.password
  ) {
    const adminUser: User = {
      id: ADMIN_CREDENTIALS.id,
      username: ADMIN_CREDENTIALS.username,
      email: ADMIN_CREDENTIALS.email,
      name: ADMIN_CREDENTIALS.name,
      gender: ADMIN_CREDENTIALS.gender,
      class: '',
      nis: '',
      role: 'admin',
      registeredAt: new Date().toISOString(),
    };
    persistCurrentUser(adminUser);
    return adminUser;
  }

  // Hash password inputan user untuk dibandingkan
  const hashedPassword = await hashPassword(password);

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${normalizedIdentifier},username.eq.${normalizedIdentifier},nis.eq.${normalizedIdentifier}`)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) return null;

    const passwordMatch = data.password === hashedPassword || data.password === password;
    if (!data || !passwordMatch) {
      return null;
    }

    const user: User = {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      gender: data.gender,
      class: data.class,
      nis: data.nis,
      role: data.role,
      registeredAt: data.registered_at,
    };

    persistCurrentUser(user);
    return user;
  } catch (err) {
    console.error('Unexpected login error:', err);
    throw err;
  }
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    if (!user) return null;
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing current user from localStorage:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const updateUser = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'registeredAt' | 'role'>>
): Promise<boolean> => {
  if (userId === ADMIN_CREDENTIALS.id) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    persistCurrentUser({ ...currentUser, ...updates });
    return true;
  }

  const dbUpdates: Record<string, unknown> = { ...updates };
  if (updates.email) dbUpdates.email = updates.email.trim().toLowerCase();
  if (updates.username) dbUpdates.username = updates.username.trim().toLowerCase();
  if (updates.nis) dbUpdates.nis = updates.nis.trim();
  if (updates.groupName !== undefined) dbUpdates.group_name = updates.groupName;

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId)
    .select();

  if (error) {
    console.error('[updateUser] Supabase error:', error);
    return false;
  }

  if (!data || data.length === 0) {
    console.warn('[updateUser] No rows updated. Check RLS policies on "users" table.');
    return false;
  }

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    persistCurrentUser({ ...currentUser, ...updates, ...dbUpdates } as User);
  }

  return true;
};

export const getAllStudents = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, username, email, gender, class, nis, role, group_name, registered_at')
    .eq('role', 'student');

  if (error || !data) return [];

  return data.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    gender: u.gender as 'Laki-laki' | 'Perempuan',
    class: u.class,
    nis: u.nis,
    role: u.role as 'student' | 'admin',
    groupName: u.group_name,
    registeredAt: u.registered_at,
  }));
};

export const isAdminUser = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export const getAdminCredentialsHint = () => {
  return {
    username: ADMIN_CREDENTIALS.username,
    password: ADMIN_CREDENTIALS.password,
  };
};

// Tambahkan fungsi untuk Reset Password Siswa (Hanya untuk Admin)
export const resetStudentPassword = async (userId: string): Promise<boolean> => {
  const defaultPassword = 'connetic123';
  
  try {
    let hashedPassword = '';
    if (window.crypto && window.crypto.subtle) {
      hashedPassword = await hashPassword(defaultPassword);
    } else {
      console.warn("Crypto API gagal jalan.");
      return false;
    }

    console.log(`[1] Memulai request Update ke DB untuk ID: ${userId}`);

    // PERBAIKAN: Tambahkan .select() di ujung untuk mengecek hasil pastinya
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId)
      .select();

    if (error) {
      console.error("[2] Error langsung dari Supabase:", error);
      alert(`Error Supabase: ${error.message}`);
      return false; 
    }

    // INI DETEKTOR RLS-NYA:
    if (!data || data.length === 0) {
      console.error("[2] GAGAL! Supabase tidak mengirim error, tapi 0 baris ter-update. Ini 100% karena RLS memblokir aksi Update.");
      alert("Gagal merubah Database! Tabel 'users' di Supabase kamu terkunci oleh RLS (Row Level Security).");
      return false; 
    }

    console.log("[2] SUKSES! Database berhasil diubah:", data);
    return true;
  } catch (err) {
    console.error('[X] Terjadi kesalahan sistem:', err);
    return false;
  }
};
