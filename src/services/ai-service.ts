
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatSession } from '@/types';
import { GeminiService } from './gemini-service';

export const AiService = {
  async generateResponse(prompt: string, context?: string): Promise<string> {
    return GeminiService.generateResponse(prompt, context);
  },
  
  async sendMessage(documentId: string, content: string): Promise<ChatMessage> {
    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
      documentId
    };
    
    // Add message to session
    this.addMessageToSession(documentId, userMessage);
    
    // Return the user message
    return userMessage;
  },
  
  async getAiResponse(documentId: string, userMessage: string): Promise<ChatMessage> {
    // In a real app, we would retrieve the document content from Supabase
    const documentContent = localStorage.getItem('current_document_text') || '';
    
    // Generate AI response using Gemini
    const responseContent = await this.generateResponse(userMessage, documentContent);
    
    // Create AI message
    const aiMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      documentId
    };
    
    // Add message to session
    this.addMessageToSession(documentId, aiMessage);
    
    // Return the AI message
    return aiMessage;
  },
  
  createSession(documentId: string, documentName: string): ChatSession {
    const existingSession = this.getSessionByDocumentId(documentId);
    
    if (existingSession) {
      return existingSession;
    }
    
    const newSession: ChatSession = {
      id: uuidv4(),
      documentId,
      documentName,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    };
    
    const sessions = this.getSessions();
    sessions.push(newSession);
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    
    return newSession;
  },
  
  getSessions(): ChatSession[] {
    const storedSessions = localStorage.getItem('chat_sessions');
    return storedSessions ? JSON.parse(storedSessions) : [];
  },
  
  getSessionById(sessionId: string): ChatSession | undefined {
    const sessions = this.getSessions();
    return sessions.find(session => session.id === sessionId);
  },
  
  getSessionByDocumentId(documentId: string): ChatSession | undefined {
    const sessions = this.getSessions();
    return sessions.find(session => session.documentId === documentId);
  },
  
  addMessageToSession(documentId: string, message: ChatMessage): void {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(session => session.documentId === documentId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].messages.push(message);
      sessions[sessionIndex].updatedAt = new Date();
      localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }
  }
};
