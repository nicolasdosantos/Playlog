<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Entrada de um jogo na biblioteca de um usuário (status, horas e nota de 0 a 10).
// user_id e game_id ficam fora do Fillable: são definidos pelos relacionamentos, não pela requisição.
#[Fillable(['status', 'hours_played', 'rating', 'comment'])]
#[Table('biblioteca_jogos')]
class UserGame extends Model
{
    public const STATUSES = ['want_to_play', 'playing', 'paused', 'completed', 'abandoned'];

    // Mesmos valores padrão definidos na migration
    protected $attributes = [
        'status' => 'want_to_play',
        'hours_played' => 0,
    ];

    protected function casts(): array
    {
        return [
            'hours_played' => 'decimal:1',
            'rating' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
