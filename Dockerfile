# Start from the official Bun Alpine image
FROM oven/bun:alpine

# Switch to root to install Docker CLI and Compose
USER root

# Install Docker CLI, Docker Compose, and common utilities
RUN apk add --no-cache docker-cli docker-compose zip unzip curl

# Switch back to the non-root `bun` user
USER bun
