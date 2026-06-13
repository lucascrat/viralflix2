'use client';

import { useState, useEffect } from 'react';
import './globals.css';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [processing, setProcessing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const getApiBase = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('appbr.pro')) {
      return 'https://api.viralflix.appbr.pro';
    }
    return `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;
  };

  // Carrega os vídeos iniciais
  useEffect(() => {
    const apiUrl = `${getApiBase()}/api/videos`;
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(err => console.error('Erro ao buscar vídeos:', err));
  }, []);

  // Polling para status
  useEffect(() => {
    let interval;
    if (processing && processing.status !== 'concluido' && processing.status !== 'erro') {
      interval = setInterval(() => {
        fetch(`${getApiBase()}/api/videos/status/${processing.id}`)
          .then(res => res.json())
          .then(data => {
            setProcessing(prev => ({ ...prev, ...data }));
          })
          .catch(console.error);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [processing]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // Se vazio, recarrega o feed inicial
      const apiUrl = `${getApiBase()}/api/videos`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      setVideos(data);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`${getApiBase()}/api/videos/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao buscar filmes');
    } finally {
      setIsSearching(false);
    }
  };

  const handleProcess = async (url) => {
    try {
      const res = await fetch(`${getApiBase()}/api/videos/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setProcessing({ id: data.videoId, status: 'baixando', progress: 0 });
    } catch (err) {
      console.error(err);
      alert('Erro ao iniciar processamento');
    }
  };

  const getProgressPercentage = () => {
    if (!processing) return 0;
    if (processing.status === 'baixando') return 30;
    if (processing.status === 'editando') return 70;
    if (processing.status === 'concluido') return 100;
    return 0;
  };

  const getStatusText = () => {
    if (!processing) return '';
    if (processing.status === 'baixando') return 'Baixando vídeo do YouTube...';
    if (processing.status === 'editando') return 'Aplicando cortes, música e acelerando...';
    if (processing.status === 'concluido') return 'Pronto para repostar!';
    if (processing.status === 'erro') return 'Ocorreu um erro no processamento.';
    return 'Processando...';
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Viraflix</h1>
        <p>Pesquise um filme, e nós editamos o trailer para você repostar!</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            placeholder="Digite o nome de um filme (Ex: Vingadores, Batman)..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button" disabled={isSearching}>
            {isSearching ? 'Buscando...' : 'Pesquisar'}
          </button>
        </form>
      </header>

      <main className="video-grid">
        {videos.length === 0 && !isSearching && (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#94a3b8' }}>Nenhum filme encontrado.</p>
        )}
        
        {videos.map((v, i) => (
          <div key={v.id} className="video-card" style={{ animationDelay: `${(i % 10) * 0.1}s` }}>
            {v.thumbnail ? (
               <img src={v.thumbnail} alt={v.title} className="video-thumbnail" />
            ) : (
               <div className="video-thumbnail placeholder-thumb">Sem Imagem</div>
            )}
            <div className="video-info">
              <h3 className="video-title">{v.title}</h3>
              {v.synopsis && (
                <p className="video-synopsis">{v.synopsis}</p>
              )}
              <button 
                className="btn-primary"
                onClick={() => handleProcess(v.url)}
              >
                Editar e Baixar
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Modal de Processamento */}
      {processing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Processando Vídeo</h2>
            
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${getProgressPercentage()}%`, background: processing.status === 'erro' ? '#ef4444' : '' }}
              ></div>
            </div>
            
            <p className="status-text">{getStatusText()}</p>

            {processing.status === 'concluido' && (
              <a href={`${getApiBase()}${processing.downloadUrl}`} download>
                <button className="btn-primary" style={{ marginBottom: '1rem' }}>
                  Baixar Arquivo Final
                </button>
              </a>
            )}

            {(processing.status === 'concluido' || processing.status === 'erro') && (
              <button className="btn-secondary" onClick={() => setProcessing(null)}>
                Fechar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
