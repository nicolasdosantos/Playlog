import { useEffect, useRef } from 'react'

// confirmacao usando o <dialog> do html
function ConfirmDialog({ open, title, children, confirmLabel, busy, onConfirm, onCancel }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function handleCancel(event) {
    // o esc fecha sozinho, entao controla pelo estado
    event.preventDefault()
    if (!busy) onCancel()
  }

  return (
    <dialog ref={dialogRef} className="dialog" onCancel={handleCancel} aria-labelledby="dialog-title">
      <h2 id="dialog-title" className="dialog__title">
        {title}
      </h2>
      <div className="dialog__text">{children}</div>
      <div className="dialog__actions">
        <button type="button" className="button button--ghost" onClick={onCancel} disabled={busy} autoFocus>
          Cancelar
        </button>
        <button type="button" className="button button--danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Excluindo…' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
