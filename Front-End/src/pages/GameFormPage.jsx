import { useEffect, useRef, useState } from 'react'
import Cover from '../components/Cover'
import Field from '../components/Field'
import Icon from '../components/Icon'
import { api } from '../services/api'

// Os erros das listas chegam como "genres.0", "genres.1"...; mostra o primeiro de cada lista
function listError(errors, name) {
  const key = Object.keys(errors).find((field) => field === name || field.startsWith(`${name}.`))
  return key ? errors[key][0] : null
}

function OptionGroup({ legend, options, selected, onToggle, error, emptyText }) {
  return (
    <fieldset className={`options${error ? ' options--error' : ''}`}>
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
      {error && <span className="field__error">{error}</span>}
    </fieldset>
  )
}

function GameFormPage({ game, onSaved, onCancel }) {
  const editing = Boolean(game)
  const [form, setForm] = useState({
    title: game?.title ?? '',
    description: game?.description ?? '',
    release_date: game?.release_date ?? '',
    cover_url: game?.cover_url ?? '',
    genres: game?.genres.map((genre) => genre.id) ?? [],
    platforms: game?.platforms.map((platform) => platform.id) ?? [],
  })
  const [options, setOptions] = useState({ genres: [], platforms: [] })
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const messageRef = useRef(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let ignore = false

    Promise.all([api.listGenres(), api.listPlatforms()])
      .then(([genres, platforms]) => {
        if (!ignore) setOptions({ genres: genres.data, platforms: platforms.data })
      })
      .catch((error) => {
        if (!ignore) setOptionsError(error.message)
      })
      .finally(() => {
        if (!ignore) setOptionsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  // O aviso fica acima do formulário: quem enviou lá de baixo (no celular) precisa conseguir vê-lo
  useEffect(() => {
    if (message) messageRef.current?.scrollIntoView({ block: 'nearest' })
  }, [message])

  // Ao editar um campo, o erro antigo dele some (o servidor valida de novo no próximo envio)
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: undefined })
  }

  function toggle(list, id) {
    const values = form[list].includes(id) ? form[list].filter((value) => value !== id) : [...form[list], id]
    setForm({ ...form, [list]: values })
    // Os erros da lista chegam como "genres", "genres.0"...; somem quando a seleção muda
    setErrors(Object.fromEntries(Object.entries(errors).filter(([field]) => field !== list && !field.startsWith(`${list}.`))))
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
    }

    try {
      if (editing) {
        await api.updateGame(game.id, data)
        onSaved(`Alterações salvas em "${data.title}".`)
      } else {
        await api.createGame(data)
        onSaved(`"${data.title}" foi adicionado ao catálogo.`)
      }
    } catch (error) {
      setErrors(error.errors)
      setMessage(error.message)
      setSending(false)
    }
  }

  // A prévia só tenta carregar endereços que já parecem completos, para não buscar a cada letra digitada
  const previewUrl = /^https?:\/\/[^/\s]+\.[^/\s]+\/\S+/.test(form.cover_url) ? form.cover_url : null
  const previewYear = form.release_date ? form.release_date.slice(0, 4) : null

  return (
    <section className="form-page" aria-labelledby="form-title">
      <button type="button" className="back-link" onClick={onCancel}>
        <Icon name="chevronLeft" size={16} />
        Voltar ao catálogo
      </button>

      <div className="page-header">
        <div>
          <h1 id="form-title" className="page-header__title">
            {editing ? 'Editar jogo' : 'Novo jogo'}
          </h1>
          <p className="page-header__subtitle">
            {editing ? 'As alterações valem para todo o catálogo.' : 'Só o título é obrigatório; o resto pode ser preenchido depois.'}
          </p>
        </div>
      </div>

      {message && (
        <p ref={messageRef} className="alert alert--error" role="alert">
          {message}
        </p>
      )}

      {/* O formulário só aparece depois de carregar as opções, para os botões não mudarem de lugar durante o uso */}
      {optionsLoading && <p className="state">Carregando gêneros e plataformas…</p>}

      {!optionsLoading && (
        <form className="game-form" onSubmit={handleSubmit} noValidate>
          <div className="game-form__fields">
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
                />
              </Field>
            </div>

            {optionsError && (
              <p className="alert alert--error" role="alert">
                Não foi possível carregar gêneros e plataformas: {optionsError}
              </p>
            )}

            {!optionsError && (
              <>
                <OptionGroup
                  legend="Gêneros"
                  options={options.genres}
                  selected={form.genres}
                  onToggle={(id) => toggle('genres', id)}
                  error={listError(errors, 'genres')}
                  emptyText="Ainda não há gêneros cadastrados no sistema. O jogo pode ser salvo sem eles."
                />
                <OptionGroup
                  legend="Plataformas"
                  options={options.platforms}
                  selected={form.platforms}
                  onToggle={(id) => toggle('platforms', id)}
                  error={listError(errors, 'platforms')}
                  emptyText="Ainda não há plataformas cadastradas no sistema. O jogo pode ser salvo sem elas."
                />
              </>
            )}

            <div className="form__actions">
              <button type="button" className="button button--ghost" onClick={onCancel} disabled={sending}>
                Cancelar
              </button>
              <button type="submit" className="button button--primary" disabled={sending}>
                {sending ? 'Salvando…' : editing ? 'Salvar alterações' : 'Adicionar jogo'}
              </button>
            </div>
          </div>

          <aside className="game-form__preview" aria-label="Prévia do card">
            <p className="game-form__preview-label">Como vai aparecer no catálogo</p>
            <Cover title={form.title} url={previewUrl} className="game-form__cover" />
            <p className="game-form__preview-title">{form.title.trim() || 'Sem título'}</p>
            <p className="game-form__preview-meta">{previewYear ?? 'Sem data'}</p>
          </aside>
        </form>
      )}
    </section>
  )
}

export default GameFormPage
