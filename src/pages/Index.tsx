import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/main-layout";
import PDFUploader from "@/components/ui/pdf-uploader";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PDFDocument } from "@/types";
import { PdfService } from "@/services/pdf-service";
import { AiService } from "@/services/ai-service";
import { FileText, ArrowRight } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUploadComplete = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Show processing toast
      toast({
        title: "Processing document",
        description: "Extracting text from your PDF...",
      });

      // Process the uploaded PDF
      const document = await PdfService.uploadDocument(file);

      // Store the document text in local storage for demo purposes
      if (document.text) {
        localStorage.setItem("current_document_text", document.text);
      }

      // Create a chat session for this document
      AiService.createSession(document.id, document.name);

      // Show success toast
      toast({
        title: "Document processed",
        description: "Your PDF is ready for analysis.",
      });

      // Navigate to chat page
      navigate(`/chat?documentId=${document.id}`);
    } catch (error) {
      console.error("Error processing document:", error);

      setError(
        "There was a problem processing your document. Please try a different PDF file."
      );

      toast({
        title: "Error",
        description: "There was a problem processing your document.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            PDF Reader AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
            Upload your PDF and chat with an AI assistant about its contents
          </p>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mb-4 animate-fade-in w-full max-w-2xl"
          >
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="w-full max-w-2xl animate-fade-in">
          <PDFUploader onUploadComplete={handleUploadComplete} />
        </div>

        <Card className="mt-8 p-6 w-full max-w-2xl glass-card animate-slide-up">
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-full bg-accent/50">
              <ArrowRight className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">How it works</h3>
              <p className="text-sm text-muted-foreground">
                Upload your PDF document, and our AI will analyze its content.
                You can then ask questions about the document and receive
                intelligent responses based on the text.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Index;
