<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin() || $actor->isManager();
    }

    public function view(User $actor, User $target): bool
    {
        if ($actor->isAdmin()) {
            return true;
        }

        return $actor->isManager() && $target->isClient();
    }

    public function create(User $actor): bool
    {
        return $actor->isAdmin() || $actor->isManager();
    }

    public function update(User $actor, User $target): bool
    {
        if ($actor->isAdmin()) {
            return true;
        }

        return $actor->isManager() && $target->isClient();
    }

    public function delete(User $actor, User $target): bool
    {
        if ($actor->is($target)) {
            return false;
        }

        if ($actor->isAdmin()) {
            return true;
        }

        return $actor->isManager() && $target->isClient();
    }
}
