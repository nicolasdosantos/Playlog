<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\JsonResponse;

class GenreController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Genre::orderBy('name')->get(['id', 'name']),
        ]);
    }
}
