import { cloneElement, useId } from 'react'

// label, dica e erro do campo
function Field({ label, error, hint, children }) {
  const id = useId()
  const describedBy = error ? `${id}-erro` : hint ? `${id}-dica` : undefined

  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {cloneElement(children, { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
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

export default Field
