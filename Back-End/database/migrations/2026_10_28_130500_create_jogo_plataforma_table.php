<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jogo_plataforma', function (Blueprint $table) {
            $table->foreignId('game_id')->constrained('jogos')->cascadeOnDelete();
            // nao deixa apagar plataforma que ainda ta em uso
            $table->foreignId('platform_id')->constrained('plataformas')->restrictOnDelete();

            $table->primary(['game_id', 'platform_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jogo_plataforma');
    }
};
