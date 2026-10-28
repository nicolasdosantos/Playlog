<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'release_date' => $this->release_date?->format('Y-m-d'),
            'cover_url' => $this->cover_url,
            'genres' => $this->whenLoaded('genres', fn () => $this->genres->map->only(['id', 'name'])->values()),
            'platforms' => $this->whenLoaded('platforms', fn () => $this->platforms->map->only(['id', 'name'])->values()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
