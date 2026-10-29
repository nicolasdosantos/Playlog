<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    // Cada jogo pertence a uma única entrada da biblioteca, que indica quem é o dono
    public function libraryEntry(): HasOne
    {
        return $this->hasOne(UserGame::class);
    }
}
