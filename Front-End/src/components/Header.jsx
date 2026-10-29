import { Link, NavLink } from 'react-router-dom'
import Brand from './Brand'
import Icon from './Icon'
import { initials } from '../library'

function Header({ user, onLogout, loggingOut }) {
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__brand" aria-label="Playlog, ir para a biblioteca">
          <Brand />
        </Link>

        <nav className="header__nav" aria-label="Navegação principal">
          {user && (
            <NavLink to="/" end className="header__link">
              Biblioteca
            </NavLink>
          )}
          <NavLink to="/quem-somos" className="header__link">
            Quem somos
          </NavLink>
        </nav>

        {user ? (
          <div className="header__user">
            <span className="avatar" aria-hidden="true">
              {initials(user.name)}
            </span>
            <span className="header__name" title={user.email}>
              {user.name}
            </span>
            <button type="button" className="button button--ghost button--small" onClick={onLogout} disabled={loggingOut}>
              <Icon name="logout" size={16} />
              {loggingOut ? 'Saindo…' : 'Sair'}
            </button>
          </div>
        ) : (
          <Link to="/entrar" className="button button--primary button--small">
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header
