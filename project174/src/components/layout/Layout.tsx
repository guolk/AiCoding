import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AudioPlayerBar } from '@/components/audio/AudioPlayer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-earth-50 dark:bg-forest-950 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-24">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <AudioPlayerBar />
    </div>
  );
};
