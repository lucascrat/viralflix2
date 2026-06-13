const express = require('express');
const cors = require('cors');
const videoRoutes = require('./routes/video');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas de vídeo
app.use('/api/videos', videoRoutes);

const fs = require('fs');
const path = require('path');

// Garante que as pastas de trabalho existem
const tempDir = path.join(__dirname, 'temp');
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

app.listen(PORT, () => {
    console.log(`Backend Viraflix rodando na porta ${PORT}`);
});
