import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import AuthField from '../components/AuthField'
import Icon from '../components/Icon'
import { api } from '../services/api'

function RegisterPage({ onRegister }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [sending, setSending] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: undefined })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSending(true)
    setErrors({})
    setMessage(null)

    try {
      onRegister(await api.register(form))
    } catch (error) {
      setErrors(error.errors)
      setMessage(error.message)
      setSending(false)
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Nome, e-mail e uma senha. Depois disso você já entra na sua biblioteca.">
      {message && (
        <p className="alert alert--error" role="alert">
          {message}
        </p>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <AuthField label="Nome" error={errors.name?.[0]}>
          <input
            name="name"
            placeholder="Seu nome"
            autoComplete="name"
            maxLength={255}
            value={form.name}
            onChange={handleChange}
            required
          />
        </AuthField>

        <AuthField label="E-mail" error={errors.email?.[0]}>
          <input
            type="email"
            name="email"
            placeholder="seu@email.com"
            autoComplete="email"
            maxLength={255}
            value={form.email}
            onChange={handleChange}
            required
          />
        </AuthField>

        <AuthField label="Senha" hint="Pelo menos 8 caracteres." error={errors.password?.[0]}>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </AuthField>

        <AuthField label="Confirme a senha" error={errors.password_confirmation?.[0]}>
          <input
            type="password"
            name="password_confirmation"
            autoComplete="new-password"
            value={form.password_confirmation}
            onChange={handleChange}
            required
          />
        </AuthField>

        <button type="submit" className="button button--primary button--full" disabled={sending}>
          <span>{sending ? 'Criando conta…' : 'Criar conta'}</span>
          <span className="button__arrow" aria-hidden="true">
            <Icon name="chevronRight" size={17} />
          </span>
        </button>
      </form>

      <p className="auth__switch">
        Já tem conta?{' '}
        <Link to="/entrar" className="link-button">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}

export default RegisterPage
