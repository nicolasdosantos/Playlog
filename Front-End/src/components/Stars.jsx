// desenho da estrela
const STAR_PATH = 'M12 2.6l2.85 5.95 6.5.85-4.75 4.55 1.18 6.45L12 17.3l-5.78 3.1 1.18-6.45-4.75-4.55 6.5-.85Z'

function StarShape({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={STAR_PATH} />
    </svg>
  )
}

// nota de 0 a 10 em 5 estrelas (cada ponto = meia estrela)
function Stars({ rating, size = 18 }) {
  return (
    <span className="stars" role="img" aria-label={`Nota ${rating} de 10`}>
      {[1, 2, 3, 4, 5].map((position) => {
        // quanto dessa estrela pinta: 0, 50% ou 100%
        const fill = Math.min(Math.max(rating / 2 - (position - 1), 0), 1) * 100

        return (
          <span key={position} className="star">
            <StarShape size={size} />
            <span className="star__fill" style={{ width: `${fill}%` }}>
              <StarShape size={size} />
            </span>
          </span>
        )
      })}
    </span>
  )
}

export default Stars
