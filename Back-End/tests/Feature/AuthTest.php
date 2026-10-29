<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function dadosDeCadastro(array $alteracoes = []): array
    {
        return array_merge([
            'name' => 'Ana Souza',
            'email' => 'ana@exemplo.com',
            'password' => 'senha-segura-123',
            'password_confirmation' => 'senha-segura-123',
        ], $alteracoes);
    }

    public function test_usuario_consegue_se_cadastrar(): void
    {
        $response = $this->postJson('/api/register', $this->dadosDeCadastro());

        $response->assertCreated()
            ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email'], 'token'])
            ->assertJsonPath('user.email', 'ana@exemplo.com');

        $this->assertDatabaseHas('usuarios', ['email' => 'ana@exemplo.com']);
    }

    public function test_senha_e_salva_com_hash_e_nao_aparece_na_resposta(): void
    {
        $response = $this->postJson('/api/register', $this->dadosDeCadastro());

        $user = User::where('email', 'ana@exemplo.com')->first();

        $this->assertNotSame('senha-segura-123', $user->password);
        $this->assertTrue(Hash::check('senha-segura-123', $user->password));

        $response->assertJsonMissingPath('user.password');
        $this->assertStringNotContainsString($user->password, $response->getContent());
        $this->assertStringNotContainsString('senha-segura-123', $response->getContent());
    }

    public function test_nao_permite_cadastro_com_email_duplicado(): void
    {
        User::factory()->create(['email' => 'ana@exemplo.com']);

        $this->postJson('/api/register', $this->dadosDeCadastro())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'Este e-mail já está cadastrado.']);

        $this->assertDatabaseCount('usuarios', 1);
    }

    public function test_cadastro_exige_os_campos_obrigatorios(): void
    {
        $this->postJson('/api/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name' => 'O campo nome é obrigatório.',
                'email' => 'O campo e-mail é obrigatório.',
                'password' => 'O campo senha é obrigatório.',
            ]);
    }

    public function test_cadastro_rejeita_dados_invalidos(): void
    {
        $this->postJson('/api/register', $this->dadosDeCadastro(['email' => 'email-invalido']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'Informe um e-mail válido.']);

        $this->postJson('/api/register', $this->dadosDeCadastro(['name' => str_repeat('a', 256)]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name' => 'O campo nome deve ter no máximo 255 caracteres.']);

        $this->postJson('/api/register', $this->dadosDeCadastro(['password' => '123', 'password_confirmation' => '123']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password' => 'A senha deve ter pelo menos 8 caracteres.']);

        $this->postJson('/api/register', $this->dadosDeCadastro(['password_confirmation' => 'outra-senha-123']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password' => 'A confirmação da senha não confere.']);

        $this->assertDatabaseCount('usuarios', 0);
    }

    public function test_login_com_credenciais_validas_retorna_token(): void
    {
        User::factory()->create(['email' => 'ana@exemplo.com', 'password' => 'senha-segura-123']);

        $response = $this->postJson('/api/login', [
            'email' => 'ana@exemplo.com',
            'password' => 'senha-segura-123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email'], 'token'])
            ->assertJsonMissingPath('user.password');

        $this->getJson('/api/user', ['Authorization' => 'Bearer '.$response->json('token')])
            ->assertOk()
            ->assertJsonPath('user.email', 'ana@exemplo.com');
    }

    // A mesma mensagem para senha errada e e-mail inexistente, para não revelar quais e-mails estão cadastrados
    public function test_login_invalido_retorna_401_com_a_mesma_mensagem(): void
    {
        User::factory()->create(['email' => 'ana@exemplo.com', 'password' => 'senha-segura-123']);

        $this->postJson('/api/login', ['email' => 'ana@exemplo.com', 'password' => 'senha-errada'])
            ->assertUnauthorized()
            ->assertExactJson(['message' => 'E-mail ou senha inválidos.']);

        $this->postJson('/api/login', ['email' => 'ninguem@exemplo.com', 'password' => 'senha-segura-123'])
            ->assertUnauthorized()
            ->assertExactJson(['message' => 'E-mail ou senha inválidos.']);
    }

    public function test_rota_protegida_recusa_requisicao_sem_token_ou_com_token_invalido(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
        $this->postJson('/api/logout')->assertUnauthorized();
        $this->getJson('/api/user', ['Authorization' => 'Bearer 1|token-que-nao-existe'])->assertUnauthorized();

        // Mesmo sem pedir JSON, a API responde 401 em JSON (não tenta redirecionar para uma página de login)
        $this->get('/api/user')
            ->assertUnauthorized()
            ->assertExactJson(['message' => 'Unauthenticated.']);
    }

    public function test_logout_invalida_o_token_usado(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->postJson('/api/logout', [], ['Authorization' => "Bearer $token"])
            ->assertOk()
            ->assertJsonPath('message', 'Logout realizado com sucesso.');

        $this->assertDatabaseCount('personal_access_tokens', 0);

        // O guard guarda o usuário autenticado entre requisições do mesmo teste; limpa para validar o token de novo
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/user', ['Authorization' => "Bearer $token"])
            ->assertUnauthorized();
    }

    public function test_login_valida_os_campos_com_mensagens_em_portugues(): void
    {
        $this->postJson('/api/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'email' => 'O campo e-mail é obrigatório.',
                'password' => 'O campo senha é obrigatório.',
            ]);

        $this->postJson('/api/login', ['email' => 'email-invalido', 'password' => 'qualquer'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'Informe um e-mail válido.']);
    }

    public function test_token_expira_depois_de_24_horas(): void
    {
        $this->assertSame(60 * 24, config('sanctum.expiration'));

        $token = User::factory()->create()->createToken('auth_token')->plainTextToken;

        $this->travel(24 * 60 - 1)->minutes();
        $this->getJson('/api/user', ['Authorization' => "Bearer $token"])->assertOk();

        $this->app['auth']->forgetGuards();

        $this->travel(2)->minutes();
        $this->getJson('/api/user', ['Authorization' => "Bearer $token"])->assertUnauthorized();
    }

    public function test_login_e_bloqueado_depois_de_5_tentativas_por_minuto(): void
    {
        User::factory()->create(['email' => 'ana@exemplo.com', 'password' => 'senha-segura-123']);
        $senhaErrada = ['email' => 'ana@exemplo.com', 'password' => 'senha-errada'];
        $senhaCerta = ['email' => 'ana@exemplo.com', 'password' => 'senha-segura-123'];

        for ($tentativa = 1; $tentativa <= 5; $tentativa++) {
            $this->postJson('/api/login', $senhaErrada)->assertUnauthorized();
        }

        $this->postJson('/api/login', $senhaErrada)
            ->assertTooManyRequests()
            ->assertHeader('Retry-After');

        // Depois do limite, nem a senha certa é aceita até o bloqueio acabar
        $this->postJson('/api/login', $senhaCerta)->assertTooManyRequests();

        $this->travel(61)->seconds();
        $this->postJson('/api/login', $senhaCerta)->assertOk()->assertJsonStructure(['token']);
    }
}
