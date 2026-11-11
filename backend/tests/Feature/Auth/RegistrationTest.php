<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_register_and_receives_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Nouveau Client',
            'email' => 'nouveau@rentalapp.test',
            'phone' => '+221770000020',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.email', 'nouveau@rentalapp.test')
            ->assertJsonPath('data.user.role', UserRole::Client->value)
            ->assertJsonPath('data.user.status', UserStatus::Active->value)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'status'],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'nouveau@rentalapp.test',
            'role' => UserRole::Client->value,
            'status' => UserStatus::Active->value,
        ]);

        $this->app['auth']->forgetGuards();

        $this->withToken($response->json('data.token'))
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'nouveau@rentalapp.test');
    }

    public function test_registration_forces_client_role_and_active_status(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Escalade',
            'email' => 'escalade@rentalapp.test',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => UserRole::Admin->value,
            'status' => UserStatus::Inactive->value,
        ])
            ->assertCreated()
            ->assertJsonPath('data.user.role', UserRole::Client->value)
            ->assertJsonPath('data.user.status', UserStatus::Active->value);

        $this->assertDatabaseHas('users', [
            'email' => 'escalade@rentalapp.test',
            'role' => UserRole::Client->value,
            'status' => UserStatus::Active->value,
        ]);
    }

    public function test_registration_requires_unique_email(): void
    {
        User::factory()->client()->create(['email' => 'existing@rentalapp.test']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Doublon',
            'email' => 'existing@rentalapp.test',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_registration_requires_password_confirmation(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sans Confirmation',
            'email' => 'sans-confirmation@rentalapp.test',
            'password' => 'password',
            'password_confirmation' => 'different-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_registration_validates_required_fields(): void
    {
        $this->postJson('/api/v1/auth/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }
}
