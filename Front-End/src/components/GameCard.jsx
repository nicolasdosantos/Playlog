import Cover from './Cover'
import Icon from './Icon'

function GameCard({ game, onEdit, onDelete, deleting }) {
  const year = game.release_date ? game.release_date.slice(0, 4) : null
  const platforms = game.platforms.map((platform) => platform.name).join(', ')

  return (
    <article className={`game-card${deleting ? ' game-card--busy' : ''}`}>
      <div className="game-card__media">
        <Cover title={game.title} url={game.cover_url} className="game-card__cover" />

        <div className="game-card__actions">
          <button type="button" className="icon-button" onClick={() => onEdit(game)} title="Editar" disabled={deleting}>
            <Icon name="edit" size={17} />
            <span className="visually-hidden">Editar {game.title}</span>
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            onClick={() => onDelete(game)}
            title="Excluir"
            disabled={deleting}
          >
            <Icon name="trash" size={17} />
            <span className="visually-hidden">Excluir {game.title}</span>
          </button>
        </div>
      </div>

      <div className="game-card__body">
        <h3 className="game-card__title">{game.title}</h3>
        <p className="game-card__meta">
          <span>{year ?? 'Sem data'}</span>
          {platforms && <span className="game-card__platforms">{platforms}</span>}
        </p>

        {game.genres.length > 0 && (
          <ul className="tags" aria-label="Gêneros">
            {game.genres.map((genre) => (
              <li key={genre.id} className="tag">
                {genre.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

export default GameCard
