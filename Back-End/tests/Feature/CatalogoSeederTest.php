<?php

namespace Tests\Feature;

use App\Models\Genre;
use App\Models\Platform;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_cadastra_os_generos_e_plataformas(): void
    {
        $this->seed(CatalogoSeeder::class);

        $this->assertEqualsCanonicalizing(
            ['Ação', 'Aventura', 'Corrida', 'Esportes', 'Estratégia', 'Indie', 'Luta', 'Plataforma', 'Puzzle', 'RPG', 'Simulação', 'Terror', 'Tiro'],
            Genre::pluck('name')->all(),
        );
        $this->assertEqualsCanonicalizing(
            ['PC', 'PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X|S', 'Nintendo Switch', 'Nintendo Switch 2', 'Mobile'],
            Platform::pluck('name')->all(),
        );
        $this->assertDatabaseCount('usuarios', 0);
    }

    public function test_rodar_de_novo_nao_duplica_nem_altera_os_registros_existentes(): void
    {
        $rpg = Genre::create(['name' => 'RPG']);
        $metroidvania = Genre::create(['name' => 'Metroidvania']);

        $this->seed(CatalogoSeeder::class);
        $this->seed(CatalogoSeeder::class);

        // 13 do seeder + Metroidvania, e o RPG continua com o mesmo id
        $this->assertDatabaseCount('generos', 14);
        $this->assertDatabaseCount('plataformas', 8);
        $this->assertSame([$rpg->id], Genre::where('name', 'RPG')->pluck('id')->all());
        $this->assertDatabaseHas('generos', ['id' => $metroidvania->id, 'name' => 'Metroidvania']);
    }

    // migrate --seed roda o DatabaseSeeder
    public function test_seeder_principal_cadastra_o_catalogo_sem_criar_usuarios(): void
    {
        $this->seed();

        $this->assertDatabaseCount('generos', 13);
        $this->assertDatabaseCount('plataformas', 8);
        $this->assertDatabaseCount('usuarios', 0);
    }
}
