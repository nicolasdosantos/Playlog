import Brand, { BrandMark } from './Brand'
import Cover from './Cover'

// Palavras do mural decorativo: gêneros genéricos, nenhum jogo de verdade
const WALL = [
  ['RPG', 'Corrida', 'Puzzle', 'Terror'],
  ['Plataforma', 'Luta', 'Aventura', 'Indie'],
  ['Estratégia', 'Tiro', 'Simulação', 'Esportes'],
]

function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth">
      <section className="auth__showcase">
        <Brand size="large" />
        <p className="auth__pitch">Sua estante de jogos, organizada.</p>
        <p className="auth__pitch-sub">Capa, gênero e plataforma de cada título, num lugar só.</p>

        <div className="poster-wall" aria-hidden="true">
          {WALL.map((column, c) => (
            <div key={c} className="poster-wall__column">
              {column.map((word, r) => (
                <div key={word} className="poster-wall__item" style={{ '--i': c * 2 + r }}>
                  <Cover title={word} />
                </div>
              ))}
            </div>
          ))}
        </div>
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
      </section>
    </main>
  )
}

export default AuthLayout
