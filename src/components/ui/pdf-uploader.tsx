
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface PDFUploaderProps {
  onUploadComplete?: (file: File) => void;
  className?: string;
}

const PDFUploader = ({ onUploadComplete, className }: PDFUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelection(droppedFile);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
    simulateUpload(selectedFile);
  };

  const simulateUpload = (file: File) => {
    setUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);
          
          if (onUploadComplete) {
            onUploadComplete(file);
          }
          
          toast({
            title: "Upload complete",
            description: `${file.name} has been uploaded successfully.`,
          });
          
          return 100;
        }
        
        return newProgress;
      });
    }, 300);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setUploadComplete(false);
  };

  return (
    <Card className={cn(
      "p-8 glass-card transition-all duration-300 overflow-hidden",
      isDragging ? "border-primary/50 shadow-lg" : "",
      className
    )}>
      <div 
        className={cn(
          "flex flex-col items-center justify-center min-h-[300px] rounded-md border-2 border-dashed transition-all duration-300",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
          file ? "py-8" : "py-12"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <div className="text-center space-y-4 px-8 max-w-md mx-auto animate-fade-in">
            <div className="flex justify-center">
              <Upload className="h-10 w-10 text-muted-foreground animate-float" />
            </div>
            <h3 className="text-lg font-medium">Upload your PDF</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your PDF file here, or click the button below to browse
            </p>
            <Button 
              onClick={handleButtonClick}
              className="mt-4 transition-all duration-300 hover:shadow-md"
            >
              Browse files
            </Button>
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef} 
              onChange={handleFileInputChange} 
              className="hidden" 
            />
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-md bg-primary/10">
                <File className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {uploadComplete ? (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="flex-shrink-0 h-8 w-8"
                  onClick={resetUpload}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Uploading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}
            
            {uploadComplete && (
              <div className="text-center space-y-4">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  File uploaded successfully!
                </p>
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={resetUpload}
                >
                  Upload another PDF
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PDFUploader;
