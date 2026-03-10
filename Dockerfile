FROM node:20-alpine

WORKDIR /app

# Copy package.json dulu
COPY package*.json ./

# Install semua dependency
RUN npm install

# Copy source code, termasuk src
COPY . .

# Copy env file supaya Prisma bisa generate client
COPY .env.production .env

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript di dalam image
RUN npm run build

EXPOSE 8080

# Jalankan Node dari dist hasil build TS
CMD ["node", "dist/src/index.js"]