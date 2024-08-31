FROM node:18-alpine AS base
WORKDIR /usr/src/app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS dependencies
ARG API_FILENAME
ARG API_PORT
ENV API_FILENAME=${API_FILENAME:-"index.js"}
ENV API_PORT=${API_PORT:-8081}

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --production

FROM dependencies AS deploy
COPY ./$API_FILENAME ./
COPY ./models ./models
COPY ./routes ./routes
COPY ./.env ./

EXPOSE $API_PORT
CMD node $API_FILENAME
