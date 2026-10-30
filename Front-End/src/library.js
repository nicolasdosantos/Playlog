// mesmos status da api (UserGame::STATUSES)
export const STATUSES = [
  { value: 'want_to_play', label: 'Quero jogar' },
  { value: 'playing', label: 'Jogando' },
  { value: 'paused', label: 'Pausado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'abandoned', label: 'Abandonado' },
]

export function statusLabel(value) {
  return STATUSES.find((status) => status.value === value)?.label ?? value
}

// 12.5 -> "12,5"
export function formatHours(hours) {
  return Number(hours).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

// "2017-02-24" -> "24 de fevereiro de 2017" (monta a data local pra nao mudar o dia por causa do fuso)
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// iniciais pro avatar ("Ana Souza" -> "AS")
export function initials(name) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}
