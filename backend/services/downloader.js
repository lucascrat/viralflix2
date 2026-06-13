const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Faz o download de um vídeo usando o yt-dlp
 * @param {string} url - A URL do vídeo do YouTube
 * @param {string} videoId - Um ID único para o vídeo sendo baixado
 * @returns {Promise<string>} - O caminho do arquivo baixado
 */
function downloadVideo(url, videoId) {
    return new Promise((resolve, reject) => {
        const tempDir = path.join(__dirname, '..', 'temp');
        const outputPath = path.join(tempDir, `${videoId}.%(ext)s`);
        
        // Caminho do yt-dlp baixado no backend
        const ytDlpPath = path.join(__dirname, '..', 'yt-dlp.exe');

        // Formato para baixar o melhor video + melhor audio, e juntar em mp4
        const args = [
            url,
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
            '-o', outputPath
        ];

        console.log(`Iniciando download do vídeo: ${url}`);
        const ytDlpProcess = spawn(ytDlpPath, args);

        ytDlpProcess.stdout.on('data', (data) => {
            console.log(`yt-dlp: ${data}`);
        });

        ytDlpProcess.stderr.on('data', (data) => {
            console.error(`yt-dlp error: ${data}`);
        });

        ytDlpProcess.on('close', (code) => {
            if (code === 0) {
                // yt-dlp finalizou com sucesso. Como usamos %(ext)s, ele será salvo como mp4
                const finalPath = path.join(tempDir, `${videoId}.mp4`);
                if (fs.existsSync(finalPath)) {
                    resolve(finalPath);
                } else {
                    reject(new Error('Download finalizado, mas o arquivo não foi encontrado: ' + finalPath));
                }
            } else {
                reject(new Error(`yt-dlp process exited with code ${code}`));
            }
        });
    });
}

module.exports = {
    downloadVideo
};
