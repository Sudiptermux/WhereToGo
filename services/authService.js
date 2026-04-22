// services/authService.js
import { supabase } from './supabaseClient';

export async function signUp({ name, email, password, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        phone_number: phone,
      },
    },
  });

  if (error) throw error;
  return data;

  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function confirmSignUp({ email, code }) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'signup'
  });
  
  if (error) throw error;
  return data;
}

export async function resendConfirmationCode({ email }) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email
  });
  
  if (error) throw error;
}

export async function forgotPassword({ email }) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function getUserAttributes() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return {
      email: user.email,
      name: profile?.name || user.user_metadata?.full_name || "Traveler",
      avatar: profile?.avatar_url || null,
      level: profile?.level || 1,
    };
  }
  return null;
}
