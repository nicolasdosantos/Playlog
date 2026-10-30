<?php

namespace App\Http\Requests;

use App\Models\UserGame;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// dados do jogo + status, horas e nota
// user_id e game_id nao estao nas regras, entao nao da pra mandar pela requisicao
class LibraryEntryRequest extends FormRequest
{
    private const GAME_FIELDS = ['title', 'description', 'release_date', 'cover_url'];

    private const ENTRY_FIELDS = ['status', 'hours_played', 'rating'];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // as rotas ja pedem token e o controller filtra pelo usuario
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // no PATCH o titulo pode faltar, mas nao pode vir vazio
        $title = $this->isMethod('PATCH')
            ? ['sometimes', 'required', 'string', 'max:255']
            : ['required', 'string', 'max:255'];

        return [
            'title' => $title,
            'description' => ['nullable', 'string', 'max:5000'],
            'release_date' => ['nullable', 'date_format:Y-m-d'],
            'cover_url' => ['nullable', 'url:http,https', 'max:255'],
            'genres' => ['sometimes', 'array'],
            'genres.*' => ['integer', 'distinct', 'exists:generos,id'],
            'platforms' => ['sometimes', 'array'],
            'platforms.*' => ['integer', 'distinct', 'exists:plataformas,id'],
            // opcionais: no cadastro usa o padrao, na edicao mantem o que ja tinha
            'status' => ['sometimes', 'required', Rule::in(UserGame::STATUSES)],
            'hours_played' => ['sometimes', 'required', 'numeric', 'decimal:0,1', 'min:0', 'max:99999.9'],
            // numeric pra nao aceitar true/false
            'rating' => ['sometimes', 'nullable', 'numeric', 'integer', 'between:0,10'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'string' => 'O campo :attribute deve ser um texto.',
            'max' => 'O campo :attribute deve ter no máximo :max caracteres.',
            'date_format' => 'O campo :attribute deve estar no formato AAAA-MM-DD.',
            'url' => 'O campo :attribute deve ser um endereço válido começando com http:// ou https://.',
            'array' => 'O campo :attribute deve ser uma lista.',
            'distinct' => 'A lista de :attribute tem itens repetidos.',
            'genres.*.integer' => 'Cada item de gêneros deve ser um número inteiro.',
            'platforms.*.integer' => 'Cada item de plataformas deve ser um número inteiro.',
            'genres.*.exists' => 'O gênero informado não existe.',
            'platforms.*.exists' => 'A plataforma informada não existe.',
            'status.in' => 'Escolha um status válido: Quero jogar, Jogando, Pausado, Concluído ou Abandonado.',
            'hours_played.numeric' => 'As horas jogadas devem ser um número.',
            'hours_played.decimal' => 'As horas jogadas devem ter no máximo uma casa decimal.',
            'hours_played.min' => 'As horas jogadas não podem ser negativas.',
            'hours_played.max' => 'As horas jogadas devem ser no máximo 99999,9.',
            'rating.numeric' => 'A nota deve ser um número inteiro de 0 a 10.',
            'rating.integer' => 'A nota deve ser um número inteiro de 0 a 10.',
            'rating.between' => 'A nota deve ser um número inteiro de 0 a 10.',
        ];
    }

    public function attributes(): array
    {
        return [
            'title' => 'título',
            'description' => 'descrição',
            'release_date' => 'data de lançamento',
            'cover_url' => 'URL da capa',
            'genres' => 'gêneros',
            'genres.*' => 'gêneros',
            'platforms' => 'plataformas',
            'platforms.*' => 'plataformas',
            'status' => 'status',
            'hours_played' => 'horas jogadas',
            'rating' => 'nota',
        ];
    }

    // campos da tabela jogos
    public function gameData(): array
    {
        return $this->safe()->only(self::GAME_FIELDS);
    }

    // campos da tabela biblioteca_jogos
    public function entryData(): array
    {
        return $this->safe()->only(self::ENTRY_FIELDS);
    }
}
