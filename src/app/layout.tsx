import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AdminProvider } from '@/context/AdminContext';
import { Suspense } from 'react';
import { Syne, Space_Grotesk, Oswald, Permanent_Marker, Plus_Jakarta_Sans } from 'next/font/google';

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

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'Balang Kepalang - Singapore\'s First Ice Blended Air Balang!',
  description: 'Experience the iced cold air balang revolution. Get your Balang Kepalang drinks here.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

function LayoutLoader() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0df2df]/5">
      <header className="bg-white/60 backdrop-blur-md border-b border-white/40 p-4">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-black uppercase tracking-tighter text-[#041F1C]">
            Balang Kepalang
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="font-black text-4xl uppercase tracking-tighter text-[#0df2df] animate-pulse">Loading...</div>
      </main>
    </div>
  );
}

import { SmoothScroll } from '@/components/ui/smooth-scroll';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable} ${oswald.variable} ${permanentMarker.variable} ${plusJakartaSans.variable}`}>
      <body className="font-plus-jakarta antialiased flex flex-col min-h-screen bg-[#0df2df]/5 text-[#041F1C]">
        <SmoothScroll>
          <Suspense fallback={<LayoutLoader />}>
            <AdminProvider>
              <Header />
              <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] -z-10 opacity-20 pointer-events-none" />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </AdminProvider>
          </Suspense>
          <Toaster />
        </SmoothScroll>
      </body>
    </html>
  );
}
