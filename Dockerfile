FROM node:latest

USER node

ENV BUN_INSTALL="/home/node/.bun"

ENV PATH="$BUN_INSTALL/bin:$PATH"

RUN curl -fsSL https://bun.sh/install | bash

SHELL ["/bin/bash", "-c"]

WORKDIR /app
