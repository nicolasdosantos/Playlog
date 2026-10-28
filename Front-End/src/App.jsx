import { useEffect, useState } from 'react'
import Header from './components/Header'
import GameFormPage from './pages/GameFormPage'
import GamesPage from './pages/GamesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { api, clearToken, getToken, saveToken, setSessionExpiredHandler } from './services/api'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(() => Boolean(getToken()))
  const [page, setPage] = useState('login')
  const [editingGame, setEditingGame] = useState(null)
  const [notice, setNotice] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  function navigate(nextPage, message = null) {
    setNotice(message)
    setPage(nextPage)
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null)
      setEditingGame(null)
      setNotice({ type: 'error', text: 'Sua sessão expirou. Entre novamente.' })
      setPage('login')
    })
  }, [])

  // Se já existe um token salvo, confere com a API se ele ainda vale antes de mostrar o catálogo
  useEffect(() => {
    if (!getToken()) return

    api
      .currentUser()
      .then((data) => {
        setUser(data.user)
        setPage('games')
      })
      .catch((error) => {
        if (error.status !== 401) setNotice({ type: 'error', text: error.message })
      })
      .finally(() => setCheckingSession(false))
  }, [])

  function handleAuthenticated(data) {
    saveToken(data.token)
    setUser(data.user)
    navigate('games')
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await api.logout()
    } catch {
      // Mesmo se a API falhar, o token é apagado do navegador e o usuário sai
    }
    clearToken()
    setUser(null)
    setLoggingOut(false)
    navigate('login', { type: 'success', text: 'Você saiu da sua conta.' })
  }

  if (checkingSession) {
    return <p className="state state--screen">Carregando…</p>
  }

  if (!user) {
    return page === 'register' ? (
      <RegisterPage onRegister={handleAuthenticated} onGoToLogin={() => navigate('login')} />
    ) : (
      <LoginPage key={notice?.text} notice={notice} onLogin={handleAuthenticated} onGoToRegister={() => navigate('register')} />
    )
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} loggingOut={loggingOut} />
      <main className="container">
        {page === 'game-form' ? (
          <GameFormPage
            key={editingGame?.id ?? 'novo'}
            game={editingGame}
            onSaved={(text) => {
              setEditingGame(null)
              navigate('games', { type: 'success', text })
            }}
            onCancel={() => {
              setEditingGame(null)
              navigate('games')
            }}
          />
        ) : (
          <GamesPage
            notice={notice}
            onCreate={() => {
              setEditingGame(null)
              navigate('game-form')
            }}
            onEdit={(game) => {
              setEditingGame(game)
              navigate('game-form')
            }}
          />
        )}
      </main>
    </>
  )
}

export default App
