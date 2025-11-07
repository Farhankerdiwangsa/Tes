import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TongDev | Terbaru - Anime Rilis Terkini!',
  description: 'Temukan anime terbaru yang baru saja rilis dengan kualitas terbaik',
};

export default function LatestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
