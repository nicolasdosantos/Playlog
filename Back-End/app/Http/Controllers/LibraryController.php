<?php

namespace App\Http\Controllers;

use App\Http\Requests\LibraryEntryRequest;
use App\Http\Resources\LibraryEntryResource;
use App\Models\Game;
use App\Models\UserGame;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

// Biblioteca pessoal: todas as consultas partem das entradas do usuário logado,
// então a entrada de outra pessoa nunca é encontrada (responde 404)
class LibraryController extends Controller
{
    private const RELATIONS = ['game.genres', 'game.platforms'];

    public function index(Request $request): AnonymousResourceCollection
    {
        // Sem isso, um filtro enviado como lista (ex.: ?search[]=x) causaria um erro 500
        $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string'],
            'genre' => ['nullable', 'integer'],
            'platform' => ['nullable', 'integer'],
        ], [
            'search.string' => 'A busca deve ser um texto.',
            'search.max' => 'A busca deve ter no máximo 255 caracteres.',
            'status.string' => 'O status do filtro é inválido.',
            'genre.integer' => 'O gênero do filtro é inválido.',
            'platform.integer' => 'A plataforma do filtro é inválida.',
        ]);

        $query = $request->user()->userGames()->with(self::RELATIONS);

        if ($request->filled('search')) {
            $query->whereHas('game', fn ($game) => $game->where('title', 'like', '%'.$request->search.'%'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('genre')) {
            $query->whereHas('game.genres', fn ($genres) => $genres->where('generos.id', $request->genre));
        }

        if ($request->filled('platform')) {
            $query->whereHas('game.platforms', fn ($platforms) => $platforms->where('plataformas.id', $request->platform));
        }

        $entries = $query->latest('id')->paginate(15)->withQueryString();

        return LibraryEntryResource::collection($entries)->additional([
            'meta' => ['status_counts' => $this->statusCounts($request)],
        ]);
    }

    public function store(LibraryEntryRequest $request): JsonResponse
    {
        // O jogo, os gêneros, as plataformas e a entrada são salvos juntos: se algo falhar, nada fica gravado
        $entry = DB::transaction(function () use ($request) {
            $game = Game::create($request->gameData());
            $this->syncRelations($game, $request);

            $entry = $request->user()->userGames()->make($request->entryData());
            $entry->game()->associate($game)->save();

            return $entry;
        });

        return response()->json([
            'message' => 'Jogo adicionado à sua biblioteca.',
            'entry' => new LibraryEntryResource($entry->load(self::RELATIONS)),
        ], 201);
    }

    public function show(Request $request, string $entry): JsonResponse
    {
        return response()->json([
            'entry' => new LibraryEntryResource($this->findEntry($request, $entry)),
        ]);
    }

    public function update(LibraryEntryRequest $request, string $entry): JsonResponse
    {
        $entry = $this->findEntry($request, $entry);

        DB::transaction(function () use ($request, $entry) {
            $entry->game->update($request->gameData());
            $this->syncRelations($entry->game, $request);
            $entry->update($request->entryData());
        });

        return response()->json([
            'message' => 'Alterações salvas.',
            'entry' => new LibraryEntryResource($entry->fresh(self::RELATIONS)),
        ]);
    }

    public function destroy(Request $request, string $entry): JsonResponse
    {
        $entry = $this->findEntry($request, $entry);

        // A entrada é apagada antes do jogo, porque o banco não deixa excluir um jogo que está na biblioteca.
        // Os vínculos do jogo com gêneros e plataformas são apagados em cascata pelo banco.
        DB::transaction(function () use ($entry) {
            $game = $entry->game;
            $entry->delete();
            $game->delete();
        });

        return response()->json(['message' => 'Jogo removido da sua biblioteca.']);
    }

    private function findEntry(Request $request, string $id): UserGame
    {
        return $request->user()->userGames()->with(self::RELATIONS)->findOrFail($id);
    }

    // Quantos jogos o usuário tem em cada status, para os filtros da tela
    private function statusCounts(Request $request): array
    {
        $counts = $request->user()->userGames()
            ->selectRaw('status, COUNT(*) AS total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $result = [];
        foreach (UserGame::STATUSES as $status) {
            $result[$status] = (int) ($counts[$status] ?? 0);
        }

        return $result;
    }

    // Só altera as associações que vieram na requisição; se a lista não for enviada, mantém as atuais
    private function syncRelations(Game $game, LibraryEntryRequest $request): void
    {
        if ($request->has('genres')) {
            $game->genres()->sync($request->validated('genres'));
        }

        if ($request->has('platforms')) {
            $game->platforms()->sync($request->validated('platforms'));
        }
    }
}
