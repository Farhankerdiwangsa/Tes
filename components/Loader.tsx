interface LoaderProps {
  type?: 'dots' | 'simple-dots' | 'tv';
  message?: string;
}

export default function Loader({ type = 'dots', message }: LoaderProps) {
  if (type === 'tv') {
    return (
      <div className="inline-tv-loader">
        <div className="inline-tv-screen">
          <i className="fa-solid fa-magnifying-glass inline-tv-icon"></i>
        </div>
      </div>
    );
  }

  if (type === 'simple-dots') {
    return (
      <div className="simple-dots-loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-2">
        <div className="loader-dot"></div>
        <div className="loader-dot"></div>
        <div className="loader-dot"></div>
      </div>
      {message && <p className="font-bangers text-2xl text-textblack tracking-wider">{message}</p>}
    </div>
  );
}
