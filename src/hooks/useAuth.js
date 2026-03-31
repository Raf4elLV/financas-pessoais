import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ─── helpers ──────────────────────────────────────────────────────────────

function rowToUser(profile, authUser) {
  return {
    id:        authUser.id,
    email:     authUser.email,
    name:      profile.name,
    phone:     profile.phone      || null,
    avatar:    profile.avatar     || null,
    createdAt: profile.created_at || null,
    onboarded: profile.onboarded  ?? false,
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
  const [authUser,     setAuthUser]     = useState(undefined) // undefined = not yet known
  const [currentUser,  setCurrentUser]  = useState(null)
  const [authLoading,  setAuthLoading]  = useState(true)
  const [authEvent,    setAuthEvent]    = useState(null)

  // ── Auth state listener — SYNCHRONOUS, zero awaits ────────────────────
  // Supabase v2 awaits each onAuthStateChange callback before resolving
  // auth operations (signInWithPassword, etc.). Any async work here would
  // block login. Keep this callback fast and synchronous only.
  useEffect(() => {
    const safetyTimer = setTimeout(() => setAuthLoading(false), 8000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION') {
          setAuthUser(session?.user ?? null)
          if (!session) {
            clearTimeout(safetyTimer)
            setAuthLoading(false)
          }
          return
        }
        if (event === 'SIGNED_IN' && session) {
          setAuthUser(session.user)
          setAuthEvent(null)
          return
        }
        if (event === 'TOKEN_REFRESHED' && session) {
          setAuthUser(session.user)
          return
        }
        if (event === 'SIGNED_OUT') {
          setAuthUser(null)
          setCurrentUser(null)
          setAuthEvent(null)
          clearTimeout(safetyTimer)
          setAuthLoading(false)
          return
        }
        if (event === 'PASSWORD_RECOVERY') {
          setAuthEvent('PASSWORD_RECOVERY')
          return
        }
      }
    )

    return () => {
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  // ── Profile fetch — runs whenever the authenticated user ID changes ────
  // Separated from the auth listener so it never blocks Supabase operations.
  useEffect(() => {
    if (authUser === undefined) return // still waiting for INITIAL_SESSION

    if (!authUser) return // logged out — handled by the listener above

    let cancelled = false

    // Sync avatar from metadata to profile (fire-and-forget, non-blocking)
    const meta = authUser.user_metadata || {}
    if (meta.avatar) {
      upsertProfile(authUser, {
        name:   meta.name  || authUser.email,
        phone:  meta.phone || null,
        avatar: meta.avatar,
      })
    }

    fetchProfile(authUser)
      .then(profile => {
        if (cancelled) return
        setCurrentUser(profile)
        setAuthLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setCurrentUser(null)
        setAuthLoading(false)
      })

    return () => { cancelled = true }
  }, [authUser?.id])

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
    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('rate limit') || msg.includes('email rate limit') || error.status === 429)
        return { ok: false, error: 'Limite de cadastros atingido. Aguarde alguns minutos e tente novamente.' }
      if (msg.includes('already registered') || msg.includes('user already registered'))
        return { ok: false, error: 'Este e-mail já está cadastrado. Tente fazer login.' }
      return { ok: false, error: error.message }
    }
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
    setCurrentUser(null)
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

  // ── markOnboarded ────────────────────────────────────────────────────────
  async function markOnboarded(userId) {
    await supabase.from('profiles').update({ onboarded: true }).eq('id', userId)
    setCurrentUser(u => u ? { ...u, onboarded: true } : u)
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
    markOnboarded,
  }
}
