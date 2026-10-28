# Self-hosted single container with SQLite, not managed hosting

The app runs as one Docker Compose service on our own server, with SQLite and uploaded photos on two volumes, configured only through env vars. Vercel + Supabase (free, managed Postgres and photo storage) was considered and rejected: we want everything on our own box, behind our own network restrictions, deployable with a single `docker compose up`. SQLite fits the scale (a few machines, a handful of writes per day) and keeps backups to copying two volumes.

## Consequences

- One app instance only: SQLite and the local uploads folder do not support scaling out to several containers.
- Moving to Postgres or object storage later means a data migration, not just a config change.
