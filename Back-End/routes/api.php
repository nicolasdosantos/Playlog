<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\PlatformController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Biblioteca pessoal: /api/library e /api/library/{entry}, sempre restritas às entradas do usuário autenticado.
    // Não existe rota que acesse a tabela de jogos diretamente.
    Route::apiResource('library', LibraryController::class)
        ->parameters(['library' => 'entry'])
        ->where(['entry' => '[0-9]+']);

    Route::get('/genres', [GenreController::class, 'index']);
    Route::get('/platforms', [PlatformController::class, 'index']);
});
