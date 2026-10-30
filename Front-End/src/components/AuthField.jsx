import { cloneElement, useId } from 'react'

// Campo das telas de login e cadastro, adaptado do formulário "sharp-panda-27" do Uiverse (JkHuger, licença MIT):
// borda em "L" e um rótulo que fica dentro do campo e sobe como uma etiqueta no foco ou quando há texto.
function AuthField({ label, error, hint, children }) {
  const id = useId()
  const describedBy = error ? `${id}-erro` : hint ? `${id}-dica` : undefined

  return (
    <div className={`auth-field${error ? ' auth-field--error' : ''}`}>
      <div className="auth-field__box">
        {cloneElement(children, {
          id,
          className: 'auth-field__input',
          // O rótulo sobe quando o placeholder deixa de aparecer (campo com texto), por isso todo campo precisa de um
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
