import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TongDev | Terbaru - Anime Rilis Terkini!',
  description: 'Temukan anime terbaru yang baru saja rilis dengan kualitas terbaik',
};

export default function LatestPage() {
  return (
    <div className="min-h-screen bg-panel">
      <div id="error-state" className="fixed inset-0 bg-mustard z-40 flex justify-center items-center p-4 hidden">
        <div className="bg-panel comic-border rounded-md p-8 sm:p-12 text-center text-textblack comic-shadow max-w-lg w-full">
          <div className="text-7xl sm:text-9xl">🚫</div>
          <div className="comic-title-stroke text-5xl sm:text-7xl text-mustard mt-4">
            Oops! Gagal Muat!
          </div>
          <div className="font-inter text-xl sm:text-2xl mt-6">
            Tidak bisa memuat data. Coba lagi nanti, ya!
          </div>
          <button id="retry-button" className="mt-10 bg-mustard font-bangers text-3xl px-10 py-3 comic-border rounded-md comic-shadow text-textblack comic-title-stroke tracking-wider transition-transform duration-200 hover:scale-105 active:scale-95">
            Coba Lagi
          </button>
        </div>
      </div>
      
      <div id="main-content">
        <header id="navbar" className="bg-mustard comic-border border-b-8 p-3 sm:p-4 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between shadow-lg sticky top-0 z-30">
          <a href="/" className="comic-title-stroke text-5xl sm:text-6xl lg:text-7xl text-textblack text-center lg:text-left tap-highlight-transparent">
            TongDev | Stream
          </a>
        </header>
        
        <section id="banner-section" className="bg-panel shadow-lg overflow-hidden relative w-full pt-6 px-4 md:px-8">
          <div id="banner-container" className="relative">
          </div>
        </section>
        
        <section id="latest-anime" className="px-4 py-6">
          <h2 className="text-center font-bold text-xl mb-4 text-black">Anime Terbaru</h2>
          <div id="anime-list" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 min-h-60">
            <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 flex items-center justify-center">
              <div className="simple-dots-loader" id="inline-loader">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 mb-4">
            <button id="load-more" className="bg-mustard font-bangers text-2xl px-8 py-3 comic-border rounded-md comic-shadow text-textblack tracking-wider transition-transform duration-200 hover:scale-105 active:scale-95 flex items-center justify-center mx-auto">
              <span id="load-text">Muat Lebih Banyak</span>
              <i id="load-spinner" className="fa-solid fa-rotate fa-spin ml-2 hidden"></i>
            </button>
          </div>
        </section>
        
        <nav id="bottom-navigation" className="fixed bottom-0 left-0 right-0 bg-mustard border-t-8 comic-border p-1 z-30 flex justify-around items-center comic-shadow" style={{boxShadow: '0px -6px 0px #000000'}}>
          <a href="/" className="bottom-nav-item">
            <i className="fa-solid fa-house nav-icon"></i>
            <span className="nav-text">Home</span>
          </a>
          <a href="/latest" className="bottom-nav-item active" aria-current="page">
            <i className="fa-solid fa-clock nav-icon"></i>
            <span className="nav-text">Terbaru</span>
          </a>
          <a href="/search" className="bottom-nav-item">
            <i className="fa-solid fa-search nav-icon"></i>
            <span className="nav-text">Search</span>
          </a>
          <a href="/populer" className="bottom-nav-item">
            <i className="fa-solid fa-star nav-icon"></i>
            <span className="nav-text">Populer</span>
          </a>
          <a href="/auth" className="bottom-nav-item">
            <i className="fa-solid fa-user nav-icon"></i>
            <span className="nav-text">Profil</span>
          </a>
        </nav>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            const API_URL = "https://backend.syaii.my.id/api/latest?page=";
            let currentPage = 1;
            const animeListContainer = document.getElementById('anime-list');
            const inlineLoader = document.getElementById('inline-loader');
            const loadMoreButton = document.getElementById('load-more');
            const loadText = document.getElementById('load-text');
            const loadSpinner = document.getElementById('load-spinner');

            function createAnimeCard(anime) {
              const placeholderImg = 'https://placehold.co/200x300/F0F0F0/000?text=Img+Error';
              return \\`
                <a href="/detail?url=\\${encodeURIComponent(anime.detailLink)}" 
                   class="block bg-white rounded-md shadow-lg overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 tap-highlight-transparent">
                    <div class="w-full aspect-[2/3] overflow-hidden">
                        <img src="\\${anime.imageUrl}" 
                             alt="\\${anime.title}" 
                             class="w-full h-full object-cover" 
                             onerror="this.src='\\${placeholderImg}'">
                    </div>
                    <div class="p-3 text-center">
                        <p class="text-sm font-inter font-semibold text-gray-900 truncate">\\${anime.title}</p>
                    </div>
                </a>
              \\`;
            }

            function createBannerSlide(title, thumbUrl, detailLink, badgeText, infoText, backgroundUrl) {
              const placeholder = 'https://placehold.co/400x600/FFF9E0/000?text=TongDev';
              const bgUrl = backgroundUrl || thumbUrl;
              const encodedDetailLink = encodeURIComponent(detailLink);

              return \\`
                <div class="relative block w-full aspect-[2/1] md:aspect-[21/9] overflow-hidden comic-border rounded-md comic-shadow bg-mustard group tap-highlight-transparent">
                  <img src="\\${bgUrl || placeholder}"
                       alt="Background for \\${title}"
                       class="absolute inset-0 w-full h-full object-cover filter blur-lg scale-105 transition-transform duration-500 ease-in-out group-hover:scale-110"
                       onerror="this.src='\\${placeholder}'">
                  <div class="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm"></div>
                  <div class="relative z-10 w-full h-full p-4 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-start text-white">
                    <img src="\\${thumbUrl || placeholder}"
                         alt="\\${title}"
                         class="block h-40 sm:h-56 md:h-full aspect-[2/3] object-cover border-4 border-black rounded-md shadow-lg flex-shrink-0"
                         onerror="this.src='\\${placeholder}'">
                    <div class="md:ml-8 lg:ml-12 mt-4 md:mt-0 text-left w-full md:w-auto">
                      <span class="font-bangers text-lg sm:text-xl text-textblack bg-mustard border-2 border-black rounded-full px-4 py-1 inline-block comic-shadow">
                        \\${badgeText}
                      </span>
                      <h3 class="comic-title-stroke text-3xl sm:text-4xl lg:text-6xl text-mustard mt-2" title="\\${title}">
                        \\${title}
                      </h3>
                      <p class="font-inter font-bold text-base sm:text-xl lg:text-2xl text-white bg-black/50 border-2 border-white/50 rounded-lg px-4 py-2 inline-block mt-4 max-w-lg">
                        \\${infoText}
                      </p>
                      <br>
                      <a href="/detail?url=\\${encodedDetailLink}" class="mt-4 inline-block bg-mustard font-bangers text-2xl px-8 py-2 comic-border rounded-md comic-shadow text-textblack comic-title-stroke tracking-wider transition-transform duration-200 hover:scale-105 active:scale-95">
                        Lihat Detail
                      </a>
                    </div>
                  </div>
                </div>
              \\`;
            }

            function renderBanner(item) {
              const bannerContainer = document.getElementById('banner-container');
              const infoText = "Temukan anime terbaru yang baru rilis!";
              const slideHTML = createBannerSlide(
                item.title,
                item.imageUrl,
                item.detailLink,
                "Terbaru",
                infoText,
                item.imageUrl
              );
              if (bannerContainer) bannerContainer.innerHTML = slideHTML;
            }

            function renderCards(animeList, isFirstPage) {
              const cardHTML = animeList.map(createAnimeCard).join('');
              if (isFirstPage) {
                animeListContainer.innerHTML = cardHTML;
              } else {
                animeListContainer.insertAdjacentHTML('beforeend', cardHTML);
              }
            }

            function toggleLoading(isLoading) {
                loadMoreButton.disabled = isLoading;
                if (isLoading) {
                    loadText.textContent = "Memuat...";
                    loadSpinner.classList.remove('hidden');
                    loadMoreButton.classList.remove('hover:scale-105');
                    loadMoreButton.classList.add('opacity-70', 'cursor-default');
                } else {
                    loadText.textContent = "Muat Lebih Banyak";
                    loadSpinner.classList.add('hidden');
                    loadMoreButton.classList.add('hover:scale-105');
                    loadMoreButton.classList.remove('opacity-70', 'cursor-default');
                }
            }

            function showInlineLoader() {
              if (animeListContainer) {
                animeListContainer.innerHTML = \\`
                  <div class="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 flex items-center justify-center min-h-60">
                    <div class="simple-dots-loader" id="inline-loader-temp">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                \\`;
              }
            }

            function showErrorState() {
              const errorState = document.getElementById('error-state');
              const mainContent = document.getElementById('main-content');
              errorState.classList.remove('hidden');
              mainContent.classList.add('hidden');
              errorState.style.opacity = 0;
              errorState.style.transform = 'scale(0.9)';
              setTimeout(() => {
                errorState.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                errorState.style.opacity = 1;
                errorState.style.transform = 'scale(1)';
              }, 50);
            }

            function hideErrorState() {
              const errorState = document.getElementById('error-state');
              const mainContent = document.getElementById('main-content');
              errorState.style.transition = 'opacity 0.3s ease-in, transform 0.3s ease-in';
              errorState.style.opacity = 0;
              errorState.style.transform = 'scale(0.8)';
              setTimeout(() => {
                errorState.classList.add('hidden');
                mainContent.classList.remove('hidden');
                errorState.style.opacity = 1;
                errorState.style.transform = 'scale(1)';
                errorState.style.transition = '';
              }, 300);
            }

            async function loadLatestAnime(page) {
              const isFirstPage = page === 1;
              if (isFirstPage) {
                showInlineLoader();
                loadMoreButton.classList.add('hidden');
              } else {
                toggleLoading(true);
              }
              try {
                const response = await fetch(API_URL + page);
                if (!response.ok) {
                  throw new Error('Gagal memuat data API');
                }
                const data = await response.json();
                if (isFirstPage) {
                  if (data.length > 0) {
                    renderBanner(data[0]);
                    loadMoreButton.classList.remove('hidden');
                  } else {
                    loadMoreButton.classList.add('hidden');
                  }
                }
                if (data.length > 0) {
                  renderCards(data, isFirstPage);
                  if (!isFirstPage) {
                    currentPage++;
                  } else {
                    currentPage = 2; 
                  }
                } else {
                  loadMoreButton.disabled = true;
                  loadText.textContent = "Tidak Ada Lagi";
                  loadMoreButton.classList.add("opacity-50", "cursor-not-allowed");
                  loadSpinner.classList.add('hidden');
                }
                document.getElementById('main-content').classList.remove('hidden');
                document.getElementById('error-state').classList.add('hidden');
              } catch (error) {
                showErrorState();
              } finally {
                if (!isFirstPage) {
                    toggleLoading(false);
                }
              }
            }

            document.addEventListener('DOMContentLoaded', () => {
              const retryButton = document.getElementById('retry-button');
              if (retryButton) {
                retryButton.addEventListener('click', () => {
                  hideErrorState();
                  currentPage = 1;
                  loadMoreButton.classList.remove("opacity-50", "cursor-not-allowed", "hidden");
                  loadMoreButton.disabled = false;
                  loadText.textContent = "Muat Lebih Banyak";
                  loadLatestAnime(currentPage);
                });
              }
              loadMoreButton.addEventListener('click', () => {
                loadLatestAnime(currentPage);
              });
              loadLatestAnime(currentPage);
            });
          `,
        }}
      />
    </div>
  );
}
