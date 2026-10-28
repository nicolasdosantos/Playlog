import Brand from './Brand'
import Icon from './Icon'

function initials(name) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

function Header({ user, onLogout, loggingOut }) {
  return (
    <header className="header">
      <div className="header__inner">
        <Brand />

        <nav className="header__nav" aria-label="Navegação principal">
          <span className="header__link" aria-current="page">
            Catálogo
          </span>
        </nav>

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
      </div>
    </header>
  )
}

export default Header
