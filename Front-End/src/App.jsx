import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import AboutPage from './pages/AboutPage'
import GameDetailsPage from './pages/GameDetailsPage'
import GameFormPage from './pages/GameFormPage'
import LibraryPage from './pages/LibraryPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import { api, clearToken, getToken, saveToken, setSessionExpiredHandler } from './services/api'
import './App.css'

// layout das paginas logadas
function Layout({ user, onLogout, loggingOut }) {
  return (
    <>
      <Header user={user} onLogout={onLogout} loggingOut={loggingOut} />
      <main className="container">
        <Outlet />
      </main>
    </>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(() => Boolean(getToken()))
  const [loggingOut, setLoggingOut] = useState(false)
  // aviso da tela de login (sessao expirada, logout)
  const [loginNotice, setLoginNotice] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // sem usuario as paginas privadas ja mandam pro /entrar
    setSessionExpiredHandler(() => {
      setLoginNotice({ type: 'error', text: 'Sua sessão expirou. Entre novamente.' })
      setUser(null)
    })
  }, [])

  // se tem token salvo, confere na api se ainda vale
  useEffect(() => {
    if (!getToken()) return

    api
      .currentUser()
      .then((data) => setUser(data.user))
      .catch((error) => {
        if (error.status !== 401) setLoginNotice({ type: 'error', text: error.message })
      })
      .finally(() => setCheckingSession(false))
  }, [])

  function handleAuthenticated(data) {
    saveToken(data.token)
    setLoginNotice(null)
    setUser(data.user)
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await api.logout()
    } catch {
      // mesmo se a api falhar, sai igual
    }
    clearToken()
    setLoginNotice({ type: 'success', text: 'Você saiu da sua conta.' })
    setUser(null)
    setLoggingOut(false)
    navigate('/entrar')
  }

  if (checkingSession) {
    return <p className="state state--screen">Carregando…</p>
  }

  // pagina privada: sem login vai pro /entrar e depois volta pra onde tava.
  // se saiu ou a sessao expirou, o proximo login começa pela biblioteca
  function privatePage(page) {
    if (user) return page
    return <Navigate to="/entrar" replace state={loginNotice ? null : { from: location.pathname + location.search }} />
  }

  // depois do login volta pra pagina que tentou abrir
  const afterLogin = location.state?.from ?? '/'

  return (
    <Routes>
      <Route
        path="/entrar"
        element={user ? <Navigate to={afterLogin} replace /> : <LoginPage notice={loginNotice} onLogin={handleAuthenticated} />}
      />
      <Route path="/cadastro" element={user ? <Navigate to="/" replace /> : <RegisterPage onRegister={handleAuthenticated} />} />

      <Route element={<Layout user={user} onLogout={handleLogout} loggingOut={loggingOut} />}>
        <Route index element={privatePage(<LibraryPage />)} />
        <Route path="jogos/novo" element={privatePage(<GameFormPage />)} />
        <Route path="jogos/:id" element={privatePage(<GameDetailsPage />)} />
        <Route path="jogos/:id/editar" element={privatePage(<GameFormPage />)} />
        <Route path="quem-somos" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
