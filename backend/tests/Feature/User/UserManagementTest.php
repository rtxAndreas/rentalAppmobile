<?php

namespace Tests\Feature\User;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_users(): void
    {
        User::factory()->count(3)->client()->create();

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/v1/users')
            ->assertOk()
            ->assertJsonCount(4, 'data');
    }

    public function test_manager_only_sees_clients(): void
    {
        $manager = User::factory()->manager()->create();
        User::factory()->client()->create(['email' => 'client@rentalapp.test']);
        User::factory()->manager()->create();
        User::factory()->admin()->create();

        Sanctum::actingAs($manager);

        $this->getJson('/api/v1/users')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'client@rentalapp.test');
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        User::factory()->manager()->create();
        User::factory()->client()->create();

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/v1/users?role=manager')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.role', UserRole::Manager->value);
    }

    public function test_manager_can_create_client(): void
    {
        Sanctum::actingAs(User::factory()->manager()->create());

        $this->postJson('/api/v1/users', $this->payload(['role' => UserRole::Client->value]))
            ->assertCreated()
            ->assertJsonPath('data.role', UserRole::Client->value);
    }

    public function test_manager_cannot_create_manager(): void
    {
        Sanctum::actingAs(User::factory()->manager()->create());

        $this->postJson('/api/v1/users', $this->payload([
            'email' => 'another-manager@rentalapp.test',
            'role' => UserRole::Manager->value,
        ]))->assertForbidden();
    }

    public function test_admin_can_create_manager(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/v1/users', $this->payload([
            'email' => 'new-manager@rentalapp.test',
            'role' => UserRole::Manager->value,
        ]))->assertCreated()
            ->assertJsonPath('data.role', UserRole::Manager->value);
    }

    public function test_store_validates_unique_email(): void
    {
        User::factory()->client()->create(['email' => 'existing@rentalapp.test']);

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/v1/users', $this->payload(['email' => 'existing@rentalapp.test']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_manager_cannot_view_admin(): void
    {
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs(User::factory()->manager()->create());

        $this->getJson("/api/v1/users/{$admin->id}")->assertForbidden();
    }

    public function test_admin_can_update_user(): void
    {
        $user = User::factory()->client()->create();

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson("/api/v1/users/{$user->id}", [
            'name' => 'Nom modifié',
            'status' => UserStatus::Inactive->value,
        ])->assertOk()
            ->assertJsonPath('data.name', 'Nom modifié')
            ->assertJsonPath('data.status', UserStatus::Inactive->value);
    }

    public function test_manager_cannot_update_admin(): void
    {
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs(User::factory()->manager()->create());

        $this->putJson("/api/v1/users/{$admin->id}", ['name' => 'Hack'])
            ->assertForbidden();
    }

    public function test_admin_cannot_delete_himself(): void
    {
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs($admin);

        $this->deleteJson("/api/v1/users/{$admin->id}")->assertForbidden();
    }

    public function test_admin_can_delete_client(): void
    {
        $client = User::factory()->client()->create();

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->deleteJson("/api/v1/users/{$client->id}")->assertNoContent();

        $this->assertDatabaseMissing('users', ['id' => $client->id]);
    }

    public function test_manager_can_delete_client(): void
    {
        $client = User::factory()->client()->create();

        Sanctum::actingAs(User::factory()->manager()->create());

        $this->deleteJson("/api/v1/users/{$client->id}")->assertNoContent();
    }

    public function test_manager_cannot_delete_admin(): void
    {
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs(User::factory()->manager()->create());

        $this->deleteJson("/api/v1/users/{$admin->id}")->assertForbidden();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Nouvel Utilisateur',
            'email' => 'new-user@rentalapp.test',
            'phone' => '+221770000009',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => UserRole::Client->value,
        ], $overrides);
    }
}
