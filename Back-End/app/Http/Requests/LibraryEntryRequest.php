<?php

namespace App\Http\Requests;

use App\Models\UserGame;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// Dados do jogo e dados pessoais da entrada (status, horas e nota).
// user_id e game_id não estão nas regras, então não podem ser enviados pelo cliente.
class LibraryEntryRequest extends FormRequest
{
    private const GAME_FIELDS = ['title', 'description', 'release_date', 'cover_url'];

    private const ENTRY_FIELDS = ['status', 'hours_played', 'rating'];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // O token é exigido nas rotas e o controller só busca entradas do próprio usuário
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // No PATCH (atualização parcial) o título pode ser omitido, mas nunca enviado vazio
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
            // Opcionais: no cadastro valem os padrões (Quero jogar, 0 h, sem nota); na edição, mantêm o valor atual
            'status' => ['sometimes', 'required', Rule::in(UserGame::STATUSES)],
            'hours_played' => ['sometimes', 'required', 'numeric', 'decimal:0,1', 'min:0', 'max:99999.9'],
            // numeric recusa true/false, que o integer sozinho aceitaria como 1 e 0
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

    // Campos da tabela jogos que vieram na requisição
    public function gameData(): array
    {
        return $this->safe()->only(self::GAME_FIELDS);
    }

    // Campos da tabela biblioteca_jogos que vieram na requisição
    public function entryData(): array
    {
        return $this->safe()->only(self::ENTRY_FIELDS);
    }
}
