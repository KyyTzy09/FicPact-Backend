FROM node:20-alpine

WORKDIR /app

# install deps
COPY package*.json ./
RUN npm install

# prisma client
COPY prisma ./prisma
RUN npx prisma generate

# source
COPY . .

# build ts → js
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/src/index.js"]