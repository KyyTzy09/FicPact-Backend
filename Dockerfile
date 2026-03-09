FROM node:20-alpine

WORKDIR /app

# Copy package.json dulu
COPY package*.json ./

# Install semua dependency termasuk devDependencies
RUN npm install

# Copy source code
COPY . .

# Copy env file supaya Prisma bisa generate client
COPY .env.production .env

# Generate Prisma client sebelum build TS
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/src/index.js"]
