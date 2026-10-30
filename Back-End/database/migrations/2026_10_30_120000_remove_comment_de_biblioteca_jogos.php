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
        // essa coluna nunca foi usada
        Schema::table('biblioteca_jogos', function (Blueprint $table) {
            $table->dropColumn('comment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('biblioteca_jogos', function (Blueprint $table) {
            $table->text('comment')->nullable()->after('rating');
        });
    }
};
