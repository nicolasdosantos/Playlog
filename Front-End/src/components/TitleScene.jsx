// Cenário de "tela de título" de jogo atrás do login: céu com estrelas, um sol nascendo e montanhas
// em camadas que deslizam devagar, cada uma numa velocidade (o efeito parallax dos jogos de plataforma).

// Posições das estrelas, sorteadas uma vez quando o arquivo carrega.
// As que cairiam sobre o título (canto superior esquerdo) vão para a metade direita do céu.
const STARS = Array.from({ length: 70 }, () => {
  let left = Math.random() * 100
  const top = Math.random() * 58
  if (left < 48 && top > 8 && top < 46) left += 50

  return {
    left: `${left}%`,
    top: `${top}%`,
    size: Math.random() > 0.85 ? 3 : 2,
    delay: `${(Math.random() * 4).toFixed(1)}s`,
  }
})

// Os picos de cada camada (x,y num desenho de 1440 x 320). O primeiro e o último ponto têm a mesma
// altura, para a cópia seguinte emendar sem falha.
const LAYERS = [
  { name: 'far', points: '0,200 90,150 180,175 300,95 400,160 480,130 600,185 720,110 820,150 930,80 1050,155 1160,125 1290,170 1380,140 1440,200' },
  { name: 'mid', points: '0,230 110,190 200,215 310,150 420,205 540,170 640,220 770,160 880,200 1000,140 1110,205 1230,175 1340,215 1440,230' },
  { name: 'near', points: '0,260 130,225 240,250 350,200 470,245 590,215 700,255 820,210 940,248 1060,205 1180,245 1300,222 1440,260' },
  { name: 'front', points: '0,290 160,268 300,285 430,255 560,282 700,262 840,288 980,258 1120,284 1260,265 1440,290' },
]

function Mountains({ points }) {
  return (
    <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
      <path className="scene__ground" d={`M${points} L1440,320 L0,320 Z`} />
      {/* Só a linha dos picos, para a luz do sol contornar as montanhas */}
      <path className="scene__ridge" d={`M${points}`} />
    </svg>
  )
}

function TitleScene() {
  return (
    <div className="scene" aria-hidden="true">
      {STARS.map((star, i) => (
        <span
          key={i}
          className="scene__star"
          style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay }}
        />
      ))}
      <span className="scene__shooting-star" />
      <div className="scene__sun" />

      {LAYERS.map((layer) => (
        <div key={layer.name} className={`scene__layer scene__layer--${layer.name}`}>
          {/* Duas cópias lado a lado: ao deslizar metade da largura, o desenho recomeça sem emenda */}
          <Mountains points={layer.points} />
          <Mountains points={layer.points} />
        </div>
      ))}
    </div>
  )
}

export default TitleScene
