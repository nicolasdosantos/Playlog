<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    private const MENSAGENS = [
        'required' => 'O campo :attribute é obrigatório.',
        'string' => 'O campo :attribute deve ser um texto.',
        'max' => 'O campo :attribute deve ter no máximo :max caracteres.',
        'email' => 'Informe um e-mail válido.',
        'email.unique' => 'Este e-mail já está cadastrado.',
        'password.min' => 'A senha deve ter pelo menos :min caracteres.',
        'password.confirmed' => 'A confirmação da senha não confere.',
    ];

    private const ATRIBUTOS = [
        'name' => 'nome',
        'email' => 'e-mail',
        'password' => 'senha',
    ];

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:usuarios,email'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ], self::MENSAGENS, self::ATRIBUTOS);

        // O cast "hashed" do Model User gera o hash da senha antes de salvar
        $user = User::create($data);

        return response()->json([
            'message' => 'Cadastro realizado com sucesso.',
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], self::MENSAGENS, self::ATRIBUTOS);

        $user = User::where('email', $credentials['email'])->first();

        // A mesma mensagem para e-mail inexistente e senha errada, para não revelar quais e-mails estão cadastrados
        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'E-mail ou senha inválidos.'], 401);
        }

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    public function logout(Request $request): JsonResponse
    {
        // Apaga só o token usado nesta requisição; os outros dispositivos continuam conectados
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }
}
