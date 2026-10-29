import { statusLabel } from '../library'

// Selo com a cor de cada status (as cores ficam no CSS, em .status--<valor>)
function StatusBadge({ status, className = '' }) {
  return (
    <span className={`status status--${status} ${className}`}>
      <span className="status__dot" aria-hidden="true" />
      {statusLabel(status)}
    </span>
  )
}

export default StatusBadge
