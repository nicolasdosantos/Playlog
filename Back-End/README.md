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
