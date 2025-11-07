'use client';

import { useState, useEffect } from 'react';
import Loader from '../../components/Loader';
import AnimeCard from '../../components/AnimeCard';

interface Anime {
  title: string;
  imageUrl: string;
  detailLink: string;
  description?: string;
}

export default function Populer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/homepage';

  const createBannerSlide = (
    title: string,
    thumbUrl: string,
    detailLink: string,
    badgeText: string,
    infoText: string,
    backgroundUrl: string
  ) => {
    const placeholder = 'https://placehold.co/400x600/FFF9E0/000?text=TongDev';
    const bgUrl = backgroundUrl || thumbUrl;
    
    return (
      <div className="relative block w-full aspect-[2/1] md:aspect-[21/9] overflow-hidden comic-border rounded-md comic-shadow bg-mustard group tap-highlight-transparent">
        <img 
          src={bgUrl || placeholder}
          alt={`Background for ${title}`}
          className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-105 transition-transform duration-500 ease-in-out group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholder;
          }}
        />
        <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full h-full p-4 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-start text-white">
          <img 
            src={thumbUrl || placeholder}
            alt={title}
            className="block h-40 sm:h-56 md:h-full aspect-[2/3] object-cover border-4 border-black rounded-md shadow-lg flex-shrink-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = placeholder;
            }}
          />
          <div className="md:ml-8 lg:ml-12 mt-4 md:mt-0 text-left w-full md:w-auto">
            <span className="font-bangers text-lg sm:text-xl text-textblack bg-mustard border-2 border-black rounded-full px-4 py-1 inline-block comic-shadow">
              {badgeText}
            </span>
            <h3 className="comic-title-stroke text-3xl sm:text-4xl lg:text-6xl text-mustard mt-2" title={title}>
              {title}
            </h3>
            <p className="font-inter font-bold text-base sm:text-xl lg:text-2xl text-white bg-black/50 border-2 border-white/50 rounded-lg px-4 py-2 inline-block mt-4 max-w-lg">
              {infoText}
            </p>
            <br />
            <a 
              href={`/detail?url=${encodeURIComponent(detailLink)}`}
              className="mt-4 inline-block bg-mustard font-bangers text-2xl px-8 py-2 comic-border rounded-md comic-shadow text-textblack comic-title-stroke tracking-wider transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              Lihat Detail
            </a>
          </div>
        </div>
      </div>
    );
  };

  const loadPopularAnime = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Gagal memuat data API');
      }
      const data = await response.json();
      
      const featured = data.featuredAnime || [];
      setFeaturedAnime(featured);
      setError(false);
    } catch (error) {
      console.error('Error loading popular anime:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(false);
    loadPopularAnime();
  };

  useEffect(() => {
    loadPopularAnime();
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 bg-mustard z-40 flex justify-center items-center p-4">
        <div className="bg-panel comic-border rounded-md p-8 sm:p-12 text-center text-textblack comic-shadow max-w-lg w-full">
          <div className="text-7xl sm:text-9xl">🚫</div>
          <div className="comic-title-stroke text-5xl sm:text-7xl text-mustard mt-4">
            Oops! Gagal Muat!
          </div>
          <div className="font-inter text-xl sm:text-2xl mt-6">
            Tidak bisa memuat data. Coba lagi nanti, ya!
          </div>
          <button 
            onClick={handleRetry}
            className="mt-10 bg-mustard font-bangers text-3xl px-10 py-3 comic-border rounded-md comic-shadow text-textblack comic-title-stroke tracking-wider transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-panel">
      <section id="banner-section" className="bg-panel shadow-lg overflow-hidden relative w-full pt-6 px-4 md:px-8">
        <div id="banner-container" className="relative">
          {featuredAnime.length > 0 && createBannerSlide(
            featuredAnime[0].title,
            featuredAnime[0].imageUrl,
            featuredAnime[0].detailLink,
            "Paling Populer",
            featuredAnime[0].description || "Tonton sekarang anime paling populer!",
            featuredAnime[0].imageUrl
          )}
        </div>
      </section>

      <section id="popular-anime" className="px-4 py-6">
        <h2 className="text-center font-bold text-xl mb-4 text-black">Anime Paling Populer</h2>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 min-h-60">
            <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 flex items-center justify-center">
              <div className="simple-dots-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 min-h-60">
            {featuredAnime.map((anime, index) => (
              <AnimeCard
                key={index}
                title={anime.title}
                imageUrl={anime.imageUrl}
                detailLink={anime.detailLink}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export const metadata = {
  title: 'TongDev | Populer - Anime Paling Top!',
  description: 'Temukan anime paling populer dan trending dengan rating tertinggi',
};
