# Start from the official Bun Alpine image
FROM oven/bun:alpine

# Switch to root to install Docker CLI and Compose
USER root

# Install Docker CLI and Docker Compose (Alpine-based)
RUN apk add --no-cache docker-cli docker-compose

# Switch back to the non-root `bun` user
USER bun