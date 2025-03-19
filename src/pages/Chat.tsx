import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/main-layout";
import ChatInterface from "@/components/ui/chat-interface";
import PDFViewer from "@/components/ui/pdf-viewer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage, PDFDocument } from "@/types";
import { PdfService } from "@/services/pdf-service";
import { AiService } from "@/services/ai-service";
import { ArrowLeft } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useMediaQuery } from "react-responsive";

const Chat = () => {
  const [document, setDocument] = useState<PDFDocument | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const documentId = params.get("documentId");

    if (!documentId) {
      toast({
        title: "No document selected",
        description: "Please upload a document first.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Get document details
    const doc = PdfService.getDocumentById(documentId);

    if (!doc) {
      toast({
        title: "Document not found",
        description: "The selected document could not be found.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setDocument(doc);

    // Get the PDF data from localStorage
    const pdfData = localStorage.getItem(`pdf_${documentId}`);

    if (pdfData) {
      // If the data is already a data URL, use it directly
      if (pdfData.startsWith("data:application/pdf")) {
        setPdfUrl(pdfData);
      } else {
        // Otherwise, try to create a data URL
        try {
          const blob = new Blob([pdfData], { type: "application/pdf" });
          const dataUrl = URL.createObjectURL(blob);
          setPdfUrl(dataUrl);
        } catch (error) {
          console.error("Error creating PDF URL:", error);
          toast({
            title: "Error",
            description: "Could not load the PDF preview.",
            variant: "destructive",
          });
        }
      }
    }

    // Get existing chat session or create a new one
    const session = AiService.getSessionByDocumentId(documentId);

    if (session) {
      setMessages(session.messages);
    } else {
      AiService.createSession(documentId, doc.name);
    }
  }, [location.search, navigate, toast]);

  const handleSendMessage = async (content: string) => {
    if (!document) return;

    try {
      // Add user message
      const userMessage = await AiService.sendMessage(document.id, content);
      setMessages((prev) => [...prev, userMessage]);

      // Set processing state
      setIsProcessing(true);

      // Get AI response
      const aiMessage = await AiService.getAiResponse(document.id, content);

      // Update messages
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      toast({
        title: "Error",
        description: "There was a problem generating a response.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const isMobile = useMediaQuery({ maxWidth: 767 });
  return (
    <MainLayout className="p-0 h-[calc(100vh-4rem)]">
      <div className="flex items-center px-4 py-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <h1 className="text-xl font-semibold tracking-tight">
          {document?.name}
        </h1>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[calc(100vh-8rem)]"
        style={{ flexDirection: isMobile ? "column" : "row" }}
      >
        <ResizablePanel defaultSize={50} minSize={30}>
          <PDFViewer pdfUrl={pdfUrl} className="h-full rounded-none border-r" />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <ChatInterface
            documentName={document?.name}
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            className="h-full rounded-none"
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </MainLayout>
  );
};

export default Chat;
