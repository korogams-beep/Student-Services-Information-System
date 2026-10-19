<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request and ensure the caller has an authorized role.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $userRole = $request->header('X-User-Role')
            ?? $request->input('caller_role')
            ?? ($request->user()?->role ?? null);

        if ($userRole) {
            $userRole = trim($userRole);
            if ($userRole === 'Department Staff') {
                $userRole = 'DepartmentStaff';
            }
        }

        // Normalize expected roles
        $normalizedRoles = array_map(function ($r) {
            $trimmed = trim($r);

            return $trimmed === 'Department Staff' ? 'DepartmentStaff' : $trimmed;
        }, $roles);

        if (! $userRole || (! in_array($userRole, $normalizedRoles, true) && ! in_array('*', $normalizedRoles, true))) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied: Insufficient privileges for this role boundary.',
                'required_roles' => $roles,
                'current_role' => $userRole ?? 'Guest / Unauthenticated',
            ], 403);
        }

        return $next($request);
    }
}
