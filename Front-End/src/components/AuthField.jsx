import { cloneElement, useId } from 'react'
import Icon from './Icon'

// Campo das telas de login e cadastro: ícone à esquerda e rótulo acima do texto, num bloco só
function AuthField({ icon, label, error, hint, children }) {
  const id = useId()
  const describedBy = error ? `${id}-erro` : hint ? `${id}-dica` : undefined

  return (
    <div className={`auth-field${error ? ' auth-field--error' : ''}`}>
      <div className="auth-field__group">
        <span className="auth-field__icon" aria-hidden="true">
          <Icon name={icon} size={17} />
        </span>
        <div className="auth-field__content">
          <label className="auth-field__label" htmlFor={id}>
            {label}
          </label>
          {cloneElement(children, {
            id,
            className: 'auth-field__input',
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy,
          })}
        </div>
      </div>
      {hint && !error && (
        <span id={`${id}-dica`} className="field__hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-erro`} className="field__error">
          {error}
        </span>
      )}
    </div>
  )
}

export default AuthField
