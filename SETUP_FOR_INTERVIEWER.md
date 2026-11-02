# Setup

The application runs entirely in Docker. You only need Docker with Compose v2 and Make installed.

From the repository root, run:

```bash
make setup
```

This creates the local environment file when needed, starts the services, runs the migrations, and loads the seed data.

## URLs

* **Application**: <http://localhost:18730>
* **API**: <http://localhost:18780/api/pets>
* **MinIO console**: <http://localhost:19001>

MinIO uses `minioadmin` as both the username and password locally.

## Commands

| Command | Description |
| --- | --- |
| `make dev` | Start the application |
| `make seed` | Run the pet seeders again |
| `make logs` | Follow the container logs |
| `make down` | Stop the application |
| `make rebuild` | Rebuild containers when dependencies or images change |
