import { useState } from 'react'

// Escolhe sempre o mesmo tom para o mesmo título, para a capa gerada não mudar a cada visita
function posterTone(title) {
  let sum = 0
  for (const char of title) sum += char.codePointAt(0)
  return (sum % 5) + 1
}

// Capa do jogo. Sem imagem (ou com imagem quebrada), mostra uma capa tipográfica com o título.
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
