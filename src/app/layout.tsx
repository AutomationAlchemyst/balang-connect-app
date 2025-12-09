import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AdminProvider } from '@/context/AdminContext';
import { Suspense } from 'react';
import { Syne, Space_Grotesk, Oswald, Permanent_Marker } from 'next/font/google';

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald',
});

const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-permanent-marker',
});

export const metadata: Metadata = {
  title: 'Balang Kepalang - Singapore\'s First Ice Blended Air Balang!',
  description: 'Experience the iced cold air balang revolution. Get your Balang Kepalang drinks here.',
};

function LayoutLoader() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-yellow">
       <header className="bg-white border-b-4 border-black p-4">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-display font-bold uppercase">
            Balang Kepalang
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="font-display text-3xl font-bold uppercase animate-pulse">Loading...</div>
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable} ${oswald.variable} ${permanentMarker.variable}`}>
      <body className="font-body antialiased flex flex-col min-h-screen bg-[#FFFDF5]">
        <Suspense fallback={<LayoutLoader />}>
          <AdminProvider>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </AdminProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
