import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '../../components/Sidebar';
import KeyboardShortcuts from '../../components/KeyboardShortcuts';
import CartShell from '../../components/CartShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'R.K PUMPS',
  description: 'Hardware stock inventory management system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100 flex min-h-screen`}
      >
        <CartShell>
          <Sidebar />
          <KeyboardShortcuts />
          <main className="flex-1 ml-16 min-h-screen">
            {children}
          </main>
        </CartShell>
      </body>
    </html>
  );
}
