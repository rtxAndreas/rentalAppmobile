<?php

namespace Tests\Unit\Policies;

use App\Enums\UserRole;
use App\Models\User;
use App\Policies\UserPolicy;
use PHPUnit\Framework\TestCase;

class UserPolicyTest extends TestCase
{
    private UserPolicy $policy;

    private int $nextId = 1;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new UserPolicy;
    }

    public function test_admin_can_view_any_user(): void
    {
        $this->assertTrue($this->policy->viewAny($this->user(UserRole::Admin)));
    }

    public function test_manager_can_view_any_user(): void
    {
        $this->assertTrue($this->policy->viewAny($this->user(UserRole::Manager)));
    }

    public function test_client_cannot_view_any_user(): void
    {
        $this->assertFalse($this->policy->viewAny($this->user(UserRole::Client)));
    }

    public function test_admin_can_create_users(): void
    {
        $this->assertTrue($this->policy->create($this->user(UserRole::Admin)));
    }

    public function test_manager_can_create_users(): void
    {
        $this->assertTrue($this->policy->create($this->user(UserRole::Manager)));
    }

    public function test_client_cannot_create_users(): void
    {
        $this->assertFalse($this->policy->create($this->user(UserRole::Client)));
    }

    public function test_admin_can_view_update_and_delete_any_user(): void
    {
        $admin = $this->user(UserRole::Admin);
        $manager = $this->user(UserRole::Manager);
        $client = $this->user(UserRole::Client);

        $this->assertTrue($this->policy->view($admin, $manager));
        $this->assertTrue($this->policy->update($admin, $manager));
        $this->assertTrue($this->policy->delete($admin, $manager));
        $this->assertTrue($this->policy->view($admin, $client));
        $this->assertTrue($this->policy->update($admin, $client));
        $this->assertTrue($this->policy->delete($admin, $client));
    }

    public function test_manager_can_only_manage_clients(): void
    {
        $manager = $this->user(UserRole::Manager);
        $client = $this->user(UserRole::Client);
        $otherManager = $this->user(UserRole::Manager);
        $admin = $this->user(UserRole::Admin);

        $this->assertTrue($this->policy->view($manager, $client));
        $this->assertTrue($this->policy->update($manager, $client));
        $this->assertTrue($this->policy->delete($manager, $client));

        $this->assertFalse($this->policy->view($manager, $otherManager));
        $this->assertFalse($this->policy->update($manager, $otherManager));
        $this->assertFalse($this->policy->delete($manager, $otherManager));

        $this->assertFalse($this->policy->view($manager, $admin));
        $this->assertFalse($this->policy->update($manager, $admin));
        $this->assertFalse($this->policy->delete($manager, $admin));
    }

    public function test_client_cannot_manage_any_user(): void
    {
        $client = $this->user(UserRole::Client);
        $other = $this->user(UserRole::Client);

        $this->assertFalse($this->policy->view($client, $other));
        $this->assertFalse($this->policy->update($client, $other));
        $this->assertFalse($this->policy->delete($client, $other));
    }

    public function test_nobody_can_delete_themselves(): void
    {
        $admin = $this->user(UserRole::Admin);
        $manager = $this->user(UserRole::Manager);

        $this->assertFalse($this->policy->delete($admin, $admin));
        $this->assertFalse($this->policy->delete($manager, $manager));
    }

    private function user(UserRole $role): User
    {
        $user = new User(['role' => $role]);
        $user->id = $this->nextId++;

        return $user;
    }
}
