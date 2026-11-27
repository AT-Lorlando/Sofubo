# Sofubo

Un « BeReal » à sens unique pour les grands-parents : une photo envoyée depuis
la page admin s'affiche en permanence, avec sa date et son heure, sur une
tablette verrouillée sous Fully Kiosk Browser.

- `/` : la page de la tablette. HTML minimal, sans JavaScript, rechargée toutes les 5 minutes.
- `/admin` : connexion par mot de passe, envoi d'une photo, aperçu de ce qu'affiche la tablette.

Stack : AdonisJS 6, vues Edge, sharp. Pas de base de données : les photos sont
stockées sur disque, redimensionnées à 1280 px et débarrassées de leurs métadonnées.

## Développement

```bash
pnpm install
cp .env.example .env          # puis renseigner DISPLAY_TOKEN et ADMIN_PASSWORD
node ace generate:key         # APP_KEY
pnpm dev                      # http://localhost:3333/?token=<DISPLAY_TOKEN>
pnpm test                     # tests Japa (unit + functional)
pnpm lint && pnpm typecheck
```

## Déploiement (Koya + PM2)

Build : `pnpm install && pnpm build`, puis `pm2 start ecosystem.config.cjs --only sofubo-backend`
lancé depuis la racine du repo (le dossier photos est résolu depuis le répertoire courant).

Variables à déclarer dans Koya (aucune n'est dans le repo) :

| Variable | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `HOST`, `PORT` | adresse d'écoute |
| `APP_KEY` | `node ace generate:key --show` |
| `LOG_LEVEL` | `info` |
| `SESSION_DRIVER` | `cookie` |
| `DISPLAY_TOKEN` | secret long et aléatoire (`openssl rand -hex 24`) |
| `ADMIN_PASSWORD` | mot de passe de la page admin |
| `COOKIE_SECURE` | `false` si l'app est servie en HTTP simple (VPN) ; `true` par défaut en prod |
| `PHOTOS_DIR` | optionnel, `storage/photos` par défaut |

**nginx** : les photos de téléphone dépassent largement la limite par défaut (1 Mo).
Ajouter `client_max_body_size 25m;` sur la route du service, sinon l'envoi échoue
avant d'atteindre l'app.

Logs : JSON sur stdout (`app: "sofubo"`, `service: "backend"`), selon la convention du homelab.

**À sauvegarder** : `storage/photos/` (ou `PHOTOS_DIR`). Le dossier est hors git et
ni le déploiement ni le build n'y touchent.

## Tablette (Fully Kiosk Browser)

- **Start URL** : `http://<hôte>/?token=<DISPLAY_TOKEN>`. Changer le token dans Koya
  impose de mettre à jour cette URL.
- **Obligatoire** : un rechargement périodique de la Start URL (*Auto Reload on Idle*, par
  exemple toutes les 10 minutes). Les pages servies par l'app se rechargent seules (la photo
  toutes les 5 minutes, les erreurs au bout de 60 s), mais une page d'erreur nginx (502
  pendant un redémarrage) ne se recharge pas d'elle-même.
- Conseillé : écran toujours allumé (*Keep Screen On*), *Reload on Network Reconnect*,
  pas d'économiseur d'écran.
- Un vieil Android peut refuser les certificats HTTPS récents : à travers le VPN,
  du HTTP simple (avec `COOKIE_SECURE=false`) convient.
