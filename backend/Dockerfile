FROM node:18-slim AS builder


RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build


RUN echo "build control:" && ls -la dist && ls -la dist/src/main.js

FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/src/main.js"]