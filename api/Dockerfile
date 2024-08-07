FROM node:18-alpine AS base
WORKDIR /usr/src/app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS dependencies
ARG API_FILENAME
ARG API_PORT
ENV API_FILENAME=${API_FILENAME:-"-e \"console.log('You've fucked up!);process.exit(228);\""}

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --production

FROM dependencies AS deploy
COPY ./.env ./
COPY ./$API_FILENAME ./
COPY ./models ./models
COPY ./routes ./routes

CMD node $API_FILENAME
