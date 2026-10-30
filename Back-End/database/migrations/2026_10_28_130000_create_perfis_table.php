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
        Schema::create('perfis', function (Blueprint $table) {
            $table->id();
            // unique = 1:1, cada usuario tem no maximo um perfil
            $table->foreignId('user_id')->unique()->constrained('usuarios')->cascadeOnDelete();
            $table->string('bio', 500)->nullable();
            $table->string('avatar_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perfis');
    }
};
