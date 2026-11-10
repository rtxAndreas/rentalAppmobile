<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Compte administrateur initial
    |--------------------------------------------------------------------------
    |
    | Ces valeurs sont utilisées par DatabaseSeeder pour créer (ou mettre à
    | jour) le premier compte administrateur de l'application.
    |
    */

    'admin' => [
        'name' => env('ADMIN_NAME', 'Administrateur'),
        'email' => env('ADMIN_EMAIL', 'admin@rentalapp.test'),
        'password' => env('ADMIN_PASSWORD', 'password'),
    ],

];
