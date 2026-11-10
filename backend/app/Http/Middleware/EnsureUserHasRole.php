<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        abort_if($user === null, 401, 'Non authentifié.');

        $allowed = array_map(fn (string $role) => UserRole::tryFrom($role), $roles);

        abort_unless($user->hasRole(...array_filter($allowed)), 403, 'Accès refusé.');

        return $next($request);
    }
}
