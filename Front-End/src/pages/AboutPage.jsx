function AboutPage() {
  return (
    <section className="about" aria-labelledby="about-title">
      <div className="page-intro page-header">
        <div>
          <h1 id="about-title" className="page-intro__title page-header__title">
            Quem somos
          </h1>
          <p className="page-intro__count page-header__subtitle">
            Projeto do 4º termo de Tecnologia em Desenvolvimento de Sistemas.
          </p>
        </div>
      </div>

      <div className="about__grid">
        <div className="about__text">
          <h2 className="about__heading">O projeto</h2>
          <p>
            O Playlog é um backlog pessoal de jogos. Cada pessoa cria sua conta e monta a própria biblioteca: cadastra os
            jogos que já jogou ou quer jogar, escolhe gêneros e plataformas e acompanha o status, as horas jogadas e a
            nota que deu para cada um.
          </p>

          <h2 className="about__heading">Tecnologias</h2>
          <ul className="about__tech">
            <li>
              <strong>React</strong>
              <span>Interface (front-end)</span>
            </li>
            <li>
              <strong>Laravel</strong>
              <span>API e autenticação por token (back-end)</span>
            </li>
            <li>
              <strong>MariaDB</strong>
              <span>Banco de dados</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="about__heading">Integrantes</h2>
          <ul className="members">
            <li className="member">
              <span className="avatar avatar--large" aria-hidden="true">
                NS
              </span>
              <div>
                <p className="member__name">Nicolas Pichiteli dos Santos</p>
                <p className="member__ra">RA 221360</p>
              </div>
            </li>
            <li className="member">
              <span className="avatar avatar--large" aria-hidden="true">
                TC
              </span>
              <div>
                <p className="member__name">Thiago Panini Cassiano</p>
                <p className="member__ra">RA 221228</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default AboutPage
