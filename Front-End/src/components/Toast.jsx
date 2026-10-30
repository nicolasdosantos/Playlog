import { useEffect } from 'react'
import Icon from './Icon'

// aviso no canto da tela
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    // erro fica mais tempo
    const timer = setTimeout(onClose, toast.type === 'error' ? 9000 : 5000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  return (
    <div className={`toast toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <span className="toast__mark" aria-hidden="true">
        <Icon name={toast.type === 'error' ? 'close' : 'check'} size={14} />
      </span>
      <p className="toast__text">{toast.text}</p>
      <button type="button" className="toast__close" onClick={onClose} aria-label="Fechar aviso">
        <Icon name="close" size={16} />
      </button>
    </div>
  )
}

export default Toast
