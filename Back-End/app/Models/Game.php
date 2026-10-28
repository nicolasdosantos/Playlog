<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'description', 'release_date', 'cover_url'])]
#[Table('jogos')]
class Game extends Model
{
    protected function casts(): array
    {
        return [
            'release_date' => 'date',
        ];
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'jogo_genero');
    }

    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class, 'jogo_plataforma');
    }

    public function userGames(): HasMany
    {
        return $this->hasMany(UserGame::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'biblioteca_jogos')
            ->withPivot('id', 'status', 'hours_played', 'rating', 'comment')
            ->withTimestamps();
    }
}
