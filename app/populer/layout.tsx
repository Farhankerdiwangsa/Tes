import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TongDev | Populer - Anime Paling Top!',
  description: 'Temukan anime paling populer dan trending dengan rating tertinggi',
};

export default function PopulerLayout({
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
