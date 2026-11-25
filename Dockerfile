# ---------- Етап 1: збірка ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Залежності окремим шаром для кешування
COPY package*.json ./
RUN npm ci

# Код проєкту
COPY . .

# Генеруємо Prisma Client і компілюємо TypeScript
RUN npx prisma generate
RUN npm run build

# ---------- Етап 2: продакшн-образ ----------
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Скомпільований код
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]