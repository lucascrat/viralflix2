const express = require('express');
const cors = require('cors');
const videoRoutes = require('./routes/video');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas de vídeo
app.use('/api/videos', videoRoutes);

app.listen(PORT, () => {
    console.log(`Backend Viraflix rodando na porta ${PORT}`);
});
