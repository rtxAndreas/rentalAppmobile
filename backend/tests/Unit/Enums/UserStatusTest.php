<?php

namespace Tests\Unit\Enums;

use App\Enums\UserStatus;
use PHPUnit\Framework\TestCase;

class UserStatusTest extends TestCase
{
    public function test_status_values_are_stable(): void
    {
        $this->assertSame(['active', 'inactive'], UserStatus::values());
    }

    public function test_status_labels_are_human_readable(): void
    {
        $this->assertSame('Actif', UserStatus::Active->label());
        $this->assertSame('Inactif', UserStatus::Inactive->label());
    }

    public function test_status_can_be_resolved_from_value(): void
    {
        $this->assertSame(UserStatus::Active, UserStatus::from('active'));
        $this->assertSame(UserStatus::Inactive, UserStatus::from('inactive'));
    }
}
