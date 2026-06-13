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
        
        // Determina o caminho do yt-dlp dependendo do sistema operacional (útil para o deploy no Coolify/Linux)
        const ytDlpPath = process.platform === 'win32' 
            ? path.join(__dirname, '..', 'yt-dlp.exe') 
            : 'yt-dlp'; // No linux (Docker), o yt-dlp será instalado globalmente via apk

        const args = [
            url,
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
            '--extractor-args', 'youtube:player_client=android,web',
            '-o', outputPath
        ];

        console.log(`Iniciando download do vídeo: ${url}`);
        const ytDlpProcess = spawn(ytDlpPath, args);

        let errorOutput = '';

        ytDlpProcess.stdout.on('data', (data) => {
            console.log(`yt-dlp: ${data}`);
        });

        ytDlpProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
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
                reject(new Error(`yt-dlp process exited with code ${code}. Log: ${errorOutput.trim().substring(0, 200)}`));
            }
        });
    });
}

module.exports = {
    downloadVideo
};
