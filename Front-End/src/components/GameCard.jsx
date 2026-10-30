import { Link } from 'react-router-dom'
import Cover from './Cover'
import Icon from './Icon'
import Stars from './Stars'
import StatusBadge from './StatusBadge'
import { formatHours } from '../library'

function GameCard({ entry, linkState, onDelete }) {
  const { game } = entry

  return (
    <article className="game-card">
      <div className="game-card__media">
        <Cover title={game.title} url={game.cover_url} className="game-card__cover" />
        <StatusBadge status={entry.status} className="game-card__status" />
      </div>

      <div className="game-card__body">
        {/* titulo grande corta com ... e aparece inteiro no hover */}
        <h3 className="game-card__title" title={game.title}>
          {/* o link cobre o card todo (::after no css) */}
          <Link to={`/jogos/${entry.id}`} state={linkState} className="game-card__link">
            {game.title}
          </Link>
        </h3>

        <div className="game-card__info">
          {entry.rating === null ? (
            <span className="game-card__no-rating">Sem nota</span>
          ) : (
            <span className="game-card__rating">
              <Stars rating={entry.rating} size={14} />
              <span className="game-card__score">{entry.rating}/10</span>
            </span>
          )}
          <span className="game-card__hours">
            <Icon name="clock" size={14} />
            {formatHours(entry.hours_played)} h
          </span>
        </div>
      </div>

      <div className="game-card__actions">
        <Link to={`/jogos/${entry.id}/editar`} state={linkState} className="card-action">
          <Icon name="edit" size={16} />
          Editar
        </Link>
        <button type="button" className="card-action card-action--danger" onClick={() => onDelete(entry)}>
          <Icon name="trash" size={16} />
          Excluir
        </button>
      </div>
    </article>
  )
}

export default GameCard
