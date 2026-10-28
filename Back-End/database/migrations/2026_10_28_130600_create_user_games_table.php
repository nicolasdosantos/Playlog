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
        Schema::create('user_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Um jogo que está na biblioteca de alguém não pode ser excluído
            $table->foreignId('game_id')->constrained()->restrictOnDelete();
            // Quero jogar, Jogando, Pausado, Concluído e Abandonado
            $table->enum('status', ['want_to_play', 'playing', 'paused', 'completed', 'abandoned'])
                ->default('want_to_play');
            $table->decimal('hours_played', 6, 1)->default(0);
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'game_id']);
        });

        // O Schema Builder não tem método para CHECK, então as restrições são criadas com SQL
        DB::statement('ALTER TABLE user_games ADD CONSTRAINT user_games_hours_played_check CHECK (hours_played >= 0)');
        DB::statement('ALTER TABLE user_games ADD CONSTRAINT user_games_rating_check CHECK (rating IS NULL OR rating BETWEEN 1 AND 5)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_games');
    }
};
