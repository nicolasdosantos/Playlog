import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import AboutPage from './pages/AboutPage'
import GameFormPage from './pages/GameFormPage'
import LibraryPage from './pages/LibraryPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import { api, clearToken, getToken, saveToken, setSessionExpiredHandler } from './services/api'
import './App.css'

// Cabeçalho e área de conteúdo das páginas internas
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
  // Aviso mostrado na tela de login (sessão expirada, logout...)
  const [loginNotice, setLoginNotice] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Sem usuário, as páginas protegidas já redirecionam para /entrar
    setSessionExpiredHandler(() => {
      setLoginNotice({ type: 'error', text: 'Sua sessão expirou. Entre novamente.' })
      setUser(null)
    })
  }, [])

  // Se já existe um token salvo, confere com a API se ele ainda vale antes de mostrar a biblioteca
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
      // Mesmo se a API falhar, o token é apagado do navegador e o usuário sai
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

  // Páginas que exigem login: sem usuário, vai para a tela de entrar e depois volta para onde estava.
  // Depois de sair ou de a sessão expirar (há um aviso de login), o próximo login começa pela biblioteca:
  // quem entrar depois não deve cair na última página da pessoa que saiu.
  function privatePage(page) {
    if (user) return page
    return <Navigate to="/entrar" replace state={loginNotice ? null : { from: location.pathname + location.search }} />
  }

  // Depois de entrar, volta para a página que a pessoa tentou abrir (ou para a biblioteca)
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
        <Route path="jogos/:id/editar" element={privatePage(<GameFormPage />)} />
        <Route path="quem-somos" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
