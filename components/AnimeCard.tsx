import Link from 'next/link';

interface AnimeCardProps {
  anime: {
    title: string;
    imageUrl: string;
    detailLink: string;
  };
  index?: number;
}

export default function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  const placeholderImg = 'https://placehold.co/200x300/F0F0F0/000?text=Img+Error';
  
  return (
    <Link 
      href={`/detail?url=${encodeURIComponent(anime.detailLink)}`}
      className="block bg-white rounded-md shadow-lg overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 tap-highlight-transparent"
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
}
