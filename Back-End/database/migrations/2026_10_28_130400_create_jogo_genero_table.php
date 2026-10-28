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
        Schema::create('jogo_genero', function (Blueprint $table) {
            $table->foreignId('game_id')->constrained('jogos')->cascadeOnDelete();
            // Um gênero ainda usado por algum jogo não pode ser excluído
            $table->foreignId('genre_id')->constrained('generos')->restrictOnDelete();

            $table->primary(['game_id', 'genre_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jogo_genero');
    }
};
