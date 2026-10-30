import { cloneElement, useId } from 'react'

// campo do login/cadastro, baseado no form "sharp-panda-27" do Uiverse (JkHuger, licenca MIT)
function AuthField({ label, error, hint, children }) {
  const id = useId()
  const describedBy = error ? `${id}-erro` : hint ? `${id}-dica` : undefined

  return (
    <div className={`auth-field${error ? ' auth-field--error' : ''}`}>
      <div className="auth-field__box">
        {cloneElement(children, {
          id,
          className: 'auth-field__input',
          // precisa de placeholder pro label subir (o css usa :placeholder-shown)
          placeholder: children.props.placeholder ?? ' ',
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
        })}
        <label className="auth-field__label" htmlFor={id}>
          {label}
        </label>
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
