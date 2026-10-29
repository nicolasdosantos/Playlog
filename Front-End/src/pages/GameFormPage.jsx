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

// Converte a entrada que vem da API para os valores dos campos do formulário
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
              {/* Checkbox de verdade (teclado e leitor de tela), escondido atrás do visual do chip */}
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
  // Volta para a biblioteca com os mesmos filtros de antes, quando vier dela
  const backTo = location.state?.back ?? '/'

  const [form, setForm] = useState(EMPTY_FORM)
  // A prévia da capa só muda quando a pessoa sai do campo, e não a cada letra digitada na URL
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

  // O aviso fica acima do formulário: quem enviou lá de baixo (no celular) precisa conseguir vê-lo
  useEffect(() => {
    if (message) messageRef.current?.scrollIntoView({ block: 'nearest' })
  }, [message])

  // Ao editar um campo, o erro antigo dele some (o servidor valida de novo no próximo envio)
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: undefined })
  }

  // Marca ou desmarca um gênero/plataforma
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
      // Aceita vírgula ou ponto (12,5 ou 12.5); a API espera ponto
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
      navigate(backTo, { state: { notice: { type: 'success', text } } })
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
      <Link to={backTo} className="back-link">
        <Icon name="chevronLeft" size={16} />
        Voltar à biblioteca
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
                {/* Campo de texto: o type="number" descarta a vírgula quando o navegador está em inglês (12,5 virava 125) */}
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
              <Link to={backTo} className="button button--ghost">
                Cancelar
              </Link>
              <button type="submit" className="button button--primary" disabled={sending}>
                {sending ? 'Salvando…' : editing ? 'Salvar alterações' : 'Adicionar jogo'}
              </button>
            </div>
          </div>

          <aside className="game-form__preview" aria-label="Prévia do card">
            <p className="game-form__preview-label">Prévia</p>
            {/* Se a URL não for uma imagem válida, o Cover mostra a capa com o título */}
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
