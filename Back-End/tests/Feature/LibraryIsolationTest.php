<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\User;
use App\Models\UserGame;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

// cada usuario so ve e mexe na propria biblioteca
class LibraryIsolationTest extends TestCase
{
    use RefreshDatabase;

    private function criarEntrada(User $user, string $title, string $status): UserGame
    {
        $entry = $user->userGames()->make(['status' => $status]);
        $entry->game()->associate(Game::create(['title' => $title]))->save();

        return $entry;
    }

    public function test_listagem_busca_e_contagem_mostram_apenas_a_propria_biblioteca(): void
    {
        $ana = User::factory()->create();
        $bruno = User::factory()->create();
        $this->criarEntrada($ana, 'Jogo da Ana', 'playing');
        $this->criarEntrada($bruno, 'Jogo do Bruno', 'completed');

        Sanctum::actingAs($ana);

        $this->getJson('/api/library')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.game.title', 'Jogo da Ana')
            ->assertJsonPath('meta.status_counts.completed', 0);

        $this->getJson('/api/library?search=Bruno')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_nao_e_possivel_consultar_editar_ou_excluir_a_entrada_de_outra_conta(): void
    {
        $ana = User::factory()->create();
        $entradaDoBruno = $this->criarEntrada(User::factory()->create(), 'Jogo do Bruno', 'completed');

        Sanctum::actingAs($ana);

        $this->getJson("/api/library/{$entradaDoBruno->id}")->assertNotFound();
        $this->putJson("/api/library/{$entradaDoBruno->id}", ['title' => 'Alterado pela Ana'])->assertNotFound();
        $this->patchJson("/api/library/{$entradaDoBruno->id}", ['status' => 'abandoned'])->assertNotFound();
        $this->deleteJson("/api/library/{$entradaDoBruno->id}")->assertNotFound();

        $this->assertDatabaseHas('biblioteca_jogos', ['id' => $entradaDoBruno->id, 'status' => 'completed']);
        $this->assertDatabaseHas('jogos', ['id' => $entradaDoBruno->game_id, 'title' => 'Jogo do Bruno']);
    }

    public function test_user_id_e_game_id_enviados_pelo_cliente_sao_ignorados(): void
    {
        $ana = User::factory()->create();
        $bruno = User::factory()->create();
        $entradaDoBruno = $this->criarEntrada($bruno, 'Jogo do Bruno', 'completed');

        Sanctum::actingAs($ana);

        $this->postJson('/api/library', [
            'title' => 'Jogo novo',
            'user_id' => $bruno->id,
            'game_id' => $entradaDoBruno->game_id,
        ])->assertCreated();

        $nova = UserGame::latest('id')->first();
        $this->assertSame($ana->id, $nova->user_id);
        $this->assertNotSame($entradaDoBruno->game_id, $nova->game_id);
        $this->assertSame(1, $bruno->userGames()->count());
    }
}
