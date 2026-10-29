<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsTest extends TestCase
{
    private function preflight(string $origem, string $metodo = 'GET')
    {
        return $this->call('OPTIONS', '/api/library/1', [], [], [], [
            'HTTP_ORIGIN' => $origem,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => $metodo,
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'authorization,content-type',
        ]);
    }

    public function test_front_end_local_pode_acessar_a_api_com_todos_os_metodos_do_crud(): void
    {
        foreach (['http://localhost:5173', 'http://127.0.0.1:5173'] as $origem) {
            $this->preflight($origem)
                ->assertNoContent()
                ->assertHeader('Access-Control-Allow-Origin', $origem);
        }

        foreach (['POST', 'PUT', 'DELETE'] as $metodo) {
            $metodos = $this->preflight('http://localhost:5173', $metodo)->headers->get('Access-Control-Allow-Methods');
            $this->assertStringContainsString($metodo, $metodos);
        }
    }

    public function test_outras_origens_nao_sao_liberadas(): void
    {
        $this->preflight('http://site-qualquer.example')
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    // Sem o cabeçalho de CORS no 401, o navegador esconde a resposta e o front não consegue avisar que a sessão expirou
    public function test_resposta_401_tambem_tem_o_cabecalho_de_cors(): void
    {
        $this->getJson('/api/library', ['Origin' => 'http://localhost:5173'])
            ->assertUnauthorized()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
}
