<?php

namespace Database\Seeders;

use App\Models\Genre;
use App\Models\Platform;
use Illuminate\Database\Seeder;

class CatalogoSeeder extends Seeder
{
    private const GENEROS = [
        'Ação', 'Aventura', 'Corrida', 'Esportes', 'Estratégia', 'Indie', 'Luta',
        'Plataforma', 'Puzzle', 'RPG', 'Simulação', 'Terror', 'Tiro',
    ];

    private const PLATAFORMAS = [
        'PC', 'PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X|S',
        'Nintendo Switch', 'Nintendo Switch 2', 'Mobile',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // firstOrCreate só cria o que ainda não existe: rodar de novo não duplica nem altera registros
        foreach (self::GENEROS as $nome) {
            Genre::firstOrCreate(['name' => $nome]);
        }

        foreach (self::PLATAFORMAS as $nome) {
            Platform::firstOrCreate(['name' => $nome]);
        }
    }
}
