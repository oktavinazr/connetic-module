import { supabase } from './supabase';

export interface GroupDiscussion {
  id: string;
  lesson_id: string;
  module_id: string;
  group_name: string;
  user_id: string;
  user_name: string;
  argument: string;
  choice_id?: string;
  choice_text?: string;
  votes: string[];
  created_at: string;
  updated_at?: string;
}

// 1. UBAH: Ambil data dari tabel 'users', gunakan 'id' bukan 'user_id'
export async function getAllGroupAssignments(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('users')
    .select('id, group_name')
    .not('group_name', 'is', null);
    
  if (error || !data) return {};
  
  const result: Record<string, string> = {};
  data.forEach((row) => { 
    if (row.group_name) result[row.id] = row.group_name; 
  });
  return result;
}

// 2. UBAH: Cukup update tabel 'users', tidak perlu upsert ke 'student_groups'
export async function assignGroup(userId: string, groupName: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ group_name: groupName })
    .eq('id', userId);
    
  if (error) console.error('[assignGroup]', error.message);
}

// 3. UBAH: Cukup set group_name jadi null di tabel 'users'
export async function removeGroup(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ group_name: null })
    .eq('id', userId);
    
  if (error) console.error('[removeGroup]', error.message);
}

// 4. UBAH: Ambil group_name langsung dari tabel 'users'
export async function getStudentGroup(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('group_name')
    .eq('id', userId)
    .maybeSingle();
    
  if (error || !data) return null;
  return data.group_name;
}

export async function getAdminGroupNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from('admin_group_names')
    .select('group_name')
    .order('group_name', { ascending: true });

  if (error || !data) return [];
  return data.map((row) => row.group_name);
}

export async function addAdminGroupName(groupName: string): Promise<void> {
  await supabase
    .from('admin_group_names')
    .upsert(
      { group_name: groupName, updated_at: new Date().toISOString() },
      { onConflict: 'group_name' },
    );
}

export async function renameAdminGroupName(oldName: string, newName: string): Promise<void> {
  const { error } = await supabase
    .from('admin_group_names')
    .update({ group_name: newName, updated_at: new Date().toISOString() })
    .eq('group_name', oldName);
  if (error) console.error('[renameAdminGroupName]', error.message);
}

export async function deleteAdminGroupName(groupName: string): Promise<void> {
  const { error } = await supabase
    .from('admin_group_names')
    .delete()
    .eq('group_name', groupName);
  if (error) console.error('[deleteAdminGroupName]', error.message);
}

// 5. UBAH: Cari anggota sekelompok langsung dari tabel 'users'
export async function getGroupMembers(groupName: string): Promise<{ user_id: string; user_name: string }[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name')
    .eq('group_name', groupName);

  if (error || !data) {
    if (error) console.error('[getGroupMembers]', error.message);
    return [];
  }

  // Format ulang kembaliannya agar cocok dengan UI LearningCommunity
  return data.map((row) => ({
    user_id: row.id,
    user_name: row.name,
  }));
}

// Fitur Diskusi tidak perlu diubah karena menembak tabel 'group_discussions'
export async function getGroupDiscussions(lessonId: string, moduleId: string, groupName: string): Promise<GroupDiscussion[]> {
  const { data, error } = await supabase
    .from('group_discussions')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('module_id', moduleId)
    .eq('group_name', groupName)
    .order('created_at', { ascending: true });

  if (error || !data) {
    if (error) console.error('[getGroupDiscussions]', error.message);
    return [];
  }

  return data.map((row) => ({
    ...row,
    votes: Array.isArray(row.votes) ? row.votes : [],
  })) as GroupDiscussion[];
}

export async function createGroupDiscussion(
  payload: Omit<GroupDiscussion, 'id' | 'created_at' | 'updated_at' | 'votes'> & { votes?: string[] },
): Promise<void> {
  const { error } = await supabase
    .from('group_discussions')
    .insert({
      ...payload,
      votes: payload.votes ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) console.error('[createGroupDiscussion]', error.message);
}

export async function toggleGroupDiscussionVote(discussionId: string, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('group_discussions')
    .select('votes')
    .eq('id', discussionId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('[toggleGroupDiscussionVote:select]', error.message);
    return;
  }

  const votes = Array.isArray(data.votes) ? data.votes : [];
  const nextVotes = votes.includes(userId)
    ? votes.filter((id: string) => id !== userId)
    : [...votes, userId];

  const { error: updateError } = await supabase
    .from('group_discussions')
    .update({ votes: nextVotes, updated_at: new Date().toISOString() })
    .eq('id', discussionId);

  if (updateError) console.error('[toggleGroupDiscussionVote:update]', updateError.message);
}