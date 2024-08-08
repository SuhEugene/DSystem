FROM node:18-alpine AS base
WORKDIR /app

RUN corepack enable


FROM base AS dependencies

ENV NODE_OPTIONS=--openssl-legacy-provider
COPY package.json yarn.lock ./

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile


FROM dependencies AS build

COPY assets ./assets
COPY components ./components
COPY layouts ./layouts
COPY middleware ./middleware
COPY pages ./pages
COPY plugins ./plugins
COPY static ./static
COPY store ./store

COPY .env ./
COPY nuxt.config.js ./

RUN yarn build

# They're the same as deps
# FROM base AS deploy-deps
# ENV NODE_OPTIONS=--openssl-legacy-provider
# COPY package.json yarn.lock ./
# RUN yarn install --production --frozen-lockfile

FROM dependencies AS deploy

COPY --from=build /app/.nuxt ./.nuxt
COPY static ./static

COPY .env ./

EXPOSE 8080
CMD ["yarn", "start"]
