.PHONY: setup dev rebuild seed down logs ui-install ui-dev ui-test ui-check api-test api-lint api-analyse api-check ui-test-e2e

COMPOSE_LOCAL = docker compose -f docker-compose.yml -f docker-compose.local.yml

setup:
	test -f .env || cp .env.example .env
	$(COMPOSE_LOCAL) up -d --wait

dev:
	$(COMPOSE_LOCAL) up -d --wait

rebuild:
	$(COMPOSE_LOCAL) up --build -d --wait

seed:
	$(COMPOSE_LOCAL) exec api php artisan db:seed --force

down:
	$(COMPOSE_LOCAL) down

logs:
	$(COMPOSE_LOCAL) logs -f

ui-install:
	npm ci --prefix apps/ui

ui-dev:
	npm run dev --prefix apps/ui

ui-test:
	npm test --prefix apps/ui

ui-check:
	npm run typecheck --prefix apps/ui
	npm run lint --prefix apps/ui
	npm run build --prefix apps/ui

api-test:
	docker build --target development -t pet-app-api-test apps/api
	docker run --rm pet-app-api-test php artisan test

api-lint:
	docker build --target development -t pet-app-api-test apps/api
	docker run --rm pet-app-api-test vendor/bin/pint --test

api-analyse:
	composer --working-dir=apps/api analyse

api-check:
	composer --working-dir=apps/api check

ui-test-e2e:
	$(COMPOSE_LOCAL) --profile tests run --rm ui-tests
