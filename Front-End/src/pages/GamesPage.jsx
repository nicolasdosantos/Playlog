import { useCallback, useEffect, useState } from 'react'
import GameCard from '../components/GameCard'
import Icon from '../components/Icon'
import Toast from '../components/Toast'
import { api } from '../services/api'

function countText(total) {
  if (!total) return 'A estante ainda está vazia.'
  return `${total} ${total === 1 ? 'jogo' : 'jogos'} na estante, em ordem alfabética.`
}

function GamesPage({ notice, onCreate, onEdit }) {
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [toast, setToast] = useState(notice)
  const [deletingId, setDeletingId] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    let ignore = false

    api
      .listGames(page)
      .then((data) => {
        if (!ignore) {
          setResult(data)
          setLoadError('')
        }
      })
      .catch((error) => {
        if (!ignore) setLoadError(error.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [page, reloadKey])

  function goToPage(number) {
    setLoading(true)
    setPage(number)
    window.scrollTo({ top: 0 })
  }

  function reload() {
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  async function handleDelete(game) {
    if (!window.confirm(`Excluir "${game.title}" do catálogo?`)) {
      return
    }

    setDeletingId(game.id)
    setToast(null)

    try {
      await api.deleteGame(game.id)
      setToast({ type: 'success', text: `"${game.title}" foi excluído do catálogo.` })

      // Se era o último jogo da página, volta para a anterior
      if (result.data.length === 1 && page > 1) {
        goToPage(page - 1)
      } else {
        reload()
      }
    } catch (error) {
      setToast({ type: 'error', text: error.message })
    } finally {
      setDeletingId(null)
    }
  }

  const games = result?.data ?? []
  const meta = result?.meta
  const isEmpty = !loadError && result && games.length === 0

  return (
    <section className="catalog" aria-labelledby="games-title">
      <div className="catalog__intro page-header">
        <div>
          <h1 id="games-title" className="catalog__title page-header__title">
            Catálogo
          </h1>
          {/* Com erro, a contagem some: a caixa de erro abaixo já explica o que aconteceu */}
          {!loadError && (
            <p className="catalog__count page-header__subtitle">{result ? countText(meta?.total) : 'Carregando a estante…'}</p>
          )}
        </div>
        {!isEmpty && (
          <button type="button" className="button button--primary" onClick={onCreate}>
            <Icon name="plus" />
            Adicionar jogo
          </button>
        )}
      </div>

      {loading && !result && !loadError && (
        <div className="games-grid" aria-busy="true" aria-label="Carregando jogos">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton--cover" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line skeleton--short" />
            </div>
          ))}
        </div>
      )}

      {loadError && (
        <div className="state state--error" role="alert">
          <p className="state__title">Não foi possível carregar o catálogo.</p>
          <p>{loadError}</p>
          <button type="button" className="button" onClick={reload}>
            Tentar novamente
          </button>
        </div>
      )}

      {isEmpty && (
        <div className="empty-shelf">
          <div className="empty-shelf__slots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="empty-shelf__text">
            <h2 className="state__title">Nenhum jogo cadastrado ainda.</h2>
            <p>Comece pelo título. Capa, data, gêneros e plataformas são opcionais e podem ser preenchidos depois.</p>
            <button type="button" className="button button--primary" onClick={onCreate}>
              <Icon name="plus" />
              Adicionar o primeiro jogo
            </button>
          </div>
        </div>
      )}

      {!loadError && games.length > 0 && (
        <div className={`games-grid${loading ? ' games-grid--loading' : ''}`} aria-busy={loading}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={onEdit}
              onDelete={handleDelete}
              deleting={deletingId === game.id}
            />
          ))}
        </div>
      )}

      {!loadError && meta && meta.last_page > 1 && (
        <nav className="pagination" aria-label="Páginas do catálogo">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1 || loading}
          >
            <Icon name="chevronLeft" />
            Anterior
          </button>
          <span className="pagination__info">
            Página {meta.current_page} de {meta.last_page}
          </span>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => goToPage(page + 1)}
            disabled={page === meta.last_page || loading}
          >
            Próxima
            <Icon name="chevronRight" />
          </button>
        </nav>
      )}

      <Toast toast={toast} onClose={closeToast} />
    </section>
  )
}

export default GamesPage
