<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// O id é o da entrada (usado em /api/library/{id}); os dados do jogo ficam em "game"
class LibraryEntryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            // O cast decimal:1 devolve texto ("12.5"); a API responde com número
            'hours_played' => (float) $this->hours_played,
            'rating' => $this->rating,
            'game' => new GameResource($this->whenLoaded('game')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
