import { useState } from 'react'

// mesmo titulo sempre gera a mesma cor
function posterTone(title) {
  let sum = 0
  for (const char of title) sum += char.codePointAt(0)
  return (sum % 5) + 1
}

// sem imagem (ou imagem quebrada) mostra a capa com o titulo
function Cover({ title, url, className = '' }) {
  const [failedUrl, setFailedUrl] = useState(null)
  const name = title.trim() || 'Sem título'

  if (url && failedUrl !== url) {
    return (
      <img
        className={`cover ${className}`}
        src={url}
        alt={`Capa de ${name}`}
        loading="lazy"
        onError={() => setFailedUrl(url)}
      />
    )
  }

  return (
    <div className={`cover cover--poster cover--tone-${posterTone(name)} ${className}`} aria-hidden="true">
      <span className="cover__title">{name}</span>
    </div>
  )
}

export default Cover
