
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
  pdfUrl?: string;
  className?: string;
}

const PDFViewer = ({ pdfUrl, className }: PDFViewerProps) => {
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset loading state when the URL changes
    if (pdfUrl) {
      setLoading(true);
      setError(null);
    }
  }, [pdfUrl]);
  
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  const handleIframeError = () => {
    setLoading(false);
    setError("Failed to load the PDF. Please try again.");
  };
  
  if (!pdfUrl) {
    return (
      <Card className={cn(
        "flex items-center justify-center p-6 text-center text-muted-foreground h-full",
        className
      )}>
        <div>
          <p>No PDF document loaded</p>
          <p className="text-sm mt-2">Upload a document to view it here</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={cn(
      "flex flex-col h-full overflow-hidden",
      className
    )}>
      <div className="flex justify-between items-center p-2 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={zoomOut} disabled={loading}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="icon" onClick={zoomIn} disabled={loading}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-secondary/20 p-4">
        {loading && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-destructive">
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <iframe 
          src={pdfUrl}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          className={cn(
            "w-full h-full border-0",
            loading ? "hidden" : "block"
          )}
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top left',
            width: `${100 / scale}%`,
            height: `${100 / scale}%`
          }}
        />
      </div>
    </Card>
  );
};

export default PDFViewer;
