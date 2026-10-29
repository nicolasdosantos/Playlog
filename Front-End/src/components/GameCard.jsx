import { Link } from 'react-router-dom'
import Cover from './Cover'
import Icon from './Icon'
import StatusBadge from './StatusBadge'

function GameCard({ entry, linkState, onDelete }) {
  const { game } = entry
  const editUrl = `/jogos/${entry.id}/editar`
  const year = game.release_date ? game.release_date.slice(0, 4) : 'Sem data'
  const extraGenres = game.genres.length - 2
  const platforms = game.platforms.map((platform) => platform.name).join(' · ')
  const hours = Number(entry.hours_played).toLocaleString('pt-BR', { maximumFractionDigits: 1 })

  return (
    <article className="game-card">
      <div className="game-card__media">
        <Cover title={game.title} url={game.cover_url} className="game-card__cover" />
        <StatusBadge status={entry.status} className="game-card__status" />
        {entry.rating === null ? (
          <span className="game-card__rating game-card__rating--empty">Sem nota</span>
        ) : (
          <span className="game-card__rating" aria-label={`Nota ${entry.rating} de 10`}>
            {entry.rating}
            <small>/10</small>
          </span>
        )}
      </div>

      <div className="game-card__body">
        <h3 className="game-card__title">
          {/* O link cobre o card inteiro (ver .game-card__link::after no CSS) */}
          <Link to={editUrl} state={linkState} className="game-card__link">
            {game.title}
          </Link>
        </h3>
        <p className="game-card__meta">
          <span>{year}</span>
          <span className="game-card__hours">
            <Icon name="clock" size={14} />
            {hours} h
          </span>
        </p>

        {game.genres.length > 0 && (
          <ul className="tags" aria-label="Gêneros">
            {game.genres.slice(0, 2).map((genre) => (
              <li key={genre.id} className="tag">
                {genre.name}
              </li>
            ))}
            {extraGenres > 0 && <li className="tag tag--more">+{extraGenres}</li>}
          </ul>
        )}

        {platforms && (
          <p className="game-card__platforms" title={platforms}>
            {platforms}
          </p>
        )}
      </div>

      <div className="game-card__actions">
        <Link to={editUrl} state={linkState} className="card-action">
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
