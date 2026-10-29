// Comunicação com a API do Laravel. Todas as requisições passam por request().
const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'
const TOKEN_KEY = 'playlog_token'

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// O App registra aqui o que fazer quando o token deixa de valer (expirado ou inválido)
let onSessionExpired = () => {}

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler
}

function errorMessage(status, data) {
  if (status === 401 && data?.message === 'Unauthenticated.') {
    return 'Sua sessão expirou. Entre novamente.'
  }
  if (status === 422) {
    return 'Confira os campos destacados.'
  }
  if (status === 429) {
    return 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.'
  }
  if (status >= 500) {
    return 'O servidor encontrou um erro. Tente novamente em instantes.'
  }
  return data?.message ?? 'Não foi possível concluir a operação.'
}

// auth: false nas rotas públicas (login e cadastro), que não recebem o token
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  const token = auth ? getToken() : null

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se o servidor está em execução.', 0)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearToken()
      onSessionExpired()
    }
    throw new ApiError(errorMessage(response.status, data), response.status, data?.errors ?? {})
  }

  return data
}

export const api = {
  register: (dados) => request('/register', { method: 'POST', body: dados, auth: false }),
  login: (dados) => request('/login', { method: 'POST', body: dados, auth: false }),
  logout: () => request('/logout', { method: 'POST' }),
  currentUser: () => request('/user'),

  // Biblioteca pessoal: o id usado nas rotas é o da entrada (entry.id)
  listLibrary: ({ search, status, page }) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (page > 1) params.set('page', page)
    return request(`/library?${params}`)
  },
  getEntry: (id) => request(`/library/${id}`),
  createEntry: (dados) => request('/library', { method: 'POST', body: dados }),
  updateEntry: (id, dados) => request(`/library/${id}`, { method: 'PUT', body: dados }),
  deleteEntry: (id) => request(`/library/${id}`, { method: 'DELETE' }),

  listGenres: () => request('/genres'),
  listPlatforms: () => request('/platforms'),
}
