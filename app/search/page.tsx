'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Anime {
  title: string;
  imageUrl: string;
  detailLink: string;
  type?: string;
  status?: string;
  rating?: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [featuredAnime, setFeaturedAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const createAnimeCard = (anime: Anime, index: number) => {
    const placeholderImg = 'https://placehold.co/200x300/F0F0F0/000?text=Img+Error';
    return (
      <Link 
        key={index}
        href={`/detail?url=${encodeURIComponent(anime.detailLink)}`}
        className="block bg-white rounded-md shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 tap-highlight-transparent opacity-0 translate-y-4 animate-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="w-full aspect-[2/3] overflow-hidden">
          <img 
            src={anime.imageUrl} 
            alt={anime.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = placeholderImg;
            }}
          />
        </div>
        <div className="p-3 text-center">
          <p className="text-sm font-inter font-semibold text-gray-900 truncate">{anime.title}</p>
        </div>
      </Link>
    );
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadLatestAnime();
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Gagal memuat data');
      const data = await response.json();
      
      if (data.length > 0) {
        setFeaturedAnime(data[0]);
        setAnimeList(data);
      } else {
        setFeaturedAnime(null);
        setAnimeList([]);
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadLatestAnime = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/latest?page=1`);
      const data = await response.json();
      setAnimeList(data);
      setFeaturedAnime(null);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  useEffect(() => {
    loadLatestAnime();
  }, []);

  return (
    <div className="bg-panel text-textblack font-inter min-h-screen">
      {error && (
        <div className="fixed inset-0 bg-mustard z-50 flex justify-center items-center p-4">
          <div className="bg-panel comic-border rounded-md p-8 sm:p-12 text-center text-textblack comic-shadow max-w-lg w-full">
            <div className="text-7xl sm:text-9xl">🚫</div>
            <div className="comic-title-stroke text-5xl sm:text-7xl text-mustard mt-4">
              Oops! Gagal Muat!
            </div>
            <div className="font-inter text-xl sm:text-2xl mt-6">
              Tidak bisa memuat data. Coba lagi nanti, ya!
            </div>
            <button 
              onClick={() => {
                setError(false);
                loadLatestAnime();
              }}
              className="mt-10 bg-mustard font-bangers text-3xl px-10 py-3 comic-border rounded-md comic-shadow text-textblack comic-title-stroke tracking-wider transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      <header className="bg-panel px-4 pt-6 pb-4 md:px-8 sticky top-0 z-30">
        <div className="relative flex items-center w-full bg-mustard comic-border rounded-2xl comic-shadow overflow-hidden">
          <i className="fa-solid fa-magnifying-glass text-textblack text-xl sm:text-2xl absolute left-4 sm:left-6"></i>
          <input 
            type="text"
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-textblack font-inter text-lg sm:text-xl placeholder:text-textblack/60 placeholder:italic py-4 sm:py-5 pl-12 sm:pl-16 pr-6 border-none outline-none ring-0 focus:ring-4 focus:ring-textblack transition-all duration-200 ease-in-out"
            placeholder="Cari anime favoritmu di sini..."
          />
        </div>
      </header>

      <section className="bg-panel shadow-lg overflow-hidden relative w-full pt-0 px-4 md:px-8">
        {featuredAnime && (
          <>
            <h2 className="font-bangers text-3xl text-textblack tracking-wider comic-title-stroke text-mustard mb-4 mt-6">
              Hasil Pencarian Anda
            </h2>
            <div className="relative block w-full aspect-[2/1] md:aspect-[21/9] overflow-hidden comic-border rounded-md comic-shadow bg-mustard group tap-highlight-transparent">
              <img 
                src={featuredAnime.imageUrl || 'https://placehold.co/400x600/FFF9E0/000?text=TongDev'}
                alt={`Background for ${featuredAnime.title}`}
                className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-105"
              />
              <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm"></div>
              <div className="relative z-10 w-full h-full p-4 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-start text-white">
                <img 
                  src={featuredAnime.imageUrl || 'https://placehold.co/400x600/FFF9E0/000?text=TongDev'}
                  alt={featuredAnime.title}
                  className="block h-40 sm:h-56 md:h-full aspect-[2/3] object-cover border-4 border-black rounded-md shadow-lg flex-shrink-0"
                />
                <div className="md:ml-8 lg:ml-12 mt-4 md:mt-0 text-left w-full md:w-auto">
                  <span className="font-bangers text-lg sm:text-xl text-textblack bg-mustard border-2 border-black rounded-full px-4 py-1 inline-block comic-shadow">
                    Rating: {featuredAnime.rating || 'N/A'}
                  </span>
                  <h3 className="comic-title-stroke text-3xl sm:text-4xl lg:text-6xl text-mustard mt-2">
                    {featuredAnime.title}
                  </h3>
                  <p className="font-inter font-bold text-base sm:text-xl lg:text-2xl text-white bg-black/50 border-2 border-white/50 rounded-lg px-4 py-2 inline-block mt-4 max-w-lg">
                    Tipe: {featuredAnime.type} | Status: {featuredAnime.status}
                  </p>
                  <Link 
                    href={`/detail?url=${encodeURIComponent(featuredAnime.detailLink)}`}
                    className="bg-mustard text-black font-bangers text-2xl px-6 py-3 rounded-lg comic-border comic-shadow transition-transform duration-300 hover:scale-105 active:scale-95 inline-block mt-4"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 min-h-60">
          {loading ? (
            <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 flex items-center justify-center min-h-60 opacity-0 transition-opacity duration-500 ease-in-out">
              <div className="inline-tv-loader">
                <div className="inline-tv-screen">
                  <i className="fa-solid fa-magnifying-glass inline-tv-icon"></i>
                </div>
              </div>
            </div>
          ) : animeList.length === 0 ? (
            <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 flex items-center justify-center min-h-60">
              <p className="text-xl font-inter text-textblack/70">Tidak ada hasil ditemukan.</p>
            </div>
          ) : (
            animeList.map((anime, index) => createAnimeCard(anime, index))
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
