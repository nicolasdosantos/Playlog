import { useState } from 'react'
import AuthLayout from '../components/AuthLayout'
import AuthField from '../components/AuthField'
import Icon from '../components/Icon'
import { api } from '../services/api'

function LoginPage({ onLogin, onGoToRegister, notice }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(notice)
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
      onLogin(await api.login(form))
    } catch (error) {
      setErrors(error.errors)
      setMessage({ type: 'error', text: error.message })
      setSending(false)
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Use o e-mail e a senha da sua conta.">
      {message && (
        <p className={`alert alert--${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <AuthField icon="mail" label="E-mail" error={errors.email?.[0]}>
          <input
            type="email"
            name="email"
            placeholder="seu@email.com"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </AuthField>

        <AuthField icon="lock" label="Senha" error={errors.password?.[0]}>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </AuthField>

        <button type="submit" className="button button--primary button--full" disabled={sending}>
          <span>{sending ? 'Entrando…' : 'Entrar'}</span>
          <span className="button__arrow" aria-hidden="true">
            <Icon name="chevronRight" size={17} />
          </span>
        </button>
      </form>

      <p className="auth__switch">
        Ainda não tem conta?{' '}
        <button type="button" className="link-button" onClick={onGoToRegister}>
          Criar conta
        </button>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
