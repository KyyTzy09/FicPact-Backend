FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run build
RUN npx prisma generate

EXPOSE 8080

CMD ["node", "dist/src/index.js"]