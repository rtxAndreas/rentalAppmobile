<?php

namespace Tests\Unit\Enums;

use App\Enums\UserRole;
use PHPUnit\Framework\TestCase;

class UserRoleTest extends TestCase
{
    public function test_role_values_are_stable(): void
    {
        $this->assertSame(['admin', 'manager', 'client'], UserRole::values());
    }

    public function test_role_labels_are_human_readable(): void
    {
        $this->assertSame('Administrateur', UserRole::Admin->label());
        $this->assertSame('Gérant', UserRole::Manager->label());
        $this->assertSame('Client', UserRole::Client->label());
    }

    public function test_role_can_be_resolved_from_value(): void
    {
        $this->assertSame(UserRole::Admin, UserRole::from('admin'));
        $this->assertSame(UserRole::Manager, UserRole::from('manager'));
        $this->assertSame(UserRole::Client, UserRole::from('client'));
    }
}
