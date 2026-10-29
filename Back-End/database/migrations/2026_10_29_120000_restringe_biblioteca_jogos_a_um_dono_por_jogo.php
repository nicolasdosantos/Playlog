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
        // Cada jogo passa a pertencer a uma única entrada da biblioteca (e, portanto, a um único usuário)
        Schema::table('biblioteca_jogos', function (Blueprint $table) {
            $table->unique('game_id');
        });

        // A nota pessoal passa da escala de 1 a 5 para 0 a 10
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
