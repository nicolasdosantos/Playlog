import { statusLabel } from '../library'

// selo do status (a cor ta no css)
function StatusBadge({ status, className = '' }) {
  return (
    <span className={`status status--${status} ${className}`}>
      <span className="status__dot" aria-hidden="true" />
      {statusLabel(status)}
    </span>
  )
}

export default StatusBadge
