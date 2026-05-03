import { supabase, UserProfile } from './supabase';

export async function signUp(email: string, password: string, name: string): Promise<{ user: UserProfile; error: null } | { user: null; error: string }> {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'User creation failed' };
    }

    // Create profile in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          role: 'user',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (profileError) {
      return { user: null, error: profileError.message };
    }

    return { user: profileData as UserProfile, error: null };
  } catch (error) {
    return { user: null, error: String(error) };
  }
}

export async function signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: null } | { user: null; error: string }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Sign in failed' };
    }

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      return { user: null, error: profileError.message };
    }

    return { user: profileData as UserProfile, error: null };
  } catch (error) {
    return { user: null, error: String(error) };
  }
}

export async function signOut(): Promise<{ error: null } | { error: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      return null;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();

    return profileData as UserProfile | null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return (data || []) as UserProfile[];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function updateUserRole(userId: string, role: 'user' | 'mentor' | 'admin'): Promise<{ error: null } | { error: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function deactivateUser(userId: string): Promise<{ error: null } | { error: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function reactivateUser(userId: string): Promise<{ error: null } | { error: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function deleteUser(userId: string): Promise<{ error: null } | { error: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: String(error) };
  }
}
