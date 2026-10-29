import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="state">
      <p className="state__title">Página não encontrada.</p>
      <p>O endereço pode estar errado ou a página não existe mais.</p>
      <Link to="/" className="button button--primary">
        Ir para a biblioteca
      </Link>
    </div>
  )
}

export default NotFoundPage
