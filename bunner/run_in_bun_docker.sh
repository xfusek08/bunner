#!/bin/bash

run_in_bun_docker() {
    local directory=$(pwd)
    local args=$(echo "$@" | sed "s|$directory|/app|g") # Map paths from host to container
    docker run \
        --init \
        -it \
        --rm \
        -v "$directory:/app" \
        -w "/app" \
        -u bun \
        oven/bun:latest \
        $args
}

# if not sourced, run the function
if [ "$0" = "$BASH_SOURCE" ]; then
    run_in_bun_docker "$@"
fi
