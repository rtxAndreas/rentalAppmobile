<?php

namespace Tests\Feature\Auth;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        User::factory()->client()->create(['email' => 'client@rentalapp.test']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'client@rentalapp.test',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.user.email', 'client@rentalapp.test')
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'status'],
                    'token',
                ],
            ]);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->client()->create(['email' => 'client@rentalapp.test']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'client@rentalapp.test',
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->client()->inactive()->create([
            'email' => 'client@rentalapp.test',
            'status' => UserStatus::Inactive,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'client@rentalapp.test',
            'password' => 'password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->admin()->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_guest_cannot_access_protected_routes(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->getJson('/api/v1/users')->assertUnauthorized();
    }

    public function test_authenticated_user_can_logout(): void
    {
        Sanctum::actingAs(User::factory()->client()->create());

        $this->postJson('/api/v1/auth/logout')->assertNoContent();
    }
}
