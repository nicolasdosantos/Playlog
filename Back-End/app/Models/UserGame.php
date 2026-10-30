<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// jogo na biblioteca de um usuario (status, horas e nota)
// user_id e game_id fora do fillable de proposito
#[Fillable(['status', 'hours_played', 'rating'])]
#[Table('biblioteca_jogos')]
class UserGame extends Model
{
    public const STATUSES = ['want_to_play', 'playing', 'paused', 'completed', 'abandoned'];

    // mesmo padrao da migration
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
