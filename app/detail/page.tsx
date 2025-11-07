'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, set, remove, onValue, off } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export default function DetailPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentAnimeData, setCurrentAnimeData] = useState<any>(null);
  const [currentAnimeUrl, setCurrentAnimeUrl] = useState<string>('');
  const [currentAnimeId, setCurrentAnimeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [firebaseListeners, setFirebaseListeners] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const animeUrl = searchParams.get('url');

  const generateAnimeId = (url: string) => {
    try {
      return btoa(url).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    } catch (e) {
      return url.replace(/[^a-zA-Z0-9]/g, '_');
    }
  };

  const detachFirebaseListeners = () => {
    firebaseListeners.forEach(({ ref, listener }) => {
      off(ref, 'value', listener);
    });
    setFirebaseListeners([]);
  };

  const handleActionButtonClick = async (action: string) => {
    if (!currentUser || !currentAnimeData || !currentAnimeId) {
      window.location.href = '/auth';
      return;
    }

    const { title, imageUrl } = currentAnimeData;
    const detailUrl = currentAnimeUrl;
    const animePayload: any = {
      title: title || "Judul Tidak Ditemukan",
      image: imageUrl || "https://placehold.co/400x600/FFF9E0/000?text=?",
      detailUrl: detailUrl,
      addedAt: new Date().toISOString()
    };
    
    if (action === 'finished') {
      delete animePayload.addedAt;
      animePayload.finishedAt = new Date().toISOString();
    }

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const dataRef = ref(db, `users/${currentUser.uid}/${action}/${currentAnimeId}`);

    try {
      const snapshot = await get(dataRef);
      
      if (snapshot.exists()) {
        await remove(dataRef);
      } else {
        await set(dataRef, animePayload);
      }
      
    } catch (error) {
      console.error(`Gagal update Firebase untuk ${action}:`, error);
    }
  };

  const attachFirebaseListeners = (uid: string, animeId: string) => {
    detachFirebaseListeners();
    
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const actions = ['favorites', 'saved', 'finished'];
    
    actions.forEach(action => {
      const buttonId = {
        favorites: 'fav-btn',
        saved: 'save-btn',
        finished: 'finish-btn'
      }[action];
      
      const dataRef = ref(db, `users/${uid}/${action}/${animeId}`);
      
      const listener = onValue(dataRef, (snapshot) => {
        const button = document.getElementById(buttonId);
        if (button) {
          if (snapshot.exists()) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        }
      });
      
      setFirebaseListeners(prev => [...prev, { ref: dataRef, listener }]);
    });
  };

  const loadAnimeDetail = async (url: string) => {
    if (!url) {
      setError("URL anime tidak ditemukan. Coba kembali dari halaman utama.");
      setLoading(false);
      return;
    }
    
    setCurrentAnimeUrl(url);
    const animeId = generateAnimeId(url);
    setCurrentAnimeId(animeId);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/anime?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data || !data.title) {
        throw new Error("Respon API tidak valid atau tidak lengkap.");
      }

      setCurrentAnimeData(data);
      document.title = `${data.title} | TongDev Stream`;

      if (currentUser) {
        attachFirebaseListeners(currentUser.uid, animeId);
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error loading anime detail:", error);
      setError(error.message || "Gagal memuat detail anime.");
      setLoading(false);
    }
  };

  const renderInfoItem = (label: string, value: string) => {
    if (!value || value === "-") return '';
    return `
      <div class="flex flex-col">
        <span class="font-bangers text-xl text-mustard tracking-wide">${label}</span>
        <span class="font-inter font-semibold text-textblack text-base">${value}</span>
      </div>
    `;
  };

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (currentAnimeData) {
        if (user && currentAnimeId) {
          attachFirebaseListeners(user.uid, currentAnimeId);
        } else {
          detachFirebaseListeners();
        }
      }
    });

    if (animeUrl) {
      loadAnimeDetail(animeUrl);
    }

    return () => {
      unsubscribe();
      detachFirebaseListeners();
    };
  }, [animeUrl]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
        <div className="bg-panel comic-border comic-shadow rounded-md p-8 sm:p-12 text-center max-w-md w-full">
          <div className="text-7xl sm:text-9xl">🚫</div>
          <h2 className="comic-title-stroke text-5xl sm:text-6xl text-mustard mt-4">
            Oops! Gagal Muat!
          </h2>
          <div className="font-inter text-xl sm:text-2xl mt-6 text-textblack">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-10 bg-mustard font-bangers text-3xl px-10 py-3 comic-border rounded-md comic-shadow text-textblack comic-title-stroke tracking-wider transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (loading || !currentAnimeData) {
    return (
      <div className="min-h-screen bg-panel">
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

        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="flex space-x-2">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-panel">
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

      <main className="opacity-100 transition-opacity duration-500">
        <section className="relative w-full min-h-[60vh] md:min-h-[70vh] bg-gray-900 flex items-center justify-center overflow-hidden">
          <img 
            src={currentAnimeData.imageUrl || 'https://placehold.co/400x600/FFF9E0/000?text=TongDev'} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110"
          />
          <div className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm"></div>
          
          <div className="relative z-10 w-full h-full p-4 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-12 max-w-6xl mx-auto">
            <img 
              src={currentAnimeData.imageUrl || 'https://placehold.co/400x600/FFF9E0/000?text=TongDev'} 
              alt={currentAnimeData.title || 'Poster'}
              className="w-48 sm:w-56 md:w-64 lg:w-72 flex-shrink-0 aspect-[2/3] object-cover rounded-md shadow-lg comic-border comic-shadow"
            />
            
            <div className="flex-1 text-center md:text-left w-full">
              <h1 className="comic-title-stroke text-4xl sm:text-5xl lg:text-6xl text-mustard break-words whitespace-normal">
                {currentAnimeData.title || 'Judul Anime'}
              </h1>
              
              {currentAnimeData.score && (
                <div className="mt-4 inline-block bg-black/50 border-2 border-white/50 rounded-lg px-4 py-2">
                  <span className="font-bangers text-3xl text-mustard tracking-wide">
                    {currentAnimeData.score.split(' ')[0]}
                  </span>
                  <span className="font-inter font-bold text-lg text-white"> / 10.00</span>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                {(currentAnimeData.genres || []).map((genre: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-mustard text-textblack font-bangers text-lg px-4 py-1 rounded-md comic-border comic-shadow transition-transform duration-200 hover:scale-[1.08] active:scale-95 cursor-default"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <section className="mt-8 sm:mt-12 bg-panel comic-border comic-shadow rounded-lg p-4 sm:p-6 min-h-[80px] flex items-center justify-center">
            {currentUser ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                <button 
                  id="fav-btn"
                  onClick={() => handleActionButtonClick('favorites')}
                  className="action-button"
                  data-action="favorites"
                >
                  <i className="fa-solid fa-star"></i>
                  <span>Favorit</span>
                </button>
                <button 
                  id="save-btn"
                  onClick={() => handleActionButtonClick('saved')}
                  className="action-button"
                  data-action="saved"
                >
                  <i className="fa-solid fa-save"></i>
                  <span>Simpan</span>
                </button>
                <button 
                  id="finish-btn"
                  onClick={() => handleActionButtonClick('finished')}
                  className="action-button"
                  data-action="finished"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Tamat</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full">
                <p className="font-inter text-lg text-textblack text-center sm:text-left">
                  Login untuk menyimpan ke daftarmu!
                </p>
                <Link href="/auth" className="action-button !bg-mustard !text-black !font-bangers !text-2xl sm:!text-3xl tracking-wider !w-full sm:!w-auto hover:!scale-105 active:!scale-95">
                  <i className="fa-solid fa-right-to-bracket"></i>
                  <span>Login Dulu</span>
                </Link>
              </div>
            )}
          </section>

          <section className="bg-panel comic-border comic-shadow rounded-lg mt-8 p-6 sm:p-8 min-h-[150px] transition-all duration-200 hover:scale-[1.01] hover:-rotate-[0.5deg]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6" dangerouslySetInnerHTML={{
              __html: `
                ${renderInfoItem('Tipe', currentAnimeData.type || '')}
                ${renderInfoItem('Status', currentAnimeData.status || '')}
                ${renderInfoItem('Rating', currentAnimeData.ratingInfo || '')}
                ${renderInfoItem('Studio', currentAnimeData.studio || '')}
                ${renderInfoItem('Rilis', currentAnimeData.releaseDate || '')}
                ${renderInfoItem('Durasi', currentAnimeData.duration || '')}
                ${renderInfoItem('Anggota', currentAnimeData.members || '')}
                ${renderInfoItem('Total Episode', currentAnimeData.episodes || '')}
              `
            }} />
          </section>

          <section className="mt-8">
            <h2 className="text-3xl font-bangers text-textblack mb-4 tracking-wide">Sinopsis</h2>
            <div className="bg-panel comic-border comic-shadow rounded-lg p-6 sm:p-8 min-h-[150px] transition-all duration-200 hover:scale-[1.01] hover:rotate-[0.5deg]">
              <p className="font-inter text-base text-textblack text-left leading-relaxed">
                {currentAnimeData.synopsis || 'Sinopsis tidak tersedia.'}
              </p>
            </div>
          </section>
          
          <section className="mt-8">
            <h2 className="text-3xl font-bangers text-textblack mb-4 tracking-wide">Daftar Episode</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 min-h-[150px]">
              {(currentAnimeData.episodesList || []).length === 0 ? (
                <p className="font-inter text-center text-textblack col-span-full">
                  Belum ada episode yang tersedia.
                </p>
              ) : (
                (currentAnimeData.episodesList || []).map((episode: any, index: number) => {
                  const redirectUrl = `/episod?url=${encodeURIComponent(episode.url)}`;
                  return (
                    <Link 
                      key={index}
                      href={redirectUrl}
                      className="block relative aspect-[16/9] bg-panel comic-border comic-shadow rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105 hover:rotate-1 hover:shadow-xl cursor-pointer tap-highlight-transparent"
                    >
                      <img 
                        src={currentAnimeData.imageUrl || 'https://placehold.co/1600x900/FFF9E0/000?text=TongDev'} 
                        alt={`Thumbnail for ${episode.title}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <h3 className="font-bangers text-3xl text-white tracking-wide break-words whitespace-normal absolute bottom-3 left-4 right-4 z-10" style={{textShadow: '2px 2px 2px #000'}}>
                        {episode.title}
                      </h3>
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <span className="bg-mustard font-bangers text-3xl sm:text-4xl px-6 py-3 rounded-md comic-border comic-shadow comic-title-stroke tracking-wider">
                          <i className="fa-solid fa-play mr-2"></i> Tonton!
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
