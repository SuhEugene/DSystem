FROM node:18-alpine AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable


FROM base AS dependencies

ENV NODE_OPTIONS=--openssl-legacy-provider
COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile


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

RUN pnpm build

# They're the same as deps
#FROM base AS deploy-deps
#ENV NODE_OPTIONS=--openssl-legacy-provider
#COPY package.json pnpm-lock.yaml ./
#RUN pnpm install --production --frozen-lockfile

FROM dependencies AS deploy

COPY --from=build /app/.nuxt ./.nuxt
COPY static ./static

COPY .env ./

EXPOSE 8080
CMD ["pnpm", "start"]
