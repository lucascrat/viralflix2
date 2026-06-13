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

        const command = ffmpeg()
            .input(inputPath)
            .input(bgMusicPath)
            // Complex filter para mixar o áudio do vídeo original acelerado com a música de fundo com volume baixo
            // [0:a] = áudio do vídeo, atempo=1.2 (acelera) -> [a1]
            // [1:a] = música de fundo, volume=0.1 -> [a2]
            // [a1][a2] amix=inputs=2:duration=first -> [a_out]
            // O vídeo original por enquanto passaremos apenas copiando (sem alterar a velocidade do vídeo em si, 
            // mas o usuário pediu para acelerar o áudio. Isso causará dessincronização se não acelerarmos o vídeo. 
            // Para acelerar o vídeo: setpts=1/1.2*PTS)
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
                '-preset ultrafast', // Ultrafast para testes rápidos locais
                '-c:a aac',
                '-b:a 128k',
                '-y' // Sobrescrever se existir
            ])
            .save(outputPath);

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
