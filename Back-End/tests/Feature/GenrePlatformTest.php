<?php

namespace Tests\Feature;

use App\Models\Genre;
use App\Models\Platform;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GenrePlatformTest extends TestCase
{
    use RefreshDatabase;

    private function autenticar(): void
    {
        Sanctum::actingAs(User::factory()->create());
    }

    public function test_rotas_exigem_autenticacao(): void
    {
        $this->getJson('/api/genres')->assertUnauthorized();
        $this->getJson('/api/platforms')->assertUnauthorized();
    }

    // Os testes de ordem usam nomes sem acento: o SQLite dos testes ordena pelo código dos bytes
    // (colocaria "Ação" depois de "Aventura"), enquanto o MariaDB usa a collation utf8mb4_unicode_ci
    public function test_usuario_autenticado_consulta_os_generos_em_ordem_alfabetica(): void
    {
        $this->autenticar();
        $rpg = Genre::create(['name' => 'RPG']);
        $aventura = Genre::create(['name' => 'Aventura']);
        $puzzle = Genre::create(['name' => 'Puzzle']);

        $this->getJson('/api/genres')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    ['id' => $aventura->id, 'name' => 'Aventura'],
                    ['id' => $puzzle->id, 'name' => 'Puzzle'],
                    ['id' => $rpg->id, 'name' => 'RPG'],
                ],
            ]);
    }

    public function test_usuario_autenticado_consulta_as_plataformas_em_ordem_alfabetica(): void
    {
        $this->autenticar();
        $switch = Platform::create(['name' => 'Nintendo Switch']);
        $pc = Platform::create(['name' => 'PC']);
        $mobile = Platform::create(['name' => 'Mobile']);

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    ['id' => $mobile->id, 'name' => 'Mobile'],
                    ['id' => $switch->id, 'name' => 'Nintendo Switch'],
                    ['id' => $pc->id, 'name' => 'PC'],
                ],
            ]);
    }

    public function test_catalogos_vazios_retornam_lista_vazia(): void
    {
        $this->autenticar();

        $this->getJson('/api/genres')->assertOk()->assertExactJson(['data' => []]);
        $this->getJson('/api/platforms')->assertOk()->assertExactJson(['data' => []]);
    }
}
