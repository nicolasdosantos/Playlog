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

    public function test_rotas_exigem_autenticacao(): void
    {
        $this->getJson('/api/genres')->assertUnauthorized();
        $this->getJson('/api/platforms')->assertUnauthorized();
    }

    // Nomes sem acento: o SQLite dos testes ordena acentos de um jeito diferente do MariaDB
    public function test_generos_e_plataformas_sao_listados_em_ordem_alfabetica(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $rpg = Genre::create(['name' => 'RPG']);
        $aventura = Genre::create(['name' => 'Aventura']);
        $pc = Platform::create(['name' => 'PC']);
        $mobile = Platform::create(['name' => 'Mobile']);

        $this->getJson('/api/genres')
            ->assertOk()
            ->assertExactJson(['data' => [
                ['id' => $aventura->id, 'name' => 'Aventura'],
                ['id' => $rpg->id, 'name' => 'RPG'],
            ]]);

        $this->getJson('/api/platforms')
            ->assertOk()
            ->assertExactJson(['data' => [
                ['id' => $mobile->id, 'name' => 'Mobile'],
                ['id' => $pc->id, 'name' => 'PC'],
            ]]);
    }
}
