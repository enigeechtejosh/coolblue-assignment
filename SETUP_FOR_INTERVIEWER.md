# Setup

This project runs through Docker and includes the web app, API, database and object storage. 🐾

* Make sure Docker and Docker Compose v2 are installed.
* Run all commands from the root of the repository.
* No local PHP, Composer or Node.js installation is required.

Carefully follow the instructions below to start the application.

## Running the application

First, create your local environment file:

```sh
cp -n .env.example .env
```

Then start the application using the local Docker Compose configuration:

```sh
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --wait
```

Once all services are healthy, you can open the following URLs:

* **Application**: <http://localhost:18730>
* **API**: <http://localhost:18780/api/pets>
* **MinIO console**: <http://localhost:19001>

The default username and password for MinIO are both `minioadmin`.

## Seed data

The application runs its database migrations and seeders when the API starts.
To run the seeders again manually, use:

```sh
docker compose -f docker-compose.yml -f docker-compose.local.yml exec api php artisan db:seed --force
```

## Logs

To follow the application logs, use:

```sh
docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f
```

## Stopping the application

To stop and remove the local containers, use:

```sh
docker compose -f docker-compose.yml -f docker-compose.local.yml down
```

## Production

The production configuration uses only the base Docker Compose file:

```sh
docker compose -f docker-compose.yml up -d --wait
```

Before running this configuration outside a local environment, set a secure `APP_KEY`, `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` in the `.env` file.
