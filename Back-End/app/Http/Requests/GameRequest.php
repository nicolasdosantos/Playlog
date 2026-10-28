<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GameRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // O acesso já é controlado pelo middleware auth:sanctum nas rotas
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
            'integer' => 'Cada item de :attribute deve ser um número inteiro.',
            'distinct' => 'A lista de :attribute tem itens repetidos.',
            'genres.*.exists' => 'O gênero informado não existe.',
            'platforms.*.exists' => 'A plataforma informada não existe.',
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
        ];
    }
}
