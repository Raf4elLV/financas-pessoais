import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ─── helpers ──────────────────────────────────────────────────────────────

function rowToUser(profile, authUser) {
  return {
    id:     authUser.id,
    email:  authUser.email,
    name:   profile.name,
    phone:  profile.phone  || null,
    avatar: profile.avatar || null,
  }
}

async function fetchProfile(authUser) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single()
  if (!data) return null
  return rowToUser(data, authUser)
}

async function upsertProfile(authUser, updates) {
  await supabase
    .from('profiles')
    .upsert({ id: authUser.id, ...updates }, { onConflict: 'id' })
}

// ─── hook ─────────────────────────────────────────────────────────────────

export function useAuth() {
  const [currentUser,  setCurrentUser]  = useState(null)
  const [authLoading,  setAuthLoading]  = useState(true)
  const [authEvent,    setAuthEvent]    = useState(null) // 'PASSWORD_RECOVERY'

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const profile = await fetchProfile(session.user)
        setCurrentUser(profile)
      }
      setAuthLoading(false)
    })

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setAuthEvent('PASSWORD_RECOVERY')
          return
        }
        if (event === 'SIGNED_IN' && session) {
          // Sync avatar from metadata to profile on first login
          const meta = session.user.user_metadata || {}
          if (meta.avatar) {
            await upsertProfile(session.user, {
              name:   meta.name  || session.user.email,
              phone:  meta.phone || null,
              avatar: meta.avatar,
            })
          }
          const profile = await fetchProfile(session.user)
          setCurrentUser(profile)
          setAuthEvent(null)
          setAuthLoading(false)
        }
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null)
          setAuthEvent(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── register ────────────────────────────────────────────────────────────
  async function register({ name, email, phone, password, avatarBase64 }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name:   name.trim(),
          phone:  phone?.trim() || null,
          avatar: avatarBase64 || null,
        },
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }

  // ── login ───────────────────────────────────────────────────────────────
  async function login({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed'))
        return { ok: false, error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' }
      return { ok: false, error: 'E-mail ou senha incorretos.' }
    }
    return { ok: true }
  }

  // ── logout ──────────────────────────────────────────────────────────────
  async function logout() {
    await supabase.auth.signOut()
  }

  // ── forgotPassword ───────────────────────────────────────────────────────
  async function forgotPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }

  // ── resetPassword ────────────────────────────────────────────────────────
  async function resetPassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { ok: false, error: error.message }
    setAuthEvent(null)
    return { ok: true }
  }

  // ── updateProfile ────────────────────────────────────────────────────────
  async function updateProfile({ name, email, phone, avatar }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Sessão inválida.' }

    const profileUpdates = {}
    if (name   !== undefined) profileUpdates.name   = name.trim()
    if (phone  !== undefined) profileUpdates.phone  = phone?.trim() || null
    if (avatar !== undefined) profileUpdates.avatar = avatar

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id)
      if (error) return { ok: false, error: error.message }
    }

    if (email !== undefined && email.trim().toLowerCase() !== user.email) {
      const { error } = await supabase.auth.updateUser({ email: email.trim().toLowerCase() })
      if (error) return { ok: false, error: error.message }
    }

    const updated = { ...currentUser, ...profileUpdates }
    if (email !== undefined) updated.email = email.trim().toLowerCase()
    setCurrentUser(updated)
    return { ok: true }
  }

  // ── changePassword ───────────────────────────────────────────────────────
  async function changePassword({ currentPassword, newPassword }) {
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: currentPassword,
    })
    if (authErr) return { ok: false, error: 'Senha atual incorreta.' }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }

  return {
    currentUser,
    authLoading,
    authEvent,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  }
}
