import { Link } from 'react-router-dom'
import Brand, { BrandMark } from './Brand'
import TitleScene from './TitleScene'

function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth">
      <TitleScene />

      {/* O logo fica no topo, na mesma margem do cabeçalho das outras telas */}
      <div className="auth__top">
        <Brand size="large" />
      </div>

      <section className="auth__showcase">
        <p className="auth__pitch">Sua estante de jogos, organizada.</p>
        <p className="auth__pitch-sub">Status, horas jogadas e a sua nota para cada jogo, num lugar só.</p>
      </section>

      <section className="auth__form-side" aria-labelledby="auth-title">
        <div className="auth__card">
          <div className="auth__title-section">
            <BrandMark className="auth__title-icon" />
            <h1 id="auth-title" className="auth__title">
              {title}
            </h1>
          </div>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
        </div>
        <Link to="/quem-somos" className="auth__about">
          Quem somos
        </Link>
      </section>
    </main>
  )
}

export default AuthLayout
