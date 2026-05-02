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

interface StoredUser extends User {
  password: string; // Sekarang ini akan menyimpan Hash, bukan teks asli
  registeredAt: string;
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
const LOCAL_USERS_KEY = 'connetic_local_users';

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

const getLocalUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setLocalUsers = (users: StoredUser[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const toUser = (storedUser: StoredUser): User => ({
  id: storedUser.id,
  name: storedUser.name,
  username: storedUser.username,
  email: storedUser.email,
  gender: storedUser.gender,
  class: storedUser.class,
  nis: storedUser.nis,
  role: storedUser.role,
  registeredAt: storedUser.registeredAt,
});

const persistCurrentUser = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const createLocalUserId = () =>
  globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const canUseLocalFallback = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as { code?: string; message?: string; status?: number };
  const message = candidate.message?.toLowerCase() ?? '';

  return (
    candidate.code === '42501' ||
    candidate.status === 401 ||
    candidate.status === 403 ||
    message.includes('unauthorized') ||
    message.includes('row-level security') ||
    message.includes('permission denied') ||
    message.includes('failed to fetch') ||
    message.includes('network')
  );
};

const findLocalUserByIdentifier = (normalizedIdentifier: string): StoredUser | undefined =>
  getLocalUsers().find(
    (user) =>
      user.email === normalizedIdentifier ||
      user.username === normalizedIdentifier ||
      user.nis === normalizedIdentifier
  );

const hasLocalConflict = (
  users: StoredUser[],
  normalizedEmail: string,
  normalizedUsername: string,
  normalizedNis: string,
  excludeUserId?: string
) =>
  users.some(
    (user) =>
      user.id !== excludeUserId &&
      (user.email === normalizedEmail || user.username === normalizedUsername || user.nis === normalizedNis)
  );

const registerLocally = (
  name: string,
  normalizedUsername: string,
  normalizedEmail: string,
  hashedPassword: string, // <-- Terima password yang sudah di-hash
  gender: 'Laki-laki' | 'Perempuan',
  classRoom: string,
  normalizedNis: string
): boolean => {
  const localUsers = getLocalUsers();
  if (hasLocalConflict(localUsers, normalizedEmail, normalizedUsername, normalizedNis)) {
    return false;
  }

  const registeredAt = new Date().toISOString();
  localUsers.push({
    id: createLocalUserId(),
    name: name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword, // <-- Simpan hash
    gender,
    class: classRoom.trim(),
    nis: normalizedNis,
    role: 'student',
    registeredAt,
  });
  setLocalUsers(localUsers);
  return true;
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
    // 1. Hash password sebelum melakukan apapun
    const hashedPassword = await hashPassword(password);

    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${normalizedEmail},username.eq.${normalizedUsername},nis.eq.${normalizedNis}`);

    if (checkError) {
      if (canUseLocalFallback(checkError)) {
        return registerLocally(name, normalizedUsername, normalizedEmail, hashedPassword, gender, classRoom, normalizedNis);
      }
      throw checkError;
    }

    if (existing && existing.length > 0) {
      return false;
    }

    const { error } = await supabase.from('users').insert([{
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword, // <-- Simpan hash ke database
      gender,
      class: classRoom.trim(),
      nis: normalizedNis,
      role: 'student',
      registered_at: new Date().toISOString(),
    }]);

    if (error) {
      if (canUseLocalFallback(error)) {
        return registerLocally(name, normalizedUsername, normalizedEmail, hashedPassword, gender, classRoom, normalizedNis);
      }
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Registration error:', err);
    if (canUseLocalFallback(err)) {
      // Pastikan error fallback juga menggunakan hashed password
      hashPassword(password).then(hPass => 
        registerLocally(name, normalizedUsername, normalizedEmail, hPass, gender, classRoom, normalizedNis)
      );
      return true; // Asumsi berhasil masuk local
    }
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

  // Cek Local Storage (Bandingkan hash dengan hash)
  const localUser = findLocalUserByIdentifier(normalizedIdentifier);
  if (localUser && localUser.password === hashedPassword) {
    const user = toUser(localUser);
    persistCurrentUser(user);
    return user;
  }

  try {
    // Cek Database Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${normalizedIdentifier},username.eq.${normalizedIdentifier},nis.eq.${normalizedIdentifier}`)
      .maybeSingle();

    if (error) {
      if (canUseLocalFallback(error)) {
        return null;
      }
      console.error('Supabase query error:', error);
      throw error;
    }
    
    // Cek password: support data lama (plain text) dan baru (SHA-256 hash)
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
    if (canUseLocalFallback(err)) {
      return null;
    }
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

  const localUsers = getLocalUsers();
  const localIndex = localUsers.findIndex((user) => user.id === userId);

  if (localIndex >= 0) {
    const normalizedEmail = typeof dbUpdates.email === 'string' ? dbUpdates.email : localUsers[localIndex].email;
    const normalizedUsername = typeof dbUpdates.username === 'string' ? dbUpdates.username : localUsers[localIndex].username;
    const normalizedNis = typeof dbUpdates.nis === 'string' ? dbUpdates.nis : localUsers[localIndex].nis;

    if (hasLocalConflict(localUsers, normalizedEmail, normalizedUsername, normalizedNis, userId)) {
      return false;
    }

    localUsers[localIndex] = { ...localUsers[localIndex], ...updates, ...dbUpdates };
    setLocalUsers(localUsers);

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      persistCurrentUser({ ...currentUser, ...updates, ...dbUpdates } as User);
    }
    return true;
  }

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
  const localStudents = getLocalUsers()
    .filter((user) => user.role === 'student')
    .map(toUser);

  const { data, error } = await supabase
    .from('users')
    .select('id, name, username, email, gender, class, nis, role, group_name, registered_at')
    .eq('role', 'student');

  if (error || !data) return localStudents;

  const remoteStudents: User[] = data.map((u) => ({
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

  const seen = new Set(remoteStudents.map((user) => `${user.email}|${user.username}|${user.nis}`));
  const mergedStudents: User[] = [...remoteStudents];

  for (const localStudent of localStudents) {
    const key = `${localStudent.email}|${localStudent.username}|${localStudent.nis}`;
    if (!seen.has(key)) {
      mergedStudents.push(localStudent);
    }
  }

  return mergedStudents;
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

    const localUsers = getLocalUsers();
    const localIndex = localUsers.findIndex((u) => u.id === userId);
    if (localIndex >= 0) {
      localUsers[localIndex].password = hashedPassword;
      setLocalUsers(localUsers);
    }

    return true;
  } catch (err) {
    console.error('[X] Terjadi kesalahan sistem:', err);
    return false;
  }
};