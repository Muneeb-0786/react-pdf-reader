
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn(
      "w-full px-6 py-4 border-b border-border/40 backdrop-blur-sm bg-background/70 z-10 transition-all duration-300",
      className
    )}>
      <div className="container flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center space-x-2 transition-all duration-300 hover:opacity-80">
          <FileText className="h-8 w-8 text-primary animate-float" />
          <span className="font-medium text-xl">PDF Reader AI</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
          >
            Upload
          </Link>
          <Link 
            to="/chat" 
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
          >
            Chat
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
