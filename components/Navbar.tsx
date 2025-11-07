import Link from 'next/link';

interface NavbarProps {
  showBackButton?: boolean;
  title?: string;
}

export default function Navbar({ showBackButton = false, title = "TongDev | Stream" }: NavbarProps) {
  return (
    <header className="bg-mustard comic-border border-b-8 p-3 sm:p-4 md:p-6 shadow-lg sticky top-0 z-40 flex items-center justify-center relative">
      {showBackButton && (
        <button 
          onClick={() => window.history.back()}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-panel hover:bg-white text-textblack rounded-md w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all comic-border comic-shadow hover:scale-105 active:scale-95"
          aria-label="Kembali"
        >
          <i className="fa-solid fa-arrow-left sm:text-xl"></i>
        </button>
      )}
      <Link href="/" className="comic-title-stroke text-4xl sm:text-5xl text-mustard text-center tap-highlight-transparent">
        {title}
      </Link>
    </header>
  );
}
