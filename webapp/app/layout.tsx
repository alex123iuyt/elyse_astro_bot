import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/ui/Toast';
import GlobalNavigation from '../components/GlobalNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Elyse Astro Bot',
  description: 'Астрологический бот и мини-приложение',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            {children}
            <GlobalNavigation />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}



