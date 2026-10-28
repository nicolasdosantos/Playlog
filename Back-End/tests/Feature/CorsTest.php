<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsTest extends TestCase
{
    private function preflight(string $origem)
    {
        return $this->call('OPTIONS', '/api/games', [], [], [], [
            'HTTP_ORIGIN' => $origem,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'authorization,content-type',
        ]);
    }

    public function test_front_end_local_pode_acessar_a_api(): void
    {
        foreach (['http://localhost:5173', 'http://127.0.0.1:5173'] as $origem) {
            $this->preflight($origem)
                ->assertNoContent()
                ->assertHeader('Access-Control-Allow-Origin', $origem)
                ->assertHeader('Access-Control-Max-Age', '3600');
        }
    }

    public function test_outras_origens_nao_sao_liberadas(): void
    {
        $this->preflight('http://site-qualquer.example')
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_cors_nao_libera_cookies(): void
    {
        $this->preflight('http://localhost:5173')
            ->assertHeaderMissing('Access-Control-Allow-Credentials');
    }

    public function test_metodos_de_edicao_e_exclusao_sao_liberados(): void
    {
        foreach (['PUT', 'DELETE'] as $metodo) {
            $resposta = $this->call('OPTIONS', '/api/games/1', [], [], [], [
                'HTTP_ORIGIN' => 'http://localhost:5173',
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => $metodo,
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'authorization',
            ]);

            $resposta->assertNoContent();
            $this->assertStringContainsString($metodo, $resposta->headers->get('Access-Control-Allow-Methods'));
        }
    }

    // Sem o cabeçalho de CORS no 401, o navegador esconde a resposta e o front não consegue avisar que a sessão expirou
    public function test_resposta_401_tambem_tem_o_cabecalho_de_cors(): void
    {
        $this->getJson('/api/games', ['Origin' => 'http://localhost:5173'])
            ->assertUnauthorized()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
}
