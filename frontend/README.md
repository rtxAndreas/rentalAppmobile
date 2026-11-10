# Frontend — RentalApp (Expo)

Application [Expo](https://expo.dev) avec routage par fichiers via **expo-router**.

## Démarrer

```bash
pnpm install
pnpm start
```

Puis ouvrir l'app dans un development build, un émulateur Android, un simulateur iOS ou Expo Go.

Le code applicatif se trouve dans **`src/app`** (routing par fichiers).

## Scripts

| Commande | Description |
|----------|-------------|
| `pnpm start` | Démarre le serveur Expo |
| `pnpm android` | Ouvre sur Android |
| `pnpm ios` | Ouvre sur iOS |
| `pnpm web` | Ouvre sur le web |
| `pnpm lint` | Lance ESLint |

## Structure

```
src/
├── app/          # routes (expo-router)
├── components/   # composants réutilisables
├── constants/    # thème et constantes
└── hooks/        # hooks personnalisés
assets/           # images, icônes, splash
```

## Documentation

- [Expo docs](https://docs.expo.dev/)
- [expo-router](https://docs.expo.dev/router/introduction/)
