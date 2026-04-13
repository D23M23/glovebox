FROM node:20-alpine

# better-sqlite3 requires native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

RUN mkdir -p /app/data/uploads

EXPOSE 3001

CMD ["node", "src/index.js"]
