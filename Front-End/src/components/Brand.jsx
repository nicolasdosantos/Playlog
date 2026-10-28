// Símbolo do Playlog: um cartão de memória, o "save" do jogador
export function BrandMark({ className = 'brand__mark' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M6 3h15l6 6v17a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
      <path className="brand__slot" d="M9 20h14M9 24h9" />
    </svg>
  )
}

function Brand({ size = 'normal' }) {
  return (
    <span className={`brand brand--${size}`}>
      <BrandMark />
      <span className="brand__name">playlog</span>
    </span>
  )
}

export default Brand
