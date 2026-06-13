FROM node:20-alpine

# Instala dependências essenciais
RUN apk add --no-cache ffmpeg python3 py3-pip curl

# Instala a última versão oficial do yt-dlp usando o gerenciador de pacotes do Python (pip) 
# Instala diretamente do branch principal (master) para garantir que temos as correções mais recentes do YouTube
RUN pip install --no-cache-dir -U "yt-dlp[default] @ https://github.com/yt-dlp/yt-dlp/archive/master.zip" --break-system-packages

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# A porta que o Express está escutando
EXPOSE 3001

CMD ["node", "server.js"]
