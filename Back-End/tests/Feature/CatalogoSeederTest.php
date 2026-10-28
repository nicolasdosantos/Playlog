<?php

namespace Tests\Feature;

use App\Models\Genre;
use App\Models\Platform;
use App\Models\User;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CatalogoSeederTest extends TestCase
{
    use RefreshDatabase;

    private const GENEROS_APROVADOS = [
        'Ação', 'Aventura', 'Corrida', 'Esportes', 'Estratégia', 'Indie', 'Luta',
        'Plataforma', 'Puzzle', 'RPG', 'Simulação', 'Terror', 'Tiro',
    ];

    private const PLATAFORMAS_APROVADAS = [
        'PC', 'PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X|S',
        'Nintendo Switch', 'Nintendo Switch 2', 'Mobile',
    ];

    public function test_seeder_cadastra_os_generos_e_plataformas_aprovados(): void
    {
        $this->seed(CatalogoSeeder::class);

        $this->assertEqualsCanonicalizing(self::GENEROS_APROVADOS, Genre::pluck('name')->all());
        $this->assertEqualsCanonicalizing(self::PLATAFORMAS_APROVADAS, Platform::pluck('name')->all());
        $this->assertDatabaseCount('usuarios', 0);
    }

    public function test_executar_o_seeder_novamente_nao_duplica_registros(): void
    {
        $this->seed(CatalogoSeeder::class);
        $idsAntes = Genre::pluck('id', 'name')->all();

        $this->seed(CatalogoSeeder::class);

        $this->assertDatabaseCount('generos', 13);
        $this->assertDatabaseCount('plataformas', 8);
        $this->assertSame($idsAntes, Genre::pluck('id', 'name')->all());
    }

    public function test_seeder_preserva_os_registros_existentes(): void
    {
        $metroidvania = Genre::create(['name' => 'Metroidvania']);
        $rpg = Genre::create(['name' => 'RPG']);
        $steamDeck = Platform::create(['name' => 'Steam Deck']);

        $this->seed(CatalogoSeeder::class);

        $this->assertDatabaseHas('generos', ['id' => $metroidvania->id, 'name' => 'Metroidvania']);
        $this->assertDatabaseHas('plataformas', ['id' => $steamDeck->id, 'name' => 'Steam Deck']);
        $this->assertSame([$rpg->id], Genre::where('name', 'RPG')->pluck('id')->all());
        $this->assertDatabaseCount('generos', 14);
        $this->assertDatabaseCount('plataformas', 9);
    }

    public function test_endpoints_funcionam_com_o_catalogo_preenchido(): void
    {
        $this->seed(CatalogoSeeder::class);
        Sanctum::actingAs(User::factory()->create());

        $generos = $this->getJson('/api/genres')
            ->assertOk()
            ->assertJsonCount(13, 'data')
            ->assertJsonStructure(['data' => [['id', 'name']]])
            ->json('data');

        $this->assertEqualsCanonicalizing(self::GENEROS_APROVADOS, array_column($generos, 'name'));
        $this->assertSame(['id', 'name'], array_keys($generos[0]));

        $plataformas = $this->getJson('/api/platforms')
            ->assertOk()
            ->assertJsonCount(8, 'data')
            ->json('data');

        $this->assertEqualsCanonicalizing(self::PLATAFORMAS_APROVADAS, array_column($plataformas, 'name'));

        // Ordem conferida só nas plataformas, que não têm acentos: o SQLite dos testes ordena acentos
        // pelo código dos bytes, diferente do MariaDB (ver GenrePlatformTest)
        $this->assertSame(
            ['Mobile', 'Nintendo Switch', 'Nintendo Switch 2', 'PC', 'PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X|S'],
            array_column($plataformas, 'name'),
        );
    }
}
