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
        // agora cada jogo tem um dono so
        Schema::table('biblioteca_jogos', function (Blueprint $table) {
            $table->unique('game_id');
        });

        // nota muda de 1-5 pra 0-10
        DB::statement('ALTER TABLE biblioteca_jogos DROP CONSTRAINT biblioteca_jogos_rating_check');
        DB::statement('ALTER TABLE biblioteca_jogos ADD CONSTRAINT biblioteca_jogos_rating_check CHECK (rating IS NULL OR rating BETWEEN 0 AND 10)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE biblioteca_jogos DROP CONSTRAINT biblioteca_jogos_rating_check');
        DB::statement('ALTER TABLE biblioteca_jogos ADD CONSTRAINT biblioteca_jogos_rating_check CHECK (rating IS NULL OR rating BETWEEN 1 AND 5)');

        Schema::table('biblioteca_jogos', function (Blueprint $table) {
            $table->dropUnique(['game_id']);
        });
    }
};
