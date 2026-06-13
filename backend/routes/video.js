const express = require('express');
const router = express.Router();
const { downloadVideo } = require('../services/downloader');
const { processVideo } = require('../services/editor');
const path = require('path');
const fs = require('fs');

// Fila de processamento simulada (para enviar status)
const processingStatus = {};

// Lista de vídeos fake/simulada que o front-end carregará
const feedVideos = [
    { id: 'v1', title: 'Trailer Inception', url: 'https://www.youtube.com/watch?v=YoHD9XEInc0', thumbnail: 'https://img.youtube.com/vi/YoHD9XEInc0/maxresdefault.jpg' },
    { id: 'v2', title: 'Interstellar Trailer', url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E', thumbnail: 'https://img.youtube.com/vi/zSWdZVtXT7E/maxresdefault.jpg' }
];

router.get('/', (req, res) => {
    res.json(feedVideos);
});

// Nova rota de pesquisa usando a API do iTunes (gratuita, sem necessidade de chave)
router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json(feedVideos);

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=movie&country=br&lang=pt_br&limit=12`);
        const data = await response.json();
        
        const results = data.results.map(movie => ({
            id: movie.trackId.toString(),
            title: movie.trackName,
            synopsis: movie.longDescription || movie.shortDescription || 'Sinopse não disponível.',
            thumbnail: movie.artworkUrl100 ? movie.artworkUrl100.replace('100x100bb', '600x600bb') : '',
            // O yt-dlp vai pesquisar automaticamente por esse trailer no YouTube
            url: `ytsearch1:Trailer Oficial ${movie.trackName} dublado pt-br`
        }));

        res.json(results);
    } catch (err) {
        console.error('Erro na busca:', err);
        res.status(500).json({ error: 'Erro ao buscar filmes.' });
    }
});

router.get('/status/:id', (req, res) => {
    const status = processingStatus[req.params.id];
    if (status) {
        res.json(status);
    } else {
        res.status(404).json({ error: 'Processamento não encontrado' });
    }
});

router.post('/process', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL é obrigatória' });
    }

    const videoId = Date.now().toString(); // ID único simples
    processingStatus[videoId] = { status: 'baixando', progress: 0 };
    
    // Retorna o ID imediatamente para o frontend acompanhar
    res.json({ videoId, message: 'Processamento iniciado' });

    // Processamento assíncrono em background
    try {
        const downloadedFile = await downloadVideo(url, videoId);
        
        processingStatus[videoId].status = 'editando';
        
        // Vamos usar um audio de fundo fictício ou tentar baixar um de teste antes
        // Para este MVP vamos assumir que o arquivo `bg_music.mp3` está em `backend/assets`
        const bgMusicPath = path.join(__dirname, '..', 'assets', 'bg_music.mp3');
        
        // Cria a pasta assets se não existir e coloca um arquivo de dummy mp3 lá para não dar erro no ffmpeg se não acharmos um
        if (!fs.existsSync(bgMusicPath)) {
           // O ideal seria que isso fosse configurado antes. 
           // Mas vamos colocar um try catch aqui se não tiver o bgMusicPath ele pode dar erro, vamos alertar.
        }

        const outputFile = await processVideo(downloadedFile, videoId, bgMusicPath);
        
        processingStatus[videoId].status = 'concluido';
        processingStatus[videoId].downloadUrl = `/api/videos/download/${videoId}`;
        
    } catch (error) {
        console.error('Erro na pipeline:', error);
        processingStatus[videoId] = { status: 'erro', error: error.message };
    }
});

router.get('/download/:id', (req, res) => {
    const { id } = req.params;
    const file = path.join(__dirname, '..', 'output', `${id}_edited.mp4`);
    
    if (fs.existsSync(file)) {
        res.download(file);
    } else {
        res.status(404).json({ error: 'Arquivo não encontrado' });
    }
});

module.exports = router;
