import type { Metadata } from 'next';
import { Inter, Bangers } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const bangers = Bangers({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bangers',
});

export const metadata: Metadata = {
  title: 'TongDev | Stream - Gratis Bebas Iklan',
  description: 'Streaming anime gratis tanpa iklan dengan kualitas terbaik',
  keywords: 'anime, streaming, gratis, nonton anime, anime subtitle Indonesia',
  authors: [{ name: 'TongDev' }],
  openGraph: {
    title: 'TongDev | Stream - Gratis Bebas Iklan',
    description: 'Streaming anime gratis tanpa iklan dengan kualitas terbaik',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TongDev | Stream - Gratis Bebas Iklan',
    description: 'Streaming anime gratis tanpa iklan dengan kualitas terbaik',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${bangers.variable} font-inter`}>
        <div className="min-h-screen bg-panel text-textblack">
          <Navbar />
          <main className="pb-20">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
