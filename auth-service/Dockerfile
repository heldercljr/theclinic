# Dockerfile para auth-service
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Compila o TypeScript
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]
