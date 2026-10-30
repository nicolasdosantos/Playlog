import { Link } from 'react-router-dom'
import Brand from './Brand'

// Telas de login e cadastro: logo, uma frase curta e o formulário num card no centro da tela
function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth">
      <div className="auth__panel">
        <div className="auth__brand">
          <Brand size="large" />
          <p className="auth__tagline">Sua estante de jogos, organizada.</p>
        </div>

        <section className="auth__card" aria-labelledby="auth-title">
          <h1 id="auth-title" className="auth__title">
            {title}
          </h1>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
        </section>

        <Link to="/quem-somos" className="auth__about">
          Quem somos
        </Link>
      </div>
    </main>
  )
}

export default AuthLayout
