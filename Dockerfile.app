FROM node:latest
WORKDIR /app

ENV NODE_OPTIONS=--openssl-legacy-provider

COPY . .
RUN yarn install
RUN yarn build


EXPOSE 8080
CMD ["yarn", "start"]