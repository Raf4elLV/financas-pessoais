function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e)
  }
}

// ─── Auth / Global ─────────────────────────────────────────────────────────
export function loadUsers()            { return load('fin_users', []) }
export function saveUsers(list)        { save('fin_users', list) }

export function loadSession() {
  try {
    const local = localStorage.getItem('fin_session')
    if (local) return JSON.parse(local)
    const session = sessionStorage.getItem('fin_session')
    if (session) return JSON.parse(session)
    return null
  } catch { return null }
}

export function saveSession(userId, persistent = true) {
  clearSession()
  const target = persistent ? localStorage : sessionStorage
  try { target.setItem('fin_session', JSON.stringify(userId)) } catch {}
}

export function clearSession() {
  localStorage.removeItem('fin_session')
  sessionStorage.removeItem('fin_session')
}

// ─── Per-user keys ─────────────────────────────────────────────────────────
const k = (base, uid) => `${base}_${uid}`

export function loadTransactions(uid)        { return load(k('fin_transactions', uid), []) }
export function saveTransactions(uid, list)  { save(k('fin_transactions', uid), list) }

export function loadCategories(uid)          { return load(k('fin_categories', uid), null) }
export function saveCategories(uid, list)    { save(k('fin_categories', uid), list) }

export function loadGoals(uid)               { return load(k('fin_investment_goals', uid), []) }
export function saveGoals(uid, list)         { save(k('fin_investment_goals', uid), list) }

export function loadSettings(uid)            { return load(k('fin_settings', uid), { theme: 'light' }) }
export function saveSettings(uid, settings)  { save(k('fin_settings', uid), settings) }

export function loadBesteiras(uid)           { return load(k('fin_besteiras', uid), null) }
export function saveBesteiras(uid, cfg)      { save(k('fin_besteiras', uid), cfg) }

// Status de pagamentos (checkbox pago/recebido por txId_YYYY-MM)
export function loadPaymentStatus(uid)       { return load(k('fin_payment_status', uid), {}) }
export function savePaymentStatus(uid, map)  { save(k('fin_payment_status', uid), map) }
