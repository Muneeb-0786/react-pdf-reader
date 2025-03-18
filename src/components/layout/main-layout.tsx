
import React from 'react';
import Header from './header';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout = ({ children, className }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-radial from-accent/20 via-transparent to-transparent opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-[0.015] pointer-events-none" />
      
      <Header />
      
      <main className={cn(
        "flex-1 flex flex-col container max-w-7xl mx-auto px-4 md:px-6 py-6 z-0 animate-fade-in",
        className
      )}>
        {children}
      </main>
      
      <footer className="w-full border-t border-border/40 py-4 px-6 backdrop-blur-sm bg-background/70 z-10">
        <div className="container max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>PDF Reader AI © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
