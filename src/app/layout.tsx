import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'NavGOX | MOPA Airport Inter-Campus Transport System',
  description:
    'Dedicated internal campus ground transportation management platform exclusively for Manohar International Airport (MOPA / GOX), Pernem, Goa.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 bg-slate-900" />}>
            <Header />
          </Suspense>

          <main className="flex-1 pb-16 lg:pb-0">
            <Suspense
              fallback={
                <div className="flex min-h-[50vh] items-center justify-center p-8 text-xs font-semibold text-slate-400">
                  Loading MOPA Campus Transport...
                </div>
              }
            >
              {children}
            </Suspense>
          </main>

          <Footer />

          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
