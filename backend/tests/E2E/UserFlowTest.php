<?php

namespace Tests\E2E;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_user_management_flow(): void
    {
        User::factory()->admin()->create([
            'email' => 'admin.e2e@rentalapp.test',
            'password' => 'password',
        ]);

        $adminToken = $this->login('admin.e2e@rentalapp.test');

        $this->asToken($adminToken)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.role', UserRole::Admin->value);

        $managerId = $this->asToken($adminToken)
            ->postJson('/api/v1/users', [
                'name' => 'Manager E2E',
                'email' => 'manager.e2e@rentalapp.test',
                'phone' => '+221770000010',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => UserRole::Manager->value,
            ])
            ->assertCreated()
            ->assertJsonPath('data.role', UserRole::Manager->value)
            ->json('data.id');

        $managerToken = $this->login('manager.e2e@rentalapp.test');

        $this->asToken($managerToken)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.role', UserRole::Manager->value);

        $this->asToken($managerToken)
            ->getJson('/api/v1/users')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $clientId = $this->asToken($managerToken)
            ->postJson('/api/v1/users', [
                'name' => 'Client E2E',
                'email' => 'client.e2e@rentalapp.test',
                'phone' => '+221770000011',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => UserRole::Client->value,
            ])
            ->assertCreated()
            ->assertJsonPath('data.role', UserRole::Client->value)
            ->json('data.id');

        $this->asToken($managerToken)
            ->getJson('/api/v1/users')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'client.e2e@rentalapp.test');

        $clientToken = $this->login('client.e2e@rentalapp.test');

        $this->asToken($clientToken)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.role', UserRole::Client->value);

        $this->asToken($clientToken)
            ->getJson('/api/v1/users')
            ->assertForbidden();

        $this->asToken($clientToken)
            ->postJson('/api/v1/auth/logout')
            ->assertNoContent();

        $this->asToken($clientToken)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();

        $this->asToken($adminToken)
            ->deleteJson("/api/v1/users/{$clientId}")
            ->assertNoContent();

        $this->asToken($managerToken)
            ->getJson('/api/v1/users')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->asToken($adminToken)
            ->deleteJson("/api/v1/users/{$managerId}")
            ->assertNoContent();
    }

    private function login(string $email, string $password = 'password'): string
    {
        $token = $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => $password,
        ])
            ->assertOk()
            ->json('data.token');

        $this->app['auth']->forgetGuards();

        return $token;
    }

    private function asToken(string $token): static
    {
        $this->app['auth']->forgetGuards();

        return $this->withToken($token);
    }
}
