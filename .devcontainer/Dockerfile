# For config options, see the README at: https://github.com/devcontainers/templates/tree/main/src/typescript-node
FROM mcr.microsoft.com/devcontainers/typescript-node:3.0.3-22-bookworm


USER node:node

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

RUN curl -fsSL https://claude.ai/install.sh | bash

RUN pnpm completion zsh >> $HOME/.zshrc
