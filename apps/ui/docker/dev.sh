#!/bin/sh
set -eu

vite_pid=""
stop_vite() {
    if [ -n "$vite_pid" ]; then
        kill "$vite_pid" 2>/dev/null || true
        wait "$vite_pid" 2>/dev/null || true
        vite_pid=""
    fi
}
trap 'stop_vite; exit 0' TERM INT
trap stop_vite EXIT

dependency_hash() {
    sha256sum package.json package-lock.json
}

attempted_hash=""
while true; do
    current_hash=$(dependency_hash)
    if [ "$current_hash" != "$attempted_hash" ]; then
        # Wait for npm to finish writing both manifests before installing.
        sleep 1
        [ "$current_hash" = "$(dependency_hash)" ] || continue
        stop_vite
        attempted_hash=$current_hash
        installed_hash=$(cat node_modules/.package-manifest.sha256 2>/dev/null || true)
        if [ "$current_hash" = "$installed_hash" ] && [ -x node_modules/.bin/vite ]; then
            install_succeeded=true
        else
            echo 'Synchronizing UI dependencies...'
            if npm ci --no-audit --no-fund; then
                printf '%s\n' "$current_hash" > node_modules/.package-manifest.sha256
                install_succeeded=true
            else
                install_succeeded=false
            fi
        fi
        if [ "$install_succeeded" = true ]; then
            node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 80 &
            vite_pid=$!
        else
            echo 'Dependency installation failed. Fix package.json/package-lock.json or restart the container to retry.' >&2
        fi
    fi
    if [ -n "$vite_pid" ] && ! kill -0 "$vite_pid" 2>/dev/null; then
        wait "$vite_pid"
        exit 1
    fi
    sleep 1
done
