import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Cover from '../components/Cover'
import Field from '../components/Field'
import Icon from '../components/Icon'
import StatusBadge from '../components/StatusBadge'
import { STATUSES } from '../library'
import { api } from '../services/api'

const EMPTY_FORM = {
  title: '',
  description: '',
  release_date: '',
  cover_url: '',
  genres: [],
  platforms: [],
  status: 'want_to_play',
  hours_played: '0',
  rating: '',
}

// converte a entrada da api pros campos do form
function formFromEntry(entry) {
  return {
    title: entry.game.title,
    description: entry.game.description ?? '',
    release_date: entry.game.release_date ?? '',
    cover_url: entry.game.cover_url ?? '',
    genres: entry.game.genres.map((genre) => genre.id),
    platforms: entry.game.platforms.map((platform) => platform.id),
    status: entry.status,
    hours_played: String(entry.hours_played).replace('.', ','),
    rating: entry.rating === null ? '' : String(entry.rating),
  }
}

function OptionGroup({ legend, options, selected, onToggle, emptyText }) {
  return (
    <fieldset className="options">
      <legend className="field__label">{legend}</legend>
      {options.length === 0 ? (
        <p className="field__hint">{emptyText}</p>
      ) : (
        <div className="options__list">
          {options.map((option) => (
            <label key={option.id} className="option">
              {/* checkbox de verdade escondido atras do chip */}
              <input
                className="option__input"
                type="checkbox"
                checked={selected.includes(option.id)}
                onChange={() => onToggle(option.id)}
              />
              <span className="option__check" aria-hidden="true">
                <Icon name="check" size={13} />
              </span>
              <span>{option.name}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  )
}

function GameFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const location = useLocation()
  // volta pra biblioteca (com os filtros) ou pra pagina do jogo
  // libraryBack guarda a url da biblioteca quando vem da pagina do jogo
  const backTo = location.state?.back ?? '/'
  const backState = { back: location.state?.libraryBack }
  const backLabel = backTo.startsWith('/jogos/') ? 'Voltar ao jogo' : 'Voltar à biblioteca'

  const [form, setForm] = useState(EMPTY_FORM)
  // previa da capa so atualiza quando sai do campo
  const [coverPreview, setCoverPreview] = useState('')
  const [options, setOptions] = useState({ genres: [], platforms: [] })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const messageRef = useRef(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let ignore = false

    Promise.all([api.listGenres(), api.listPlatforms(), editing ? api.getEntry(id) : null])
      .then(([genres, platforms, entryData]) => {
        if (ignore) return
        setOptions({ genres: genres.data, platforms: platforms.data })
        if (entryData) {
          setForm(formFromEntry(entryData.entry))
          setCoverPreview(entryData.entry.game.cover_url ?? '')
        }
      })
      .catch((error) => {
        if (!ignore) setLoadError(error)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [editing, id])

  // rola ate o aviso (no celular ele fica longe do botao)
  useEffect(() => {
    if (message) messageRef.current?.scrollIntoView({ block: 'nearest' })
  }, [message])

  // limpa o erro do campo quando edita
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: undefined })
  }

  // marca/desmarca genero ou plataforma
  function toggle(list, optionId) {
    const values = form[list].includes(optionId) ? form[list].filter((value) => value !== optionId) : [...form[list], optionId]
    setForm({ ...form, [list]: values })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSending(true)
    setErrors({})
    setMessage('')

    const data = {
      ...form,
      description: form.description || null,
      release_date: form.release_date || null,
      cover_url: form.cover_url || null,
      // aceita virgula ou ponto, a api quer ponto
      hours_played: form.hours_played === '' ? 0 : form.hours_played.replace(',', '.'),
      rating: form.rating === '' ? null : Number(form.rating),
    }

    try {
      if (editing) {
        await api.updateEntry(id, data)
      } else {
        await api.createEntry(data)
      }
      const text = editing ? `Alterações salvas em "${data.title}".` : `"${data.title}" foi adicionado à sua biblioteca.`
      navigate(backTo, { state: { ...backState, notice: { type: 'success', text } } })
    } catch (error) {
      setErrors(error.errors)
      setMessage(error.message)
      setSending(false)
    }
  }

  if (loadError) {
    const notFound = loadError.status === 404
    return (
      <div className="state state--error" role="alert">
        <p className="state__title">{notFound ? 'Jogo não encontrado.' : 'Não foi possível abrir o formulário.'}</p>
        <p>{notFound ? 'Ele pode ter sido excluído ou não pertence à sua biblioteca.' : loadError.message}</p>
        <Link to="/" className="button">
          Voltar à biblioteca
        </Link>
      </div>
    )
  }

  return (
    <section className="form-page" aria-labelledby="form-title">
      <Link to={backTo} state={backState} className="back-link">
        <Icon name="chevronLeft" size={16} />
        {backLabel}
      </Link>

      <div className="page-header">
        <div>
          <h1 id="form-title" className="page-header__title">
            {editing ? 'Editar jogo' : 'Novo jogo'}
          </h1>
          <p className="page-header__subtitle">Só o título é obrigatório; o resto pode ser preenchido depois.</p>
        </div>
      </div>

      {message && (
        <p ref={messageRef} className="alert alert--error" role="alert">
          {message}
        </p>
      )}

      {loading && (
        <div className="game-form" aria-busy="true" aria-label="Carregando formulário">
          <div className="game-form__fields">
            <div className="skeleton skeleton--field" />
            <div className="skeleton skeleton--field skeleton--tall" />
            <div className="skeleton skeleton--field" />
          </div>
          <div className="skeleton skeleton--cover" />
        </div>
      )}

      {!loading && (
        <form className="game-form" onSubmit={handleSubmit} noValidate>
          <div className="game-form__fields">
            <h2 className="game-form__section">Seu progresso</h2>

            <fieldset className="options">
              <legend className="field__label">Status</legend>
              <div className="options__list">
                {STATUSES.map((option) => (
                  <label key={option.value} className={`option option--status option--${option.value}`}>
                    <input
                      className="option__input"
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={form.status === option.value}
                      onChange={handleChange}
                    />
                    <span className="status__dot" aria-hidden="true" />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.status && <span className="field__error">{errors.status[0]}</span>}
            </fieldset>

            <div className="form__row">
              <Field label="Horas jogadas" hint="Até uma casa decimal, ex.: 12,5." error={errors.hours_played?.[0]}>
                {/* text e nao number: com o navegador em ingles o number zoava a virgula (12,5 virava 125) */}
                <input className="input" name="hours_played" inputMode="decimal" value={form.hours_played} onChange={handleChange} />
              </Field>

              <Field label="Sua nota" hint="De 0 a 10, quanto você gostou do jogo." error={errors.rating?.[0]}>
                <select className="input" name="rating" value={form.rating} onChange={handleChange}>
                  <option value="">Sem nota</option>
                  {Array.from({ length: 11 }, (_, nota) => (
                    <option key={nota} value={nota}>
                      {nota}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <h2 className="game-form__section">Dados do jogo</h2>

            <Field label="Título" error={errors.title?.[0]}>
              <input className="input input--title" name="title" maxLength={255} value={form.title} onChange={handleChange} required />
            </Field>

            <Field label="Descrição" hint="Opcional. Até 5000 caracteres." error={errors.description?.[0]}>
              <textarea
                className="input input--textarea"
                name="description"
                rows={4}
                maxLength={5000}
                value={form.description}
                onChange={handleChange}
              />
            </Field>

            <div className="form__row">
              <Field label="Data de lançamento" hint="Opcional." error={errors.release_date?.[0]}>
                <input className="input" type="date" name="release_date" value={form.release_date} onChange={handleChange} />
              </Field>

              <Field label="URL da capa" hint="Opcional. Endereço http ou https de uma imagem." error={errors.cover_url?.[0]}>
                <input
                  className="input"
                  type="url"
                  name="cover_url"
                  maxLength={255}
                  placeholder="https://"
                  value={form.cover_url}
                  onChange={handleChange}
                  onBlur={() => setCoverPreview(form.cover_url)}
                />
              </Field>
            </div>

            <OptionGroup
              legend="Gêneros"
              options={options.genres}
              selected={form.genres}
              onToggle={(optionId) => toggle('genres', optionId)}
              emptyText="Ainda não há gêneros cadastrados no sistema. O jogo pode ser salvo sem eles."
            />
            <OptionGroup
              legend="Plataformas"
              options={options.platforms}
              selected={form.platforms}
              onToggle={(optionId) => toggle('platforms', optionId)}
              emptyText="Ainda não há plataformas cadastradas no sistema. O jogo pode ser salvo sem elas."
            />

            <div className="form__actions">
              <Link to={backTo} state={backState} className="button button--ghost">
                Cancelar
              </Link>
              <button type="submit" className="button button--primary" disabled={sending}>
                {sending ? 'Salvando…' : editing ? 'Salvar alterações' : 'Adicionar jogo'}
              </button>
            </div>
          </div>

          <aside className="game-form__preview" aria-label="Prévia do card">
            <p className="game-form__preview-label">Prévia</p>
            {/* url quebrada mostra a capa com o titulo */}
            <Cover title={form.title} url={coverPreview} className="game-form__cover" />
            <p className="game-form__preview-title">{form.title.trim() || 'Sem título'}</p>
            <div className="game-form__preview-meta">
              <StatusBadge status={form.status} />
              <span>{form.rating === '' ? 'Sem nota' : `${form.rating}/10`}</span>
            </div>
          </aside>
        </form>
      )}
    </section>
  )
}

export default GameFormPage
