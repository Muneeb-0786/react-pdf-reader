
export interface PDFDocument {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: Date;
  size: number;
  pages: number;
  text?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  documentId?: string;
}

export interface ChatSession {
  id: string;
  documentId: string;
  documentName: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}
