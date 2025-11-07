'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface VideoSource {
  src: string;
  size: string;
  numericSize: number;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  photoURL: string;
  text: string;
  timestamp: number;
  likeCount: number;
}

export default function EpisodePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [episodeData, setEpisodeData] = useState<any>(null);
  const [animeData, setAnimeData] = useState<any>(null);
  const [videoSources, setVideoSources] = useState<VideoSource[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('');
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchParams = useSearchParams();
  const episodeUrl = searchParams.get('url');

  const normalizeSources = (sources: any[]): VideoSource[] => {
    return sources.map(source => ({
      ...source,
      size: source.size || source.id || 'N/A',
      numericSize: parseInt(String(source.size || source.id).replace('p', '')) || 0
    }));
  };

  const chooseDefaultSource = (sources: VideoSource[]): VideoSource | null => {
    if (!sources || sources.length === 0) return null;
    
    const sortedSources = [...sources].sort((a, b) => b.numericSize - a.numericSize);
    const connection = (navigator as any).connection;
    let defaultSource = sortedSources[0];

    if (connection?.effectiveType) {
      if (connection.effectiveType.includes('2g') || connection.effectiveType.includes('slow-2g')) {
        defaultSource = sortedSources.find(s => s.numericSize <= 360) || sortedSources[sortedSources.length - 1];
      } else if (connection.effectiveType.includes('3g')) {
        defaultSource = sortedSources.find(s => s.numericSize <= 480) || sortedSources[sortedSources.length - 1];
      } else if (connection.effectiveType.includes('4g')) {
        defaultSource = sortedSources.find(s => s.numericSize <= 720) || sortedSources[0];
      }
    }
    
    return defaultSource;
  };

  const loadEpisodeData = async () => {
    if (!episodeUrl) {
      setError("URL episode tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      const [episodeResponse, animeResponse] = await Promise.allSettled([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/episode?url=${encodeURIComponent(episodeUrl)}`),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/anime?url=${encodeURIComponent(episodeUrl.split('/episode')[0])}`)
      ]);

      if (episodeResponse.status === 'rejected') {
        throw new Error('Gagal memuat data episode');
      }

      const episodeResult = await episodeResponse.value.json();
      
      if (!episodeResult.sources || episodeResult.sources.length === 0) {
        throw new Error("Tidak ditemukan sumber video untuk episode ini.");
      }
      
      const normalizedSources = normalizeSources(episodeResult.sources);
      setVideoSources(normalizedSources);
      setEpisodeData(episodeResult);

      const defaultSource = chooseDefaultSource(normalizedSources);
      if (defaultSource) {
        setCurrentQuality(defaultSource.size);
      }

      if (animeResponse.status === 'fulfilled') {
        const animeResult = await animeResponse.value.json();
        setAnimeData(animeResult);
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error loading episode:", error);
      setError(error.message || "Terjadi kesalahan saat memuat data.");
      setLoading(false);
    }
  };

  const handlePlayAttempt = () => {
    setShowLoginPanel(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    loadEpisodeData();
  }, [episodeUrl]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-panel z-[100] flex flex-col items-center justify-center space-y-4 transition-opacity duration-500 ease-in-out">
        <div className="flex space-x-2">
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
        </div>
        <p className="font-bangers text-2xl text-textblack tracking-wider">Memuat Halaman...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div id="error-state" className="fixed inset-0 bg-panel z-[90] flex-col items-center justify-center space-y-4 p-4 text-center flex">
        <h2 className="comic-title-stroke text-6xl text-mustard">Oops!</h2>
        <p className="font-inter text-xl text-textblack max-w-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="comic-button mt-6 !text-3xl"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-panel text-textblack font-inter">
      {showLoginPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-panel comic-border comic-shadow rounded-lg p-8 sm:p-12 text-center max-w-md w-full relative">
            <h2 className="comic-title-stroke text-5xl sm:text-6xl text-mustard mt-4">
              Login Dulu, Wibu 😎
            </h2>
            <p className="font-inter text-xl sm:text-2xl mt-6 text-textblack">
              Kamu harus login untuk nonton, like, dan komentar!
            </p>
            <Link href="/auth" className="comic-button mt-10 inline-block !text-3xl">
              Login Sekarang
            </Link>
            <button 
              onClick={() => setShowLoginPanel(false)}
              className="absolute top-4 right-4 bg-panel hover:bg-white text-textblack rounded-md w-10 h-10 flex items-center justify-center transition-all comic-border comic-shadow hover:scale-105 active:scale-95"
              aria-label="Tutup"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>
        </div>
      )}
      
      <header className="bg-mustard comic-border border-b-8 p-3 sm:p-4 md:p-6 shadow-lg sticky top-0 z-40 flex items-center justify-center relative">
        <button 
          onClick={() => window.history.back()}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-panel hover:bg-white text-textblack rounded-md w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all comic-border comic-shadow hover:scale-105 active:scale-95"
          aria-label="Kembali"
        >
          <i className="fa-solid fa-arrow-left sm:text-xl"></i>
        </button>
        <Link href="/" className="comic-title-stroke text-4xl sm:text-5xl text-mustard text-center tap-highlight-transparent">
          TongDev | Stream
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-3 sm:p-4 pb-24">
        <section className="mb-4">
          <div className="w-full aspect-[16/9] bg-black rounded-lg comic-border comic-shadow overflow-hidden relative">
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              playsInline
              controls
              controlsList="nodownload"
              poster={episodeData?.videoElement?.dataPoster || 'https://placehold.co/1600x900/000/FFF?text=Memuat+Video...'}
              onPlay={handlePlayAttempt}
            >
              {videoSources.map((source, index) => (
                <source key={index} src={source.src} type="video/mp4" />
              ))}
            </video>
            
            <div id="video-loader-overlay">
              <div className="video-spinner"></div>
            </div>
          </div>
        </section>

        <section className="mt-4 flex justify-center gap-3 sm:gap-4">
          <button className="player-action-button">
            <i className="fa-solid fa-thumbs-up"></i>
            <span>0</span>
          </button>
          <button className="player-action-button">
            <i className="fa-solid fa-thumbs-down"></i>
            <span>0</span>
          </button>
          <a href="#" className="player-action-button !bg-mustard !text-black" download>
            <i className="fa-solid fa-download"></i>
            <span>Unduh</span>
          </a>
        </section>

        <section className="mt-6">
          <h2 className="text-3xl font-bangers text-textblack mb-4 tracking-wide">
            {episodeData?.title || 'Memuat Episode...'}
          </h2>
          
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 horizontal-scrollbar">
            {(animeData?.episodesList || []).map((episode: any, index: number) => (
              <Link
                key={index}
                href={`/episod?url=${encodeURIComponent(episode.url)}`}
                className={`episode-nav-button ${episode.url === episodeUrl ? 'active' : ''}`}
              >
                {episode.title.match(/(\d+)/)?.[1] || '?'}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-3xl font-bangers text-textblack mb-4 tracking-wide">
            Komentar (0)
          </h2>
          
          <div className="flex gap-2 sm:gap-4 mb-4">
            <button className="comment-filter-button">
              <i className="fa-solid fa-fire"></i> Populer
            </button>
            <button className="comment-filter-button active">
              <i className="fa-solid fa-clock"></i> Terbaru
            </button>
          </div>

          <form className="mb-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://placehold.co/40x40/FFF9E0/000?text=?" 
                alt="Avatar" 
                className="w-10 h-10 rounded-full comic-border border-2 object-cover flex-shrink-0"
              />
              <input 
                type="text" 
                className="comic-input flex-1" 
                placeholder="Login untuk komentar..." 
                disabled
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button 
                type="submit" 
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-mustard rounded-lg comic-border comic-shadow transition-all hover:scale-105 active:scale-95"
                aria-label="Kirim Komentar" 
                disabled
              >
                <i className="fa-solid fa-paper-plane text-textblack text-xl"></i>
              </button>
            </div>
          </form>
          
          <div className="space-y-4">
            <p className="text-center text-gray-600 font-semibold text-lg py-6">
              Belum ada komentar. Jadilah yang pertama!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
