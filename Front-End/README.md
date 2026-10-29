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

- `src/App.jsx`: rotas da aplicação (React Router) e controle da sessão
- `src/services/api.js`: todas as chamadas à API (token Bearer, JSON e mensagens de erro)
- `src/pages/`: telas (entrar, cadastro, biblioteca, formulário de jogo, quem somos e página não encontrada)
- `src/components/`: partes reutilizadas (cabeçalho, card de jogo, selo de status, diálogo de confirmação)
- `src/library.js`: status da biblioteca e funções pequenas usadas por várias telas
- `src/index.css`: cores, espaçamentos e transições da identidade visual
- `src/App.css`: estilos das telas

## Rotas

| Endereço | Tela |
|---|---|
| `/entrar` e `/cadastro` | Login e criação de conta |
| `/` | Biblioteca (busca e filtro por status ficam na URL: `?busca=…&status=…&pagina=…`) |
| `/jogos/novo` e `/jogos/:id/editar` | Formulário do jogo |
| `/quem-somos` | Integrantes e tecnologias do projeto |

O token de acesso fica no `localStorage` do navegador e vale 24 horas. Quando ele expira, a aplicação volta para a tela de login.
