# Playlog — Back-End

API do Playlog, feita com Laravel e PHP, usando o MySQL como banco de dados.
Este guia também mostra como iniciar o Front-End, que fica na pasta `../Front-End`.

## Requisitos

- PHP 8.3 ou superior, com as extensões `pdo_mysql` e `pdo_sqlite` (a segunda é usada nos testes)
- Composer
- MySQL 8.0.19 ou superior (as migrations criam e removem restrições `CHECK`).
  O desenvolvimento foi feito com MariaDB; para usá-lo, troque para `DB_CONNECTION=mariadb` no `.env`.
- Node.js 24 (para o Front-End; a versão está no `mise.toml` da raiz)

## 1. Banco de dados

Crie um banco vazio e um usuário para a aplicação (troque a senha):

```sql
CREATE DATABASE playlog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'playlog'@'localhost' IDENTIFIED BY 'troque-esta-senha';
GRANT ALL PRIVILEGES ON playlog.* TO 'playlog'@'localhost';
```

## 2. Back-End

Dentro da pasta `Back-End`:

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Preencha no `.env` a senha do usuário do banco (`DB_PASSWORD`). Depois, crie as tabelas e cadastre os gêneros e as plataformas:

```bash
php artisan migrate --seed
php artisan serve   # API em http://127.0.0.1:8000
```

O `--seed` roda o `DatabaseSeeder`, que só cadastra os gêneros e as plataformas (`CatalogoSeeder`).
Nenhum usuário é criado: a conta é feita pela tela de cadastro. Rodar o seeder de novo não duplica os registros.

## 3. Front-End

Em outro terminal, dentro da pasta `Front-End`:

```bash
npm install
npm run dev   # interface em http://localhost:5173
```

O Front-End usa a API em `http://127.0.0.1:8000/api`. Para usar outro endereço, veja o `Front-End/README.md`.

## Testes

```bash
php artisan test     # testes da API (PHPUnit)
vendor/bin/pint --test   # padrão de código PHP
```

Os testes usam um banco SQLite em memória (definido no `phpunit.xml`), então não alteram o banco MySQL.
Por isso, alguns comportamentos do MySQL não são testados automaticamente:

- Busca com acentos: no MySQL (`utf8mb4_unicode_ci`), buscar "pokemon" encontra "Pokémon"; no SQLite, não.
- Ordenação de nomes com acento, que também é diferente entre os dois bancos.
- As restrições `CHECK` dependem da versão do SQLite instalada no computador que roda os testes
  (o SQLite precisa aceitar `ALTER TABLE ... ADD CONSTRAINT`).

No Front-End, `npm run lint` verifica o código com o ESLint e `npm run build` gera a versão de produção.

## Modelo de dados

| Tabela | Função |
|---|---|
| `usuarios` | Contas (nome, e-mail e senha com hash) |
| `perfis` | Perfil do usuário (bio e avatar). Relacionamento **1:1**: `user_id` é único, então cada usuário tem no máximo um perfil |
| `jogos` | Dados gerais do jogo (título, descrição, data de lançamento e URL da capa) |
| `biblioteca_jogos` | Entrada pessoal do jogo: dono (`user_id`), status, horas jogadas e nota de 0 a 10 |
| `generos` e `plataformas` | Opções compartilhadas entre todos os usuários (cadastradas pelo seeder) |
| `jogo_genero` e `jogo_plataforma` | Relacionamentos **N:N** entre jogos e gêneros e entre jogos e plataformas |
| `personal_access_tokens` | Tokens de acesso do Laravel Sanctum (valem 24 horas) |

As tabelas `sessions`, `cache`, `jobs` e as demais criadas pelas migrations iniciais são padrões do Laravel.

Cada jogo pertence a uma única entrada da biblioteca (`game_id` é único), então editar um jogo nunca afeta outro usuário.

Não existe exclusão de conta. Se um usuário for apagado direto no banco, o perfil e as entradas da biblioteca dele
são apagados em cascata, mas os jogos e os tokens dele continuam no banco.
