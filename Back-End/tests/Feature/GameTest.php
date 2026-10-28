<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Genre;
use App\Models\Platform;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GameTest extends TestCase
{
    use RefreshDatabase;

    private function autenticar(): User
    {
        return Sanctum::actingAs(User::factory()->create());
    }

    private function dadosDoJogo(array $alteracoes = []): array
    {
        return array_merge([
            'title' => 'Hollow Knight',
            'description' => 'Aventura em um reino subterrâneo.',
            'release_date' => '2017-02-24',
            'cover_url' => 'https://exemplo.com/capas/hollow-knight.jpg',
        ], $alteracoes);
    }

    public function test_rotas_do_catalogo_exigem_autenticacao(): void
    {
        $game = Game::create(['title' => 'Celeste']);

        $this->getJson('/api/games')->assertUnauthorized();
        $this->postJson('/api/games', $this->dadosDoJogo())->assertUnauthorized();
        $this->getJson("/api/games/{$game->id}")->assertUnauthorized();
        $this->putJson("/api/games/{$game->id}", $this->dadosDoJogo())->assertUnauthorized();
        $this->deleteJson("/api/games/{$game->id}")->assertUnauthorized();

        $this->assertDatabaseCount('jogos', 1);
    }

    public function test_usuario_autenticado_cadastra_jogo_valido(): void
    {
        $this->autenticar();

        $response = $this->postJson('/api/games', $this->dadosDoJogo());

        $response->assertCreated()
            ->assertJsonPath('message', 'Jogo cadastrado com sucesso.')
            ->assertJsonPath('game.title', 'Hollow Knight')
            ->assertJsonPath('game.release_date', '2017-02-24')
            ->assertJsonPath('game.cover_url', 'https://exemplo.com/capas/hollow-knight.jpg')
            ->assertJsonPath('game.genres', [])
            ->assertJsonPath('game.platforms', []);

        // A data é conferida pelo Model porque o SQLite dos testes guarda o texto completo (com horário)
        $this->assertSame('2017-02-24', Game::where('title', 'Hollow Knight')->sole()->release_date->format('Y-m-d'));
    }

    public function test_cadastro_aceita_apenas_o_titulo(): void
    {
        $this->autenticar();

        $this->postJson('/api/games', ['title' => 'Celeste'])
            ->assertCreated()
            ->assertJsonPath('game.description', null)
            ->assertJsonPath('game.release_date', null)
            ->assertJsonPath('game.cover_url', null);
    }

    public function test_cadastro_rejeita_dados_invalidos(): void
    {
        $this->autenticar();

        $this->postJson('/api/games', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title' => 'O campo título é obrigatório.']);

        $this->postJson('/api/games', $this->dadosDoJogo(['title' => str_repeat('a', 256)]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title' => 'O campo título deve ter no máximo 255 caracteres.']);

        $this->postJson('/api/games', $this->dadosDoJogo(['release_date' => '24/02/2017']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['release_date' => 'O campo data de lançamento deve estar no formato AAAA-MM-DD.']);

        foreach (['nao-e-uma-url', 'javascript:alert(1)', 'ftp://exemplo.com/capa.jpg'] as $urlInvalida) {
            $this->postJson('/api/games', $this->dadosDoJogo(['cover_url' => $urlInvalida]))
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['cover_url' => 'O campo URL da capa deve ser um endereço válido começando com http:// ou https://.']);
        }

        $this->postJson('/api/games', $this->dadosDoJogo(['genres' => [999]]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['genres.0' => 'O gênero informado não existe.']);

        $this->postJson('/api/games', $this->dadosDoJogo(['platforms' => 'PC']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['platforms' => 'O campo plataformas deve ser uma lista.']);

        $this->assertDatabaseCount('jogos', 0);
    }

    public function test_cadastro_associa_generos_e_plataformas(): void
    {
        $this->autenticar();
        $rpg = Genre::create(['name' => 'RPG']);
        $acao = Genre::create(['name' => 'Ação']);
        $pc = Platform::create(['name' => 'PC']);

        $response = $this->postJson('/api/games', $this->dadosDoJogo([
            'genres' => [$rpg->id, $acao->id],
            'platforms' => [$pc->id],
        ]));

        $response->assertCreated()
            ->assertJsonCount(2, 'game.genres')
            ->assertJsonPath('game.platforms.0', ['id' => $pc->id, 'name' => 'PC']);

        $game = Game::first();
        $this->assertEqualsCanonicalizing([$rpg->id, $acao->id], $game->genres->pluck('id')->all());
        $this->assertSame([$pc->id], $game->platforms->pluck('id')->all());
    }

    public function test_listagem_retorna_os_jogos_em_ordem_alfabetica(): void
    {
        $this->autenticar();
        Game::create(['title' => 'Zelda']);
        Game::create(['title' => 'Celeste']);
        Game::create(['title' => 'Hades']);

        $this->getJson('/api/games')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.title', 'Celeste')
            ->assertJsonPath('data.1.title', 'Hades')
            ->assertJsonPath('data.2.title', 'Zelda')
            ->assertJsonStructure([
                'data' => [['id', 'title', 'description', 'release_date', 'cover_url', 'genres', 'platforms']],
                'links',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_listagem_e_paginada(): void
    {
        $this->autenticar();
        for ($i = 1; $i <= 20; $i++) {
            Game::create(['title' => sprintf('Jogo %02d', $i)]);
        }

        $this->getJson('/api/games')
            ->assertOk()
            ->assertJsonCount(15, 'data')
            ->assertJsonPath('meta.per_page', 15)
            ->assertJsonPath('meta.total', 20)
            ->assertJsonPath('meta.last_page', 2);

        $this->getJson('/api/games?page=2')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('data.0.title', 'Jogo 16');
    }

    public function test_consulta_de_jogo_existente(): void
    {
        $this->autenticar();
        $game = Game::create($this->dadosDoJogo());
        $game->genres()->attach(Genre::create(['name' => 'Metroidvania']));

        $response = $this->getJson("/api/games/{$game->id}");

        $response->assertOk()
            ->assertJsonPath('game.id', $game->id)
            ->assertJsonPath('game.title', 'Hollow Knight')
            ->assertJsonPath('game.genres.0.name', 'Metroidvania');

        // Os dados internos da tabela intermediária não aparecem na resposta
        $response->assertJsonMissingPath('game.genres.0.pivot');
        $this->assertStringNotContainsString('pivot', $response->getContent());
    }

    public function test_jogo_inexistente_retorna_404(): void
    {
        $this->autenticar();

        foreach (['getJson', 'deleteJson'] as $metodo) {
            $this->$metodo('/api/games/999')
                ->assertNotFound()
                ->assertExactJson(['message' => 'Registro não encontrado.']);
        }

        $this->putJson('/api/games/999', $this->dadosDoJogo())
            ->assertNotFound()
            ->assertExactJson(['message' => 'Registro não encontrado.']);
    }

    public function test_edicao_de_jogo(): void
    {
        $this->autenticar();
        $game = Game::create($this->dadosDoJogo());
        $rpg = Genre::create(['name' => 'RPG']);
        $acao = Genre::create(['name' => 'Ação']);
        $game->genres()->attach($rpg);

        $this->putJson("/api/games/{$game->id}", $this->dadosDoJogo([
            'title' => 'Hollow Knight: Silksong',
            'release_date' => '2025-09-04',
            'genres' => [$acao->id],
        ]))
            ->assertOk()
            ->assertJsonPath('message', 'Jogo atualizado com sucesso.')
            ->assertJsonPath('game.title', 'Hollow Knight: Silksong')
            ->assertJsonPath('game.genres', [['id' => $acao->id, 'name' => 'Ação']]);

        $game->refresh();
        $this->assertSame('Hollow Knight: Silksong', $game->title);
        $this->assertSame('2025-09-04', $game->release_date->format('Y-m-d'));
        $this->assertDatabaseMissing('jogo_genero', ['game_id' => $game->id, 'genre_id' => $rpg->id]);
    }

    public function test_edicao_sem_enviar_generos_e_plataformas_mantem_as_associacoes(): void
    {
        $this->autenticar();
        $game = Game::create($this->dadosDoJogo());
        $game->genres()->attach(Genre::create(['name' => 'RPG']));
        $game->platforms()->attach(Platform::create(['name' => 'PC']));

        $this->putJson("/api/games/{$game->id}", ['title' => 'Novo título'])
            ->assertOk()
            ->assertJsonCount(1, 'game.genres')
            ->assertJsonCount(1, 'game.platforms');
    }

    public function test_put_exige_o_titulo(): void
    {
        $this->autenticar();
        $game = Game::create($this->dadosDoJogo());

        $this->putJson("/api/games/{$game->id}", ['description' => 'Só a descrição'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title' => 'O campo título é obrigatório.']);

        $this->assertSame('Aventura em um reino subterrâneo.', $game->fresh()->description);
    }

    public function test_patch_atualiza_apenas_os_campos_enviados(): void
    {
        $this->autenticar();
        $game = Game::create($this->dadosDoJogo());
        $game->genres()->attach(Genre::create(['name' => 'RPG']));

        $this->patchJson("/api/games/{$game->id}", ['description' => 'Nova descrição'])
            ->assertOk()
            ->assertJsonPath('game.title', 'Hollow Knight')
            ->assertJsonPath('game.description', 'Nova descrição')
            ->assertJsonPath('game.release_date', '2017-02-24')
            ->assertJsonPath('game.cover_url', 'https://exemplo.com/capas/hollow-knight.jpg')
            ->assertJsonCount(1, 'game.genres');
    }

    public function test_patch_nao_aceita_titulo_vazio_nem_dados_invalidos(): void
    {
        $this->autenticar();
        $game = Game::create($this->dadosDoJogo());

        $this->patchJson("/api/games/{$game->id}", ['title' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title' => 'O campo título é obrigatório.']);

        $this->patchJson("/api/games/{$game->id}", ['cover_url' => 'javascript:alert(1)'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('cover_url');

        $this->assertSame('Hollow Knight', $game->fresh()->title);
        $this->assertSame('https://exemplo.com/capas/hollow-knight.jpg', $game->fresh()->cover_url);
    }

    public function test_edicao_rejeita_dados_invalidos(): void
    {
        $this->autenticar();
        $game = Game::create($this->dadosDoJogo());

        $this->putJson("/api/games/{$game->id}", ['title' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title' => 'O campo título é obrigatório.']);

        $this->assertDatabaseHas('jogos', ['id' => $game->id, 'title' => 'Hollow Knight']);
    }

    public function test_exclusao_de_jogo_remove_os_vinculos_mas_mantem_generos_e_plataformas(): void
    {
        $this->autenticar();
        $game = Game::create($this->dadosDoJogo());
        $rpg = Genre::create(['name' => 'RPG']);
        $pc = Platform::create(['name' => 'PC']);
        $game->genres()->attach($rpg);
        $game->platforms()->attach($pc);

        $this->deleteJson("/api/games/{$game->id}")
            ->assertOk()
            ->assertExactJson(['message' => 'Jogo excluído com sucesso.']);

        $this->assertDatabaseMissing('jogos', ['id' => $game->id]);
        $this->assertDatabaseCount('jogo_genero', 0);
        $this->assertDatabaseCount('jogo_plataforma', 0);
        $this->assertDatabaseHas('generos', ['id' => $rpg->id]);
        $this->assertDatabaseHas('plataformas', ['id' => $pc->id]);
    }

    public function test_nao_exclui_jogo_que_esta_na_biblioteca_de_algum_usuario(): void
    {
        $this->autenticar();
        $game = Game::create($this->dadosDoJogo());
        $dono = User::factory()->create();
        $dono->userGames()->create(['game_id' => $game->id, 'status' => 'playing']);

        $this->deleteJson("/api/games/{$game->id}")
            ->assertConflict()
            ->assertExactJson(['message' => 'Este jogo está na biblioteca de algum usuário e não pode ser excluído.']);

        $this->assertDatabaseHas('jogos', ['id' => $game->id]);
        $this->assertDatabaseHas('biblioteca_jogos', ['user_id' => $dono->id, 'game_id' => $game->id]);
    }
}
