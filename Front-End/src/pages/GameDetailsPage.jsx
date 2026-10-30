import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import Cover from '../components/Cover'
import Icon from '../components/Icon'
import Stars from '../components/Stars'
import StatusBadge from '../components/StatusBadge'
import Toast from '../components/Toast'
import { formatDate, formatHours } from '../library'
import { api } from '../services/api'

function GameDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  // url da biblioteca com os filtros (vem do card)
  const libraryBack = location.state?.back ?? '/'

  const [entry, setEntry] = useState(null)
  const [loadError, setLoadError] = useState(null)
  // aviso que vem do form depois de editar
  const [toast, setToast] = useState(location.state?.notice ?? null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const closeToast = useCallback(() => setToast(null), [])

  // tira o aviso do historico pra nao aparecer de novo no F5
  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: { back: location.state.back } })
    }
  }, [location, navigate])

  useEffect(() => {
    let ignore = false

    api
      .getEntry(id)
      .then((data) => {
        if (!ignore) setEntry(data.entry)
      })
      .catch((error) => {
        if (!ignore) setLoadError(error)
      })

    return () => {
      ignore = true
    }
  }, [id])

  async function confirmDelete() {
    setDeleting(true)

    try {
      await api.deleteEntry(entry.id)
      navigate(libraryBack, { state: { notice: { type: 'success', text: `"${entry.game.title}" foi removido da sua biblioteca.` } } })
    } catch (error) {
      setToast({ type: 'error', text: error.message })
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  if (loadError) {
    const notFound = loadError.status === 404
    return (
      <div className="state state--error" role="alert">
        <p className="state__title">{notFound ? 'Jogo não encontrado.' : 'Não foi possível abrir o jogo.'}</p>
        <p>{notFound ? 'Ele pode ter sido excluído ou não pertence à sua biblioteca.' : loadError.message}</p>
        <Link to={libraryBack} className="button">
          Voltar à biblioteca
        </Link>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="details" aria-busy="true" aria-label="Carregando jogo">
        <div className="details__hero">
          <div className="skeleton skeleton--cover details__cover" />
          <div className="details__main">
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--short" />
          </div>
        </div>
      </div>
    )
  }

  const { game } = entry

  return (
    <article className="details" aria-labelledby="details-title">
      <Link to={libraryBack} className="back-link">
        <Icon name="chevronLeft" size={16} />
        Voltar à biblioteca
      </Link>

      <div className="details__hero">
        {/* capa borrada no fundo */}
        {game.cover_url && <div className="details__backdrop" style={{ backgroundImage: `url("${game.cover_url}")` }} aria-hidden="true" />}

        <Cover title={game.title} url={game.cover_url} className="details__cover" />

        <div className="details__main">
          <StatusBadge status={entry.status} className="details__status" />
          <h1 id="details-title" className="details__title">
            {game.title}
          </h1>
          <p className="details__release">
            {game.release_date ? `Lançado em ${formatDate(game.release_date)}` : 'Data de lançamento não informada'}
          </p>

          <dl className="details__stats">
            <div className="details__stat">
              <dt>Sua nota</dt>
              <dd>
                {entry.rating === null ? (
                  <span className="details__empty">Sem avaliação</span>
                ) : (
                  <span className="details__rating">
                    <Stars rating={entry.rating} size={22} />
                    <span className="details__score">
                      {entry.rating}
                      <small>/10</small>
                    </span>
                  </span>
                )}
              </dd>
            </div>
            <div className="details__stat">
              <dt>Horas jogadas</dt>
              <dd className="details__hours">
                <Icon name="clock" size={20} />
                {formatHours(entry.hours_played)}
                <small>h</small>
              </dd>
            </div>
          </dl>

          <div className="details__actions">
            {/* depois de salvar o form volta pra ca */}
            <Link
              to={`/jogos/${entry.id}/editar`}
              state={{ back: location.pathname, libraryBack }}
              className="button button--primary"
            >
              <Icon name="edit" size={17} />
              Editar
            </Link>
            <button type="button" className="button button--ghost details__delete" onClick={() => setConfirmingDelete(true)}>
              <Icon name="trash" size={17} />
              Excluir
            </button>
          </div>
        </div>
      </div>

      <div className="details__content">
        <section className="details__section" aria-labelledby="details-about">
          <h2 id="details-about" className="details__heading">
            Sobre o jogo
          </h2>
          {game.description ? (
            <p className="details__description">{game.description}</p>
          ) : (
            <p className="details__empty">Nenhuma descrição cadastrada.</p>
          )}
        </section>

        <section className="details__section" aria-label="Gêneros e plataformas">
          <h2 className="details__heading">
            Gêneros
          </h2>
          {game.genres.length > 0 ? (
            <ul className="tags details__tags">
              {game.genres.map((genre) => (
                <li key={genre.id} className="tag">
                  {genre.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="details__empty">Nenhum gênero informado.</p>
          )}

          <h2 className="details__heading">
            Plataformas
          </h2>
          {game.platforms.length > 0 ? (
            <ul className="tags details__tags">
              {game.platforms.map((platform) => (
                <li key={platform.id} className="tag tag--platform">
                  {platform.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="details__empty">Nenhuma plataforma informada.</p>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir jogo?"
        confirmLabel="Excluir"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      >
        <p>
          <strong>{game.title}</strong> será removido da sua biblioteca, junto com o status, as horas e a nota. Essa ação não
          pode ser desfeita.
        </p>
      </ConfirmDialog>

      <Toast toast={toast} onClose={closeToast} />
    </article>
  )
}

export default GameDetailsPage
