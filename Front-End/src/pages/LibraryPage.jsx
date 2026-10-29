import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import GameCard from '../components/GameCard'
import Icon from '../components/Icon'
import Toast from '../components/Toast'
import { STATUSES } from '../library'
import { api } from '../services/api'

function countText(total, filtering) {
  if (filtering) return `${total} ${total === 1 ? 'jogo encontrado' : 'jogos encontrados'}.`
  if (!total) return 'Sua biblioteca ainda está vazia.'
  return `${total} ${total === 1 ? 'jogo' : 'jogos'} na sua biblioteca.`
}

function LibraryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  // Busca, status e página ficam na URL: atualizar a página ou voltar no navegador mantém os filtros
  const [params, setParams] = useSearchParams()
  const search = params.get('busca') ?? ''
  const status = params.get('status') ?? ''
  const page = Number(params.get('pagina')) || 1

  // O campo de busca tem um estado próprio: se ele lesse direto da URL, o cursor pularia para o fim ao digitar
  const [searchText, setSearchText] = useState(search)
  // Se a busca da URL mudar por fora (voltar/avançar do navegador ou "Limpar filtros"), o campo acompanha
  const [lastUrlSearch, setLastUrlSearch] = useState(search)
  if (search !== lastUrlSearch) {
    setLastUrlSearch(search)
    setSearchText(search)
  }

  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  // Aviso enviado pelo formulário ao salvar (ex.: "Jogo adicionado")
  const [toast, setToast] = useState(location.state?.notice ?? null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const closeToast = useCallback(() => setToast(null), [])

  // Tira o aviso do histórico; sem isso, ele apareceria de novo ao atualizar a página
  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname + location.search, { replace: true, state: null })
    }
  }, [location, navigate])

  // A busca só vai para a URL (e para a API) quando a pessoa para de digitar
  useEffect(() => {
    if (searchText === search) return

    const timer = setTimeout(() => {
      // Parte da URL atual do navegador, para não desfazer um filtro clicado durante a espera
      const next = new URLSearchParams(window.location.search)
      if (searchText) next.set('busca', searchText)
      else next.delete('busca')
      next.delete('pagina')
      setLoading(true)
      // replace: cada busca não vira uma entrada nova no histórico do navegador
      setParams(next, { replace: true })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchText, search, setParams])

  useEffect(() => {
    let ignore = false

    api
      .listLibrary({ search, status, page })
      .then((result) => {
        if (ignore) return
        setData(result)
        setLoadError('')
      })
      .catch((error) => {
        if (!ignore) setLoadError(error.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    // Se os filtros mudarem antes da resposta, a resposta antiga é ignorada
    return () => {
      ignore = true
    }
  }, [search, status, page, reloadKey])

  function reload() {
    setLoading(true)
    setLoadError('')
    setReloadKey((key) => key + 1)
  }

  function updateParams(changes) {
    // Parte da URL atual do navegador, para não desfazer uma busca que acabou de ser aplicada
    const current = new URLSearchParams(window.location.search)
    const next = new URLSearchParams(current)
    for (const [name, value] of Object.entries(changes)) {
      if (value) next.set(name, value)
      else next.delete(name)
    }
    // Clicar no filtro que já está ativo não muda nada (nem dispara outra busca)
    if (next.toString() === current.toString()) return

    setLoading(true)
    setParams(next)
  }

  function goToPage(number) {
    updateParams({ pagina: number > 1 ? number : null })
    window.scrollTo({ top: 0 })
  }

  async function confirmDelete() {
    setDeleting(true)

    try {
      await api.deleteEntry(toDelete.id)
      setToast({ type: 'success', text: `"${toDelete.game.title}" foi removido da sua biblioteca.` })

      // Se era o último jogo da página, volta para a anterior
      if (games.length === 1 && page > 1) {
        goToPage(page - 1)
      } else {
        reload()
      }
    } catch (error) {
      setToast({ type: 'error', text: error.message })
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const games = data?.data ?? []
  const counts = data?.meta.status_counts
  const totalInLibrary = counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : 0
  const filtering = Boolean(search || status)
  const firstLoad = !data && !loadError

  return (
    <section className="library" aria-labelledby="library-title">
      <div className="page-intro page-header">
        <div>
          <h1 id="library-title" className="page-intro__title page-header__title">
            Biblioteca
          </h1>
          <p className="page-intro__count page-header__subtitle">
            {data ? countText(data.meta.total, filtering) : 'Carregando a sua biblioteca…'}
          </p>
        </div>
        <Link to="/jogos/novo" state={{ back: `/?${params}` }} className="button button--primary">
          <Icon name="plus" />
          Adicionar jogo
        </Link>
      </div>

      <div className="library-toolbar">
        <label className="search-field">
          <Icon name="search" />
          <span className="visually-hidden">Buscar pelo título</span>
          <input
            type="search"
            placeholder="Buscar pelo título…"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </label>

        <div className="status-filter" role="group" aria-label="Filtrar por status">
          <button
            type="button"
            className="status-filter__option"
            aria-pressed={!status}
            onClick={() => updateParams({ status: null, pagina: null })}
          >
            Todos
            {counts && <span className="status-filter__count">{totalInLibrary}</span>}
          </button>
          {STATUSES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`status-filter__option status-filter__option--${option.value}`}
              aria-pressed={status === option.value}
              onClick={() => updateParams({ status: option.value, pagina: null })}
            >
              {option.label}
              {counts && <span className="status-filter__count">{counts[option.value]}</span>}
            </button>
          ))}
        </div>
      </div>

      {firstLoad && (
        <div className="games-grid" aria-busy="true" aria-label="Carregando jogos">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton--cover" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line skeleton--short" />
            </div>
          ))}
        </div>
      )}

      {loadError && !loading && (
        <div className="state state--error" role="alert">
          <p className="state__title">Não foi possível carregar a biblioteca.</p>
          <p>{loadError}</p>
          <button type="button" className="button" onClick={reload}>
            Tentar novamente
          </button>
        </div>
      )}

      {data && games.length === 0 && !filtering && (
        <div className="empty-shelf">
          <div className="empty-shelf__slots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="empty-shelf__text">
            <h2 className="state__title">Nenhum jogo na biblioteca ainda.</h2>
            <p>Comece pelo título. Capa, gêneros, plataformas, horas e nota podem ser preenchidos depois.</p>
            <Link to="/jogos/novo" className="button button--primary">
              <Icon name="plus" />
              Adicionar o primeiro jogo
            </Link>
          </div>
        </div>
      )}

      {data && games.length === 0 && filtering && (
        <div className="state">
          <p className="state__title">Nenhum jogo encontrado.</p>
          <p>Tente outro título ou escolha outro status.</p>
          <button type="button" className="button" onClick={() => updateParams({ busca: null, status: null, pagina: null })}>
            Limpar filtros
          </button>
        </div>
      )}

      {games.length > 0 && (
        <div className={`games-grid${loading ? ' games-grid--loading' : ''}`} aria-busy={loading}>
          {games.map((entry) => (
            <GameCard key={entry.id} entry={entry} linkState={{ back: `/?${params}` }} onDelete={setToDelete} />
          ))}
        </div>
      )}

      {data && data.meta.last_page > 1 && (
        <nav className="pagination" aria-label="Páginas da biblioteca">
          <button type="button" className="button button--ghost" onClick={() => goToPage(page - 1)} disabled={page === 1 || loading}>
            <Icon name="chevronLeft" />
            Anterior
          </button>
          <span className="pagination__info">
            Página {data.meta.current_page} de {data.meta.last_page}
          </span>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => goToPage(page + 1)}
            disabled={page === data.meta.last_page || loading}
          >
            Próxima
            <Icon name="chevronRight" />
          </button>
        </nav>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir jogo?"
        confirmLabel="Excluir"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p>
          <strong>{toDelete?.game.title}</strong> será removido da sua biblioteca, junto com o status, as horas e a nota.
          Essa ação não pode ser desfeita.
        </p>
      </ConfirmDialog>

      <Toast toast={toast} onClose={closeToast} />
    </section>
  )
}

export default LibraryPage
