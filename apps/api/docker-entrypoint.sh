#!/bin/sh
set -eu
# Stateless API: set a persistent APP_KEY in the environment if encrypted state is added.
if [ -z "${APP_KEY:-}" ]; then
    export APP_KEY="$(php -r 'echo "base64:".base64_encode(random_bytes(32));')"
fi

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ] && [ "${DB_DATABASE:-:memory:}" != ":memory:" ]; then
    mkdir -p "$(dirname "${DB_DATABASE}")"
    touch "${DB_DATABASE}"
fi

php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction

exec docker-php-entrypoint "$@"
