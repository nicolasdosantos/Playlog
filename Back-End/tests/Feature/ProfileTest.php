<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// teste do 1:1 entre usuarios e perfis
class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_tem_um_perfil_e_o_perfil_pertence_ao_usuario(): void
    {
        $user = User::factory()->create();
        $profile = $user->profile()->create(['bio' => 'Gosto de RPG.']);

        $this->assertTrue($user->fresh()->profile->is($profile));
        $this->assertTrue($profile->user->is($user));
    }

    public function test_usuario_nao_pode_ter_dois_perfis(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['bio' => 'Primeiro perfil.']);

        $this->expectException(UniqueConstraintViolationException::class);

        $user->profile()->create(['bio' => 'Segundo perfil.']);
    }

    public function test_perfil_e_apagado_junto_com_o_usuario(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['bio' => 'Gosto de RPG.']);

        $user->delete();

        $this->assertDatabaseCount('perfis', 0);
    }
}
