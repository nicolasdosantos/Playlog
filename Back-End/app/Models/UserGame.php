<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// user_id fica fora do Fillable: o dono do registro é definido pelo relacionamento
// ($user->userGames()->create(...)), nunca por dados enviados na requisição
#[Fillable(['game_id', 'status', 'hours_played', 'rating', 'comment'])]
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
