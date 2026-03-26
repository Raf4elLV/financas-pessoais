import { useState } from 'react'
import { loadUsers, saveUsers, loadSession, saveSession, clearSession } from '../utils/storage'

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => {
    const userId = loadSession()
    if (!userId) return null
    const users = loadUsers()
    return users.find(u => u.id === userId) || null
  })

  function register({ name, email, phone, password, avatarBase64 }) {
    const users = loadUsers()
    const exists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())
    if (exists) return { ok: false, error: 'Este e-mail já está cadastrado.' }

    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      password,
      avatar: avatarBase64 || null,
      createdAt: new Date().toISOString(),
    }
    saveUsers([...users, newUser])
    return { ok: true }
  }

  function login({ email, password, rememberMe = false }) {
    const users = loadUsers()
    const user = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )
    if (!user) return { ok: false, error: 'E-mail ou senha incorretos.' }
    saveSession(user.id, rememberMe)
    setCurrentUser(user)
    return { ok: true }
  }

  function logout() {
    clearSession()
    setCurrentUser(null)
  }

  function updateProfile({ name, email, phone, avatar }) {
    const users = loadUsers()
    const idx = users.findIndex(u => u.id === currentUser.id)
    if (idx === -1) return { ok: false, error: 'Usuário não encontrado.' }

    if (email !== undefined) {
      const normalized = email.trim().toLowerCase()
      const taken = users.some((u, i) => i !== idx && u.email === normalized)
      if (taken) return { ok: false, error: 'Este e-mail já está em uso.' }
    }

    const updated = {
      ...users[idx],
      ...(name  !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.trim().toLowerCase() }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(avatar !== undefined && { avatar }),
    }

    const next = [...users]
    next[idx] = updated
    saveUsers(next)
    setCurrentUser(updated)
    return { ok: true }
  }

  function changePassword({ currentPassword, newPassword }) {
    if (currentUser.password !== currentPassword) return { ok: false, error: 'Senha atual incorreta.' }
    if (newPassword.length < 4) return { ok: false, error: 'A nova senha deve ter pelo menos 4 caracteres.' }

    const users = loadUsers()
    const idx = users.findIndex(u => u.id === currentUser.id)
    if (idx === -1) return { ok: false, error: 'Usuário não encontrado.' }

    const updated = { ...users[idx], password: newPassword }
    const next = [...users]
    next[idx] = updated
    saveUsers(next)
    setCurrentUser(updated)
    return { ok: true }
  }

  return { currentUser, register, login, logout, updateProfile, changePassword }
}
