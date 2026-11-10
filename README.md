# RentalApp

Application de location organisée en deux projets séparés :

```
RentalApp/
├── frontend/   # Application mobile Expo / React Native
├── backend/    # API Laravel (PHP)
└── README.md
```

## Frontend (`frontend/`)

Application Expo Router (React Native + web).

```bash
cd frontend
pnpm install
pnpm start        # démarre Expo
pnpm android      # Android
pnpm ios          # iOS
pnpm web          # Web
```

## Backend (`backend/`)

API Laravel.

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Développement

Lancer le backend et le frontend dans deux terminaux séparés :

```bash
# Terminal 1
cd backend && php artisan serve

# Terminal 2
cd frontend && pnpm start
```
# rentalAppmobile
