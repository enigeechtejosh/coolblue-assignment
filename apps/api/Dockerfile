FROM dunglas/frankenphp:php8.4-alpine AS base
RUN install-php-extensions mbstring intl pdo_sqlite pcntl zip dom xml xmlwriter gd
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
WORKDIR /app

FROM base AS development
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts --no-progress
COPY . .
RUN composer dump-autoload --optimize
RUN chmod +x /app/docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

FROM development AS production-build
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-progress

FROM base AS production
ENV APP_ENV=production APP_DEBUG=false LOG_CHANNEL=stderr SESSION_DRIVER=array CACHE_STORE=array QUEUE_CONNECTION=sync
COPY --from=production-build /app /app
COPY Caddyfile /etc/caddy/Caddyfile
RUN chmod +x /app/docker-entrypoint.sh && mkdir -p /data/caddy /config/caddy && chown -R www-data:www-data /app/storage /app/bootstrap/cache /data/caddy /config/caddy
USER www-data
EXPOSE 8000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
