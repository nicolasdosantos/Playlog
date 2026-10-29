// Os mesmos valores aceitos pela API (UserGame::STATUSES), com o texto mostrado na tela
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

// Iniciais do nome para o avatar (ex.: "Ana Souza" vira "AS")
export function initials(name) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}
