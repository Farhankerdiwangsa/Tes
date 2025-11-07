'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Loader from '../components/Loader';
import AnimeCard from '../components/AnimeCard';

interface Anime {
  title: string;
  imageUrl: string;
  detailLink: string;
  description?: string;
  episodeInfo?: string;
  type?: string;
  quality?: string;
  rating?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [featuredAnime, setFeaturedAnime] = useState<Anime | null>(null);
  const [ongoingAnime, setOngoingAnime] = useState<Anime | null>(null);
  const [movieAnime, setMovieAnime] = useState<Anime | null>(null);
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

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
    const link = detailLink ? `/detail?url=${encodeURIComponent(detailLink)}` : '#';
    
    return (
      <div className="min-w-full px-2">
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
              <Link 
                href={link}
                className="mt-4 inline-block bg-mustard font-bangers text-2xl px-8 py-2 comic-border rounded-md comic-shadow text-textblack comic-title-stroke tracking-wider transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                Lihat Detail
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const loadHomepageData = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const featured = data.featuredAnime && data.featuredAnime[0] ? data.featuredAnime[0] : null;
      const ongoing = data.ongoingAnime && data.ongoingAnime[0] ? data.ongoingAnime[0] : null;
      const movie = data.movieAnime && data.movieAnime[0] ? data.movieAnime[0] : null;
      
      setFeaturedAnime(featured);
      setOngoingAnime(ongoing);
      setMovieAnime(movie);

      const allAnimeData = [
        ...(data.featuredAnime || []),
        ...(data.ongoingAnime || []),
        ...(data.finishedAnime || []),
        ...(data.movieAnime || [])
      ];
      setAllAnime(allAnimeData);
      
      setError(false);
    } catch (error) {
      console.error("Error loading homepage data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const setupSlider = () => {
    const slides = [featuredAnime, ongoingAnime, movieAnime].filter(Boolean);
    return slides;
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  useEffect(() => {
    loadHomepageData();
  }, []);

  useEffect(() => {
    const slides = setupSlider();
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredAnime, ongoingAnime, movieAnime]);

  if (loading) {
    return <Loader />;
  }

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
            onClick={loadHomepageData}
            className="mt-10 bg-mustard font-bangers text-3xl px-10 py-3 comic-border rounded-md comic-shadow text-textblack comic-title-stroke tracking-wider transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const slides = setupSlider();

  return (
    <div className="min-h-screen bg-panel">
      <section id="banner-slider" className="bg-mustard border-b-8 comic-border shadow-lg overflow-hidden relative w-full">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {featuredAnime && createBannerSlide(
            featuredAnime.title,
            featuredAnime.imageUrl,
            featuredAnime.detailLink,
            "Unggulan",
            featuredAnime.description || "",
            featuredAnime.imageUrl
          )}
          {ongoingAnime && createBannerSlide(
            ongoingAnime.title,
            ongoingAnime.imageUrl,
            ongoingAnime.detailLink,
            "Sedang Tayang",
            `${ongoingAnime.episodeInfo || ''} | ${ongoingAnime.type || ''} | ${ongoingAnime.quality || ''}`,
            ongoingAnime.imageUrl
          )}
          {movieAnime && createBannerSlide(
            movieAnime.title,
            movieAnime.imageUrl,
            movieAnime.detailLink,
            "Film (Movie)",
            `⭐ ${movieAnime.rating || ''} | ${movieAnime.type || ''} | ${movieAnime.quality || ''}`,
            movieAnime.imageUrl
          )}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-4 h-4 rounded-full comic-border border-2 transition-all duration-300 ${
                index === currentSlide ? 'bg-textblack' : 'bg-white'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>

      <section id="all-anime" className="px-4 py-6">
        <h2 className="text-center font-bold text-xl mb-4 text-black">Semua Anime & Movie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allAnime.map((anime, index) => (
            <AnimeCard
              key={index}
              title={anime.title}
              imageUrl={anime.imageUrl}
              detailLink={anime.detailLink}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
