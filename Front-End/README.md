# Playlog — Front-End

Interface do Playlog, feita com React e Vite (JavaScript).

## Requisitos

- Node.js 24 (definido no `mise.toml` da raiz do projeto)
- API do Back-End em execução (`php artisan serve`, em http://127.0.0.1:8000)

## Configuração

O endereço da API vem da variável `VITE_API_URL`. Sem ela, o front-end usa `http://127.0.0.1:8000/api`.
Para usar outro endereço, copie o `.env.example` para `.env.local` e altere o valor.

O endereço em que o Vite roda precisa estar liberado no CORS do Back-End (`CORS_ALLOWED_ORIGINS`).

## Comandos

```bash
npm install      # instala as dependências
npm run dev      # servidor de desenvolvimento em http://localhost:5173
npm run build    # gera a versão de produção em dist/
npm run lint     # verifica o código com o ESLint
```

## Organização

- `src/services/api.js`: todas as chamadas à API (token Bearer, JSON e mensagens de erro)
- `src/pages/`: telas (login, cadastro, catálogo e formulário de jogo)
- `src/components/`: partes reutilizadas (cabeçalho, campo de formulário, card de jogo)
- `src/index.css`: cores, espaçamentos e transições da identidade visual
- `src/App.css`: estilos das telas

O token de acesso fica no `localStorage` do navegador e vale 24 horas. Quando ele expira, a aplicação volta para a tela de login.
