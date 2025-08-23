'use client';
import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { store } from '../store';
import Header from '../Components/common/Header';
import AuthProvider from '../Components/auth/AuthProvider';
import Toast from '../Components/ui/Toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>HeyDoc - Healthcare Management Platform</title>
        <meta name="description" content="Your trusted partner in healthcare. Connect with qualified doctors and manage your health journey with ease." />
        <meta name="author" content="nskbobby" />
        <meta name="copyright" content="© 2025 nskbobby. All rights reserved." />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={inter.className}>
        <Provider store={store}>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
              <Toast />
            </div>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}