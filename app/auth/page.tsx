'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  GithubAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  update, 
  onValue, 
  off 
} from 'firebase/database';

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

interface AnimeItem {
  title: string;
  image: string;
  detailUrl: string;
  addedAt?: string;
  lastWatched?: string;
  finishedAt?: string;
}

export default function AuthPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState({ title: '', message: '', show: false });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [stats, setStats] = useState({
    finished: 0,
    favorites: 0,
    saved: 0
  });
  const [favorites, setFavorites] = useState<Record<string, AnimeItem>>({});
  const [saved, setSaved] = useState<Record<string, AnimeItem>>({});

  const safeCount = (obj: any) => {
    return obj ? Object.keys(obj).length : 0;
  };

  const handleAuthError = (error: any) => {
    let userMessage = "Terjadi kesalahan yang tidak diketahui. Coba lagi.";
    let title = "Autentikasi Gagal!";

    switch (error.code) {
      case 'auth/invalid-email':
        userMessage = "Format email tidak valid. Periksa kembali.";
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        userMessage = "Email atau password salah. Periksa kembali.";
        break;
      case 'auth/email-already-in-use':
        userMessage = "Email sudah terdaftar. Silakan login.";
        break;
      case 'auth/weak-password':
        userMessage = "Password harus memiliki minimal 6 karakter.";
        break;
      case 'auth/popup-closed-by-user':
        userMessage = "Jendela popup ditutup sebelum login selesai.";
        break;
      case 'PERMISSION_DENIED':
        title = "Error Database!";
        userMessage = "Akses database ditolak. Pastikan Rules Firebase Anda sudah benar (auth != null).";
        break;
      default:
        userMessage = `Terjadi kesalahan. Kode: ${error.code}.`;
    }

    setError({ title, message: userMessage, show: true });
  };

  const renderAnimeGrid = (data: Record<string, AnimeItem>) => {
    if (!data || Object.keys(data).length === 0) {
      return <p className="col-span-full text-center font-inter text-gray-700">Belum ada anime di sini, wibu!</p>;
    }

    const animeArray = Object.keys(data).map(key => ({
      animeId: key,
      ...data[key]
    }));

    const sortedArray = animeArray.sort((a, b) => {
      const timeA = new Date(a.addedAt || a.lastWatched || a.finishedAt || 0).getTime();
      const timeB = new Date(b.addedAt || b.lastWatched || b.finishedAt || 0).getTime();
      return timeB - timeA;
    });

    return sortedArray.map(anime => (
      <div key={anime.animeId} className="bg-white rounded-lg overflow-hidden comic-border comic-shadow transform transition-transform duration-300 hover:scale-[1.02]">
        <Link href={anime.detailUrl ? `/detail?url=${encodeURIComponent(anime.detailUrl)}` : '#'} className="block">
          <img 
            src={anime.image || 'https://placehold.co/400x600/5C88FF/FFF?text=IMG'} 
            alt={anime.title || 'Anime Title'}
            className="w-full h-40 object-cover border-b-4 border-black"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/400x600/5C88FF/FFF?text=IMG';
            }}
          />
          <div className="p-2">
            <h4 className="font-bold text-sm leading-tight truncate">{anime.title || 'Judul Anime'}</h4>
          </div>
        </Link>
      </div>
    ));
  };

  const googleLogin = async () => {
    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const githubLogin = async () => {
    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const registerEmail = async () => {
    if (!email || !password) {
      handleAuthError({ code: 'client/empty-fields', message: 'Email dan Password harus diisi.' });
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const loginEmail = async () => {
    if (!email || !password) {
      handleAuthError({ code: 'client/empty-fields', message: 'Email dan Password harus diisi.' });
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const logout = async () => {
    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      await signOut(auth);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const saveProfileChanges = async () => {
    if (!currentUser) return;

    if (!editUsername.trim()) {
      handleAuthError({ code: 'client/username-empty', message: 'Username tidak boleh kosong.' });
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getDatabase(app);

      await updateProfile(auth.currentUser!, {
        displayName: editUsername,
        photoURL: editPhotoUrl
      });

      await update(ref(db, `users/${currentUser.uid}`), {
        username: editUsername,
        displayName: editUsername,
        photoURL: editPhotoUrl
      });

      setShowEditModal(false);
    } catch (error) {
      handleAuthError(error);
    }
  };

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        
        try {
          const snapshot = await get(userRef);
          const currentTime = new Date().toISOString();

          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserData(userData);
            await update(ref(db, `users/${user.uid}`), {
              lastLogin: currentTime
            });
          } else {
            const defaultUsername = user.displayName || (user.email ? user.email.split('@')[0] : 'WibuBaru');
            const newUserData = {
              email: user.email,
              displayName: user.displayName || defaultUsername,
              username: defaultUsername,
              photoURL: user.photoURL || 'https://placehold.co/200x200/FFF9E0/000?text=?',
              createdAt: currentTime,
              lastLogin: currentTime,
              favorites: {},
              saved: {},
              finished: {}
            };

            await set(userRef, newUserData);
            setUserData(newUserData);
          }

          setCurrentUser(user);
          setShowLogin(false);
          setEditUsername(user.displayName || '');
          setEditPhotoUrl(user.photoURL || '');

          const favoritesRef = ref(db, `users/${user.uid}/favorites`);
          const savedRef = ref(db, `users/${user.uid}/saved`);
          const finishedRef = ref(db, `users/${user.uid}/finished`);

          onValue(favoritesRef, (snapshot) => {
            const data = snapshot.val();
            setFavorites(data || {});
            setStats(prev => ({ ...prev, favorites: safeCount(data) }));
          });

          onValue(savedRef, (snapshot) => {
            const data = snapshot.val();
            setSaved(data || {});
            setStats(prev => ({ ...prev, saved: safeCount(data) }));
          });

          onValue(finishedRef, (snapshot) => {
            const data = snapshot.val();
            setStats(prev => ({ ...prev, finished: safeCount(data) }));
          });

        } catch (error) {
          handleAuthError(error);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setShowLogin(true);
        setStats({ finished: 0, favorites: 0, saved: 0 });
        setFavorites({});
        setSaved({});
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-panel text-textblack font-inter min-h-screen pb-24">
      {error.show && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 flex justify-center items-center p-4 backdrop-blur-sm"
          onClick={() => setError({ ...error, show: false })}
        >
          <div 
            className="bg-panel comic-border rounded-md p-8 sm:p-12 text-center text-textblack comic-shadow max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-7xl sm:text-9xl">🚫</div>
            <div className="comic-title-stroke text-5xl sm:text-7xl text-mustard mt-4">
              {error.title}
            </div>
            <div className="font-inter text-xl sm:text-2xl mt-6">
              {error.message}
            </div>
            <p className="font-inter text-sm mt-4">(Klik di mana saja untuk menutup)</p>
          </div>
        </div>
      )}

      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 flex justify-center items-center p-4 backdrop-blur-sm"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="bg-panel comic-border rounded-md p-6 sm:p-8 text-textblack comic-shadow max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="comic-title-stroke text-4xl text-mustard mb-6">Ubah Profil</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="modal-username" className="font-inter font-bold mb-1 block">Username</label>
                <input 
                  type="text" 
                  id="modal-username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Username baru kamu" 
                  className="comic-input"
                />
              </div>
              <div>
                <label htmlFor="modal-photo-url" className="font-inter font-bold mb-1 block">URL Foto Profil</label>
                <input 
                  type="text" 
                  id="modal-photo-url"
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  placeholder="https://example.com/gambar.jpg" 
                  className="comic-input"
                />
                <a href="https://catbox.moe" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block">
                  Klik di sini untuk upload gambar
                </a>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={saveProfileChanges} className="comic-button w-full">
                  Simpan
                </button>
                <button onClick={() => setShowEditModal(false)} className="comic-button-secondary w-full">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="p-4 max-w-4xl mx-auto pt-8">
        {showLogin ? (
          <div id="login-view">
            <div className="bg-white p-6 md:p-8 rounded-lg comic-border comic-shadow">
              <h1 className="comic-title-stroke text-5xl text-mustard text-center">Login Dulu, Wibu!</h1>
              <p className="font-inter text-lg text-center mt-2 mb-6 text-gray-700">
                Untuk menyimpan favorit, melanjutkan tontonan, dan lainnya!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button 
                  onClick={googleLogin}
                  className="w-full p-3 bg-white text-gray-700 font-semibold text-lg rounded-md border border-gray-300 shadow-sm flex items-center justify-center gap-3 transition-colors duration-200 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h13.303c-1.628 5.09-6.49 8.82-12.303 8.82-7.34 0-13.32-5.98-13.32-13.32s5.98-13.32 13.32-13.32c3.54 0 6.78 1.4 9.1 3.69l5.65-5.65C34.54 5.16 29.6 3 24 3 10.74 3 0 13.74 0 27s10.74 24 24 24 24-10.74 24-24c0-1.58-.16-3.12-.4-4.64z"></path>
                    <path fill="#FF3D00" d="M6.306 14.691c-1.32 2.19-2.09 4.74-2.09 7.309s.77 5.12 2.09 7.309l-5.65 5.65C.85 31.09 0 29.12 0 27s.85-4.09 2.3-5.65l3.65-3.65z"></path>
                    <path fill="#4CAF50" d="M24 48c6.62 0 12.23-2.3 16.29-6.3l-5.65-5.65c-2.32 1.57-5.32 2.45-8.64 2.45-6.7 0-12.4-4.52-14.45-10.61l-5.9 5.9C5.16 43.1 13.8 48 24 48z"></path>
                    <path fill="#1976D2" d="M43.611 20.083H24v8h13.303c-.4 2.72-1.6 5.12-3.3 7.02l5.65 5.65c3.54-3.26 5.75-8.1 5.75-13.67 0-1.58-.16-3.12-.4-4.64z"></path>
                  </svg>
                  Login dengan Google
                </button>
                <button 
                  onClick={githubLogin}
                  className="comic-button !bg-gray-800 !text-white !normal-case !font-inter !font-bold !text-lg !comic-title-stroke-none !shadow-md flex items-center justify-center gap-2"
                >
                  <i className="fa-brands fa-github"></i> GitHub
                </button>
              </div>

              <div className="text-center my-4 font-inter font-bold text-gray-600">ATAU DENGAN EMAIL</div>

              <div className="space-y-4">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email kamu" 
                  className="comic-input"
                />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password rahasia" 
                  className="comic-input"
                />
                <div className="flex gap-4">
                  <button onClick={loginEmail} className="comic-button w-full">
                    Login
                  </button>
                  <button onClick={registerEmail} className="comic-button-secondary w-full">
                    Daftar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div id="profile-view">
            <div className="bg-white p-6 rounded-lg comic-border comic-shadow text-center relative">
              <img 
                src={currentUser?.photoURL || 'https://placehold.co/200x200/FFF9E0/000?text=?'} 
                alt="Foto Profil" 
                className="w-32 h-32 rounded-full mx-auto comic-border border-4 object-cover -mt-20 mb-4 bg-panel"
              />
              <h2 className="font-bangers text-4xl tracking-wide text-textblack">
                {currentUser?.displayName || 'Memuat...'}
              </h2>
              <p className="font-inter text-gray-700 mb-6">
                {currentUser?.email || 'memuat@email.com'}
              </p>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="comic-button-secondary !text-xl"
                >
                  <i className="fa-solid fa-pencil mr-1"></i> Ubah Profil
                </button>
                <button 
                  onClick={logout}
                  className="comic-button !text-xl !bg-red-500 !text-white !comic-title-stroke-none"
                >
                  <i className="fa-solid fa-right-from-bracket mr-1"></i> Logout
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg comic-border comic-shadow text-center mt-6">
              <div className="flex justify-around items-center">
                <div className="px-2">
                  <span className="block font-bangers text-5xl text-mustard comic-title-stroke">
                    {stats.finished}
                  </span>
                  <span className="block font-inter font-bold text-sm">Ditamatkan</span>
                </div>
                <div className="border-l-4 border-r-4 border-black px-6">
                  <span className="block font-bangers text-5xl text-mustard comic-title-stroke">
                    {stats.favorites}
                  </span>
                  <span className="block font-inter font-bold text-sm">Favorit</span>
                </div>
                <div className="px-2">
                  <span className="block font-bangers text-5xl text-mustard comic-title-stroke">
                    {stats.saved}
                  </span>
                  <span className="block font-inter font-bold text-sm">Disimpan</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="comic-title-stroke text-4xl text-mustard mb-4">Anime Favorit</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {renderAnimeGrid(favorites)}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="comic-title-stroke text-4xl text-mustard mb-4">Anime Disimpan</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {renderAnimeGrid(saved)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
