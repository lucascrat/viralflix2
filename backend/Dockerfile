FROM node:20-alpine

# Instala dependências essenciais
RUN apk add --no-cache ffmpeg python3 curl

# Baixa a última versão oficial do yt-dlp direto do GitHub para evitar bloqueios do YouTube
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# A porta que o Express está escutando
EXPOSE 3001

CMD ["node", "server.js"]
