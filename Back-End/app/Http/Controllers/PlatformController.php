<?php

namespace App\Http\Controllers;

use App\Models\Platform;
use Illuminate\Http\JsonResponse;

class PlatformController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Platform::orderBy('name')->get(['id', 'name']),
        ]);
    }
}
