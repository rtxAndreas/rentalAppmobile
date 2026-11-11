<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class UserService
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(User $actor, array $filters): LengthAwarePaginator
    {
        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';
        $perPage = (int) ($filters['per_page'] ?? 15);

        return User::query()
            ->when($actor->isManager(), fn (Builder $query) => $query->where('role', UserRole::Client->value))
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($filters['role'] ?? null, fn (Builder $query, string $role) => $query->where('role', $role))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->orderBy($sort, $direction)
            ->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $actor, array $data): User
    {
        $this->ensureRoleCanBeAssigned($actor, UserRole::from($data['role']));

        $data['status'] ??= UserStatus::Active->value;

        return User::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $actor, User $target, array $data): User
    {
        if (isset($data['role'])) {
            $role = UserRole::from($data['role']);
            $this->ensureRoleCanBeAssigned($actor, $role);

            if ($actor->is($target) && $role !== UserRole::Admin) {
                throw ValidationException::withMessages([
                    'role' => 'Vous ne pouvez pas retirer votre propre rôle administrateur.',
                ]);
            }
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $target->update($data);

        return $target->refresh();
    }

    public function delete(User $actor, User $target): void
    {
        if ($actor->is($target)) {
            throw ValidationException::withMessages([
                'user' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ]);
        }

        $target->delete();
    }

    private function ensureRoleCanBeAssigned(User $actor, UserRole $role): void
    {
        if ($actor->isManager() && $role !== UserRole::Client) {
            throw new AuthorizationException('Un gérant ne peut gérer que des comptes clients.');
        }
    }
}
