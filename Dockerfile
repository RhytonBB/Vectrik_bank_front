# Dockerfile для frontend
FROM node:18-alpine as build-stage

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем приложение для продакшена
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

# Копируем собранное приложение
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порт 3000
EXPOSE 3000

# Запускаем nginx на порту 3000
CMD ["nginx", "-g", "daemon off;"] 