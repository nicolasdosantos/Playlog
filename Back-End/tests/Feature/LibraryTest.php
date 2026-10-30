<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Genre;
use App\Models\Platform;
use App\Models\User;
use App\Models\UserGame;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LibraryTest extends TestCase
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

    // cria a entrada direto no banco
    private function criarEntrada(User $user, array $jogo = [], array $pessoal = []): UserGame
    {
        $game = Game::create($this->dadosDoJogo($jogo));
        $entry = $user->userGames()->make($pessoal);
        $entry->game()->associate($game)->save();

        return $entry;
    }

    public function test_rotas_da_biblioteca_exigem_autenticacao(): void
    {
        $entry = $this->criarEntrada(User::factory()->create());

        $this->getJson('/api/library')->assertUnauthorized();
        $this->postJson('/api/library', $this->dadosDoJogo())->assertUnauthorized();
        $this->getJson("/api/library/{$entry->id}")->assertUnauthorized();
        $this->putJson("/api/library/{$entry->id}", $this->dadosDoJogo())->assertUnauthorized();
        $this->deleteJson("/api/library/{$entry->id}")->assertUnauthorized();

        $this->assertDatabaseCount('biblioteca_jogos', 1);
    }

    public function test_cadastro_cria_o_jogo_os_vinculos_e_a_entrada_do_usuario(): void
    {
        $user = $this->autenticar();
        $rpg = Genre::create(['name' => 'RPG']);
        $pc = Platform::create(['name' => 'PC']);

        $response = $this->postJson('/api/library', $this->dadosDoJogo([
            'genres' => [$rpg->id],
            'platforms' => [$pc->id],
            'status' => 'playing',
            'hours_played' => 12.5,
            'rating' => 9,
        ]));

        $response->assertCreated()
            ->assertJsonPath('message', 'Jogo adicionado à sua biblioteca.')
            ->assertJsonPath('entry.status', 'playing')
            ->assertJsonPath('entry.hours_played', 12.5)
            ->assertJsonPath('entry.rating', 9)
            ->assertJsonPath('entry.game.title', 'Hollow Knight')
            ->assertJsonPath('entry.game.release_date', '2017-02-24')
            ->assertJsonPath('entry.game.genres', [['id' => $rpg->id, 'name' => 'RPG']])
            ->assertJsonPath('entry.game.platforms', [['id' => $pc->id, 'name' => 'PC']])
            ->assertJsonMissingPath('entry.user_id');

        $entry = UserGame::sole();
        $this->assertSame($user->id, $entry->user_id);
        $this->assertSame([$rpg->id], $entry->game->genres->pluck('id')->all());
    }

    public function test_cadastro_com_apenas_o_titulo_usa_os_valores_padrao(): void
    {
        $this->autenticar();

        $this->postJson('/api/library', ['title' => 'Celeste'])
            ->assertCreated()
            ->assertJsonPath('entry.status', 'want_to_play')
            ->assertJsonPath('entry.hours_played', 0)
            ->assertJsonPath('entry.rating', null)
            ->assertJsonPath('entry.game.cover_url', null)
            ->assertJsonPath('entry.game.genres', []);

        // pode repetir titulo
        $this->postJson('/api/library', ['title' => 'Celeste'])->assertCreated();
        $this->assertDatabaseCount('biblioteca_jogos', 2);
    }

    public function test_cadastro_rejeita_dados_do_jogo_invalidos(): void
    {
        $this->autenticar();

        $this->postJson('/api/library', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title' => 'O campo título é obrigatório.']);

        $this->postJson('/api/library', $this->dadosDoJogo(['release_date' => '24/02/2017']))
            ->assertJsonValidationErrors(['release_date' => 'O campo data de lançamento deve estar no formato AAAA-MM-DD.']);

        $this->postJson('/api/library', $this->dadosDoJogo(['cover_url' => 'javascript:alert(1)']))
            ->assertJsonValidationErrors(['cover_url' => 'O campo URL da capa deve ser um endereço válido começando com http:// ou https://.']);

        $this->postJson('/api/library', $this->dadosDoJogo(['genres' => [999]]))
            ->assertJsonValidationErrors(['genres.0' => 'O gênero informado não existe.']);

        $this->assertDatabaseCount('jogos', 0);
    }

    public function test_validacao_do_status_das_horas_e_da_nota(): void
    {
        $this->autenticar();

        $invalidos = [
            ['status', 'terminado', 'Escolha um status válido: Quero jogar, Jogando, Pausado, Concluído ou Abandonado.'],
            ['hours_played', -1, 'As horas jogadas não podem ser negativas.'],
            ['hours_played', 1.25, 'As horas jogadas devem ter no máximo uma casa decimal.'],
            ['hours_played', 'muitas', 'As horas jogadas devem ser um número.'],
            ['rating', 11, 'A nota deve ser um número inteiro de 0 a 10.'],
            ['rating', -1, 'A nota deve ser um número inteiro de 0 a 10.'],
            ['rating', 7.5, 'A nota deve ser um número inteiro de 0 a 10.'],
            ['rating', true, 'A nota deve ser um número inteiro de 0 a 10.'],
        ];

        foreach ($invalidos as [$campo, $valor, $mensagem]) {
            $this->postJson('/api/library', $this->dadosDoJogo([$campo => $valor]))
                ->assertUnprocessable()
                ->assertJsonValidationErrors([$campo => $mensagem]);
        }

        $this->assertDatabaseCount('biblioteca_jogos', 0);

        $this->postJson('/api/library', $this->dadosDoJogo(['status' => 'abandoned', 'hours_played' => 0.5, 'rating' => 0]))
            ->assertCreated()
            ->assertJsonPath('entry.rating', 0);

        $this->postJson('/api/library', $this->dadosDoJogo(['hours_played' => 99999.9, 'rating' => 10]))
            ->assertCreated()
            ->assertJsonPath('entry.rating', 10);
    }

    public function test_listagem_e_paginada_com_os_mais_recentes_primeiro(): void
    {
        $user = $this->autenticar();
        for ($i = 1; $i <= 20; $i++) {
            $this->criarEntrada($user, ['title' => sprintf('Jogo %02d', $i)]);
        }

        $this->getJson('/api/library')
            ->assertOk()
            ->assertJsonCount(15, 'data')
            ->assertJsonPath('data.0.game.title', 'Jogo 20')
            ->assertJsonPath('meta.total', 20)
            ->assertJsonPath('meta.last_page', 2);

        $this->getJson('/api/library?page=2')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('data.4.game.title', 'Jogo 01');
    }

    public function test_busca_por_titulo(): void
    {
        $user = $this->autenticar();
        $this->criarEntrada($user, ['title' => 'Hollow Knight']);
        $this->criarEntrada($user, ['title' => 'Hades']);
        $this->criarEntrada($user, ['title' => 'Celeste']);

        $this->getJson('/api/library?search=knight')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.game.title', 'Hollow Knight');

        $this->getJson('/api/library?search=zelda')->assertOk()->assertJsonCount(0, 'data');

        // filtro como lista tem que dar 422 e nao 500
        $this->getJson('/api/library?search[]=knight')->assertUnprocessable()->assertJsonValidationErrors('search');
        $this->getJson('/api/library?genre[]=1')->assertUnprocessable()->assertJsonValidationErrors('genre');
    }

    public function test_filtros_e_contagem_por_status(): void
    {
        $user = $this->autenticar();
        $rpg = Genre::create(['name' => 'RPG']);
        $switch = Platform::create(['name' => 'Nintendo Switch']);

        $this->criarEntrada($user, ['title' => 'Hades'], ['status' => 'playing']);
        $celeste = $this->criarEntrada($user, ['title' => 'Celeste'], ['status' => 'playing']);
        $persona = $this->criarEntrada($user, ['title' => 'Persona 5'], ['status' => 'completed']);
        $persona->game->genres()->attach($rpg);
        $celeste->game->platforms()->attach($switch);

        $this->getJson('/api/library?status=playing')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.status_counts', [
                'want_to_play' => 0,
                'playing' => 2,
                'paused' => 0,
                'completed' => 1,
                'abandoned' => 0,
            ]);

        $this->getJson("/api/library?genre={$rpg->id}")->assertJsonCount(1, 'data')->assertJsonPath('data.0.game.title', 'Persona 5');
        $this->getJson("/api/library?platform={$switch->id}")->assertJsonCount(1, 'data')->assertJsonPath('data.0.game.title', 'Celeste');
    }

    public function test_filtro_com_status_invalido_retorna_422(): void
    {
        $user = $this->autenticar();
        $this->criarEntrada($user, [], ['status' => 'completed']);

        $this->getJson('/api/library?status=terminado')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status' => 'O status do filtro é inválido.']);

        $this->getJson('/api/library?status[]=completed')->assertUnprocessable()->assertJsonValidationErrors('status');

        $this->getJson('/api/library?status=completed')->assertOk()->assertJsonCount(1, 'data');
    }

    // o front usa current_page > last_page pra voltar pra ultima pagina
    public function test_pagina_alem_da_ultima_informa_qual_e_a_ultima(): void
    {
        $user = $this->autenticar();
        for ($i = 1; $i <= 16; $i++) {
            $this->criarEntrada($user, ['title' => "Jogo $i"]);
        }

        $this->getJson('/api/library?page=99')
            ->assertOk()
            ->assertJsonCount(0, 'data')
            ->assertJsonPath('meta.current_page', 99)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.total', 16);
    }

    public function test_consulta_de_entrada(): void
    {
        $user = $this->autenticar();
        $entry = $this->criarEntrada($user, [], ['status' => 'paused', 'hours_played' => 3.5, 'rating' => 6]);

        $this->getJson("/api/library/{$entry->id}")
            ->assertOk()
            ->assertJsonPath('entry.id', $entry->id)
            ->assertJsonPath('entry.status', 'paused')
            ->assertJsonPath('entry.hours_played', 3.5)
            ->assertJsonPath('entry.game.title', 'Hollow Knight');
    }

    public function test_entrada_inexistente_retorna_404(): void
    {
        $this->autenticar();

        $this->getJson('/api/library/999')
            ->assertNotFound()
            ->assertExactJson(['message' => 'Registro não encontrado.']);

        $this->putJson('/api/library/999', $this->dadosDoJogo())->assertNotFound();
        $this->deleteJson('/api/library/999')->assertNotFound();
    }

    public function test_edicao_altera_o_jogo_e_os_dados_pessoais(): void
    {
        $user = $this->autenticar();
        $entry = $this->criarEntrada($user);
        $rpg = Genre::create(['name' => 'RPG']);
        $acao = Genre::create(['name' => 'Ação']);
        $entry->game->genres()->attach($rpg);

        $this->putJson("/api/library/{$entry->id}", $this->dadosDoJogo([
            'title' => 'Hollow Knight: Silksong',
            'genres' => [$acao->id],
            'status' => 'completed',
            'hours_played' => 40.5,
            'rating' => 10,
        ]))
            ->assertOk()
            ->assertJsonPath('message', 'Alterações salvas.')
            ->assertJsonPath('entry.game.title', 'Hollow Knight: Silksong')
            ->assertJsonPath('entry.game.genres', [['id' => $acao->id, 'name' => 'Ação']])
            ->assertJsonPath('entry.status', 'completed')
            ->assertJsonPath('entry.rating', 10);

        $this->assertDatabaseMissing('jogo_genero', ['game_id' => $entry->game_id, 'genre_id' => $rpg->id]);

        $this->putJson("/api/library/{$entry->id}", ['description' => 'Sem título'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title' => 'O campo título é obrigatório.']);
    }

    public function test_patch_altera_apenas_os_campos_enviados(): void
    {
        $user = $this->autenticar();
        $entry = $this->criarEntrada($user, [], ['status' => 'playing', 'rating' => 7]);
        $entry->game->genres()->attach(Genre::create(['name' => 'RPG']));

        $this->patchJson("/api/library/{$entry->id}", ['hours_played' => 6.5])
            ->assertOk()
            ->assertJsonPath('entry.hours_played', 6.5)
            ->assertJsonPath('entry.status', 'playing')
            ->assertJsonPath('entry.rating', 7)
            ->assertJsonPath('entry.game.title', 'Hollow Knight')
            ->assertJsonCount(1, 'entry.game.genres');

        $this->patchJson("/api/library/{$entry->id}", ['title' => ''])
            ->assertJsonValidationErrors(['title' => 'O campo título é obrigatório.']);
    }

    public function test_exclusao_remove_a_entrada_e_o_jogo_mas_mantem_generos_e_plataformas(): void
    {
        $user = $this->autenticar();
        $rpg = Genre::create(['name' => 'RPG']);
        $pc = Platform::create(['name' => 'PC']);
        $entry = $this->criarEntrada($user);
        $entry->game->genres()->attach($rpg);
        $entry->game->platforms()->attach($pc);

        $this->deleteJson("/api/library/{$entry->id}")
            ->assertOk()
            ->assertExactJson(['message' => 'Jogo removido da sua biblioteca.']);

        $this->assertDatabaseMissing('biblioteca_jogos', ['id' => $entry->id]);
        $this->assertDatabaseMissing('jogos', ['id' => $entry->game_id]);
        $this->assertDatabaseCount('jogo_genero', 0);
        $this->assertDatabaseCount('jogo_plataforma', 0);
        $this->assertDatabaseHas('generos', ['id' => $rpg->id]);
        $this->assertDatabaseHas('plataformas', ['id' => $pc->id]);
    }

    public function test_um_jogo_so_pode_pertencer_a_uma_biblioteca(): void
    {
        $entry = $this->criarEntrada(User::factory()->create());

        $this->expectException(UniqueConstraintViolationException::class);

        $outra = User::factory()->create()->userGames()->make();
        $outra->game()->associate($entry->game)->save();
    }

    public function test_rotas_antigas_do_catalogo_compartilhado_nao_existem(): void
    {
        $entry = $this->criarEntrada($this->autenticar());

        $this->getJson('/api/games')->assertNotFound();
        $this->putJson("/api/games/{$entry->game_id}", $this->dadosDoJogo(['title' => 'Alterado']))->assertNotFound();
        $this->deleteJson("/api/games/{$entry->game_id}")->assertNotFound();

        $this->assertDatabaseHas('jogos', ['id' => $entry->game_id, 'title' => 'Hollow Knight']);
    }
}
