const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

/**
 * Processa o vídeo:
 * - Acelera o áudio em 1.2x
 * - Adiciona música de fundo a 10% do volume
 * - (Futuramente) Faz cortes e transições
 * @param {string} inputPath - Caminho do vídeo original
 * @param {string} videoId - ID do vídeo para nomear a saída
 * @param {string} bgMusicPath - Caminho do arquivo de música de fundo
 * @returns {Promise<string>} - Caminho do vídeo renderizado
 */
function processVideo(inputPath, videoId, bgMusicPath) {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(__dirname, '..', 'output', `${videoId}_edited.mp4`);

        console.log(`Iniciando processamento do vídeo: ${inputPath}`);

        const hasBgMusic = fs.existsSync(bgMusicPath);
        
        const command = ffmpeg().input(inputPath);
        
        if (hasBgMusic) {
            command.input(bgMusicPath)
            .complexFilter([
                '[0:v]setpts=0.833*PTS[v_out]', // 1 / 1.2 = 0.833
                '[0:a]atempo=1.2[a1]',
                '[1:a]volume=0.1[a2]',
                '[a1][a2]amix=inputs=2:duration=first[a_out]'
            ])
            .outputOptions([
                '-map [v_out]',
                '-map [a_out]',
                '-c:v libx264',
                '-preset ultrafast',
                '-c:a aac',
                '-b:a 128k',
                '-y'
            ]);
        } else {
            // Se não tem música de fundo, apenas acelera o vídeo e áudio principal
            command.complexFilter([
                '[0:v]setpts=0.833*PTS[v_out]',
                '[0:a]atempo=1.2[a_out]'
            ])
            .outputOptions([
                '-map [v_out]',
                '-map [a_out]',
                '-c:v libx264',
                '-preset ultrafast',
                '-c:a aac',
                '-b:a 128k',
                '-y'
            ]);
        }
        
        command.save(outputPath);

        command.on('start', (commandLine) => {
            console.log('Comando FFmpeg spawnado: ' + commandLine);
        });

        command.on('progress', (progress) => {
            console.log(`Processando... ${progress.percent ? progress.percent.toFixed(2) + '%' : '?'}`);
        });

        command.on('end', () => {
            console.log('Processamento finalizado com sucesso!');
            resolve(outputPath);
        });

        command.on('error', (err, stdout, stderr) => {
            console.error('Erro ao processar vídeo: ' + err.message);
            console.error('FFmpeg stderr: ' + stderr);
            reject(err);
        });
    });
}

module.exports = {
    processVideo
};
