<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name'])]
#[Table('plataformas')]
class Platform extends Model
{
    public function games(): BelongsToMany
    {
        return $this->belongsToMany(Game::class, 'jogo_plataforma');
    }
}
