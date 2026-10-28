# Coffee rating

A small web app for the office coffee machine. Stick a QR code above the machine; anyone who scans it can:

- **Refill**: say which coffee was just loaded (pick it from the catalog or add it with a photo of the package, a name and a description).
- **Rate**: rate the drink they are having (current coffee pre-selected, choose the drink, 1–5 stars, optional tasting questions and comment).
- **Dashboard**: see every coffee loaded in the machine, its ratings, tasting averages, comments and load history.

French and English, no accounts. One server can host several machines, each with its own QR code.

Vocabulary: [GLOSSARY.md](GLOSSARY.md). Design decisions: [docs/adr](docs/adr).

## Deploy with Docker Compose

Requirements: Docker with the Compose plugin. No need to clone the repo: the image is published to the GitHub Container Registry (`ghcr.io/raffaeldp/coffee-rating-app`) on every push to `main`.

1. **Download the two files**

   ```sh
   mkdir coffee-rating && cd coffee-rating
   curl -fsSLO https://raw.githubusercontent.com/raffaeldp/coffee-rating-app/main/docker-compose.yml
   curl -fsSL -o .env https://raw.githubusercontent.com/raffaeldp/coffee-rating-app/main/.env.example
   ```

   Or download them by hand: [docker-compose.yml](https://raw.githubusercontent.com/raffaeldp/coffee-rating-app/main/docker-compose.yml), [.env.example](https://raw.githubusercontent.com/raffaeldp/coffee-rating-app/main/.env.example) (save it as `.env`).

2. **Configure** by editing `.env`:

   | Variable   | Description |
   |------------|-------------|
   | `MACHINES` | JSON array on **a single line**, one object per machine (see below). Required. |
   | `PORT`     | Host port the app listens on. Default `3000`. |
   | `TZ`       | Timezone used to display dates. Default `Europe/Paris`. |

   Each machine in `MACHINES`:

   | Field    | Description |
   |----------|-------------|
   | `slug`   | Stable internal id, e.g. `paris-rdc`. Never change it once ratings exist. |
   | `name`   | Display name, e.g. `Paris – RDC`. |
   | `token`  | Secret put in the QR code URL, at least 16 characters. Generate one with `openssl rand -hex 16`. |
   | `drinks` | Drinks the machine can brew, as a list of names, e.g. `["café","chocolat chaud"]`. Any name works and is shown as written. These keys are also translated FR/EN: `espresso`, `ristretto`, `lungo`, `americano`, `cappuccino`, `latte`, `latte_macchiato`, `flat_white`, `macchiato`. Don't rename a drink once it has ratings: old ratings keep the old name. |

   Example:

   ```sh
   MACHINES=[{"slug":"paris-rdc","name":"Paris – RDC","token":"3f9c2e7a1b5d4c8e9f0a1b2c3d4e5f60","drinks":["espresso","lungo","cappuccino"]}]
   ```

   The app checks this at startup and exits with a clear error if anything is wrong (`docker compose logs`).

3. **Start**

   ```sh
   docker compose up -d
   ```

   Database migrations run automatically on startup.

4. **Print the QR code**: open `http://<your-server>:<PORT>/m/<token>/qr` and print the page. Stick it above the machine.

### Access and security

The token in the URL is the only access control: anyone who has it can refill, rate and edit coffees for that machine. Keep it out of public places, and restrict network access (VPN, IP allow-list, reverse proxy) if the server is reachable from the internet. To revoke access, change the token in `.env`, run `docker compose up -d`, and reprint the QR code. See [ADR 0001](docs/adr/0001-qr-token-as-machine-identity-and-access.md).

Behind a reverse proxy, forward the `Host` and `X-Forwarded-Proto` headers so the QR code contains the right public URL.

### Data and backups

Data lives in two Docker volumes:

- `coffee-rating_data`: the SQLite database (`/data/coffee.db`)
- `coffee-rating_uploads`: the package photos

Back them up with, for example:

```sh
docker compose stop
docker run --rm -v coffee-rating_data:/data -v coffee-rating_uploads:/uploads -v "$PWD":/backup alpine \
  tar czf /backup/coffee-backup.tgz /data /uploads
docker compose start
```

### Update

```sh
docker compose pull
docker compose up -d
```

`latest` follows `main`. To pin a version, replace `latest` in `docker-compose.yml` with a `sha-<commit>` tag from the [package page](https://github.com/raffaeldp/coffee-rating-app/pkgs/container/coffee-rating-app).

## Develop

Requirements: Node.js 24 and pnpm (`corepack enable`).

```sh
cp .env.example .env
pnpm install
pnpm dev            # http://localhost:3000/m/<token>
pnpm test           # unit tests (node --test)
pnpm db:generate    # after editing lib/schema.ts; migrations apply at startup
pnpm db:seed        # add sample coffees and ratings to the dev database (appends, never deletes)
docker build -t coffee-rating .   # build the image locally
```

Stack: Next.js (App Router, server actions), Drizzle ORM on SQLite (`better-sqlite3`), `next-intl` for translations (`messages/fr.json`, `messages/en.json`).

## License

[MIT](LICENSE)
