
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AdminProvider } from '@/context/AdminContext';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'BalangConnect - Your Community Beverage Partner',
  description: 'Discover balang flavors, event packages, and community stories with BalangConnect.',
};

function LayoutLoader() {
  // This is a static skeleton component. It CANNOT use components like <Header /> or <Footer />
  // because they depend on the AdminContext which is currently being suspended.
  return (
    <div className="flex flex-col min-h-screen">
       <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-headline font-bold text-primary">
            BalangConnect
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-muted-foreground">Loading Page...</div>
      </main>
      <footer className="bg-card shadow-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BalangConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
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
