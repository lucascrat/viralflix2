FROM node:20-alpine

# Instala ffmpeg, python3 (requerido para yt-dlp em algumas situações) e yt-dlp nativamente
RUN apk add --no-cache ffmpeg python3 yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# A porta que o Express está escutando
EXPOSE 3001

CMD ["node", "server.js"]
