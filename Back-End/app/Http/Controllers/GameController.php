<?php

namespace App\Http\Controllers;

use App\Http\Requests\GameRequest;
use App\Http\Resources\GameResource;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $games = Game::with(['genres', 'platforms'])
            ->orderBy('title')
            ->paginate(15);

        return GameResource::collection($games);
    }

    public function store(GameRequest $request): JsonResponse
    {
        $game = DB::transaction(function () use ($request) {
            $game = Game::create($request->safe()->except(['genres', 'platforms']));
            $this->syncRelations($game, $request);

            return $game;
        });

        return response()->json([
            'message' => 'Jogo cadastrado com sucesso.',
            'game' => new GameResource($game->load(['genres', 'platforms'])),
        ], 201);
    }

    public function show(Game $game): JsonResponse
    {
        return response()->json([
            'game' => new GameResource($game->load(['genres', 'platforms'])),
        ]);
    }

    public function update(GameRequest $request, Game $game): JsonResponse
    {
        DB::transaction(function () use ($request, $game) {
            $game->update($request->safe()->except(['genres', 'platforms']));
            $this->syncRelations($game, $request);
        });

        return response()->json([
            'message' => 'Jogo atualizado com sucesso.',
            'game' => new GameResource($game->load(['genres', 'platforms'])),
        ]);
    }

    public function destroy(Game $game): JsonResponse
    {
        // O banco não deixa excluir um jogo que está na biblioteca de alguém (restrictOnDelete)
        if ($game->userGames()->exists()) {
            return response()->json([
                'message' => 'Este jogo está na biblioteca de algum usuário e não pode ser excluído.',
            ], 409);
        }

        // Os vínculos com gêneros e plataformas são apagados em cascata pelo banco
        $game->delete();

        return response()->json(['message' => 'Jogo excluído com sucesso.']);
    }

    // Só altera as associações que vieram na requisição; se a lista não for enviada, mantém as atuais
    private function syncRelations(Game $game, GameRequest $request): void
    {
        if ($request->has('genres')) {
            $game->genres()->sync($request->validated('genres'));
        }

        if ($request->has('platforms')) {
            $game->platforms()->sync($request->validated('platforms'));
        }
    }
}
