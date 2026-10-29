# Playlog — Back-End

API do Playlog, feita com Laravel e PHP, usando o MariaDB como banco de dados.

## Requisitos

- PHP 8.3 ou superior
- Composer
- MariaDB com o banco `playlog` e um usuário próprio para a aplicação

## Configuração

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Depois, preencha no `.env` a senha do usuário do banco (`DB_PASSWORD`).

## Comandos

```bash
php artisan serve   # servidor de desenvolvimento em http://localhost:8000
php artisan test    # executa os testes
```

## Modelo de dados

- `jogos`: dados gerais do jogo (título, descrição, data de lançamento e URL da capa).
- `biblioteca_jogos`: entrada pessoal do jogo, com o dono (`user_id`), o status, as horas jogadas e a nota de 0 a 10.
  Cada jogo pertence a uma única entrada (`game_id` é único), então editar um jogo nunca afeta outro usuário.
- `jogo_genero` e `jogo_plataforma`: gêneros e plataformas de cada jogo.
- `generos` e `plataformas`: opções compartilhadas entre todos os usuários.

Não existe exclusão de conta. Se um usuário for apagado direto no banco, as entradas da biblioteca dele
são apagadas em cascata, mas os jogos e os tokens dele continuam no banco.
