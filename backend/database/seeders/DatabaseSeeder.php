<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@rentalapp.test'],
            [
                'name' => 'Administrateur',
                'phone' => '+221770000001',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'status' => UserStatus::Active,
            ],
        );

        User::updateOrCreate(
            ['email' => 'gerant@rentalapp.test'],
            [
                'name' => 'Gérant',
                'phone' => '+221770000002',
                'password' => Hash::make('password'),
                'role' => UserRole::Manager,
                'status' => UserStatus::Active,
            ],
        );

        User::updateOrCreate(
            ['email' => 'client@rentalapp.test'],
            [
                'name' => 'Client Test',
                'phone' => '+221770000003',
                'password' => Hash::make('password'),
                'role' => UserRole::Client,
                'status' => UserStatus::Active,
            ],
        );
    }
}
