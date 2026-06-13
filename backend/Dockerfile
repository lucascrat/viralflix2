FROM node:20-alpine

# Instala dependências essenciais
RUN apk add --no-cache ffmpeg python3 py3-pip curl

# Instala a última versão oficial do yt-dlp usando o gerenciador de pacotes do Python (pip) 
# Isso garante compatibilidade total com o Alpine Linux (musl libc) e evita erros "code 1"
RUN pip install --no-cache-dir --upgrade yt-dlp --break-system-packages

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# A porta que o Express está escutando
EXPOSE 3001

CMD ["node", "server.js"]
