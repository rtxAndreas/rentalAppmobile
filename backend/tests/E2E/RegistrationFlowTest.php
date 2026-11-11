<?php

namespace Tests\E2E;

use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_registered_client_can_login_and_is_blocked_from_user_management(): void
    {
        $token = $this->postJson('/api/v1/auth/register', [
            'name' => 'Client Inscrit',
            'email' => 'inscrit.e2e@rentalapp.test',
            'phone' => '+221770000021',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
            ->assertCreated()
            ->json('data.token');

        $this->app['auth']->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'inscrit.e2e@rentalapp.test')
            ->assertJsonPath('data.role', UserRole::Client->value);

        $this->withToken($token)
            ->getJson('/api/v1/users')
            ->assertForbidden();

        $this->withToken($token)
            ->postJson('/api/v1/auth/logout')
            ->assertNoContent();

        $this->app['auth']->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }
}
