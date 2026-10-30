<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('biblioteca_jogos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            // nao deixa apagar jogo que ta numa biblioteca
            $table->foreignId('game_id')->constrained('jogos')->restrictOnDelete();
            // Quero jogar, Jogando, Pausado, Concluido e Abandonado
            $table->enum('status', ['want_to_play', 'playing', 'paused', 'completed', 'abandoned'])
                ->default('want_to_play');
            $table->decimal('hours_played', 6, 1)->default(0);
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'game_id']);
        });

        // o Schema nao tem CHECK, entao vai em SQL
        DB::statement('ALTER TABLE biblioteca_jogos ADD CONSTRAINT biblioteca_jogos_hours_played_check CHECK (hours_played >= 0)');
        DB::statement('ALTER TABLE biblioteca_jogos ADD CONSTRAINT biblioteca_jogos_rating_check CHECK (rating IS NULL OR rating BETWEEN 1 AND 5)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('biblioteca_jogos');
    }
};
