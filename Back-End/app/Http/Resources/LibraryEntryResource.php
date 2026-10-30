<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// o id aqui é o da entrada, não o do jogo
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
            // decimal:1 volta string, converte pra numero
            'hours_played' => (float) $this->hours_played,
            'rating' => $this->rating,
            'game' => new GameResource($this->whenLoaded('game')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
