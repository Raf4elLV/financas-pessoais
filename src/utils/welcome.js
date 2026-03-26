function timeGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Bom dia'
  if (h >= 12 && h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function dayOfYear() {
  const now = new Date()
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5)
}

const RETURN_MESSAGES = [
  (name, t) => `${t}, ${name}!`,
  (name, t) => `Bem-vindo de volta, ${name}!`,
  (name, t) => `Que bom que voltou, ${name}!`,
  (name, t) => `${t}, ${name}! Tudo certo por aqui.`,
  (name, t) => `Olá, ${name}! Que bom te ver.`,
  (name, t) => `De volta ao controle, ${name}!`,
  (name, t) => `${t}, ${name}! Vamos ver como estão suas finanças.`,
  (name, t) => `Que bom estar de volta, ${name}!`,
  (name, t) => `${t}, ${name}! Pronto para organizar as finanças?`,
]

/**
 * Retorna a mensagem de saudação personalizada.
 * Na primeira visita após o cadastro exibe boas-vindas especial.
 * Nas visitas seguintes roda um conjunto de mensagens variadas por dia.
 */
export function getWelcomeMessage(firstName, userId) {
  const key = `fin_visited_${userId}`
  const visited = localStorage.getItem(key) === 'true'
  const t = timeGreeting()

  if (!visited) {
    try { localStorage.setItem(key, 'true') } catch {}
    return `${t}, ${firstName}! Seja bem-vindo 👋`
  }

  const fn = RETURN_MESSAGES[dayOfYear() % RETURN_MESSAGES.length]
  return fn(firstName, t)
}
