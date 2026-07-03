FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build:client

RUN mkdir -p /app/api/data /app/api/uploads

EXPOSE 3001

CMD ["npx", "tsx", "api/server.ts"]