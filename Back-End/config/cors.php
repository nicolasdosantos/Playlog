<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Endereços do front-end (Vite) que podem chamar a API, separados por vírgula.
    // localhost e 127.0.0.1 são origens diferentes para o navegador, por isso os dois estão na lista.
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type'],

    'exposed_headers' => [],

    // O navegador guarda a resposta da verificação (OPTIONS) por 1 hora em vez de repeti-la a cada requisição
    'max_age' => 60 * 60,

    'supports_credentials' => false,

];
