
import { ChatMessage } from "@/types";

const GEMINI_API_KEY = "AIzaSyCKQ0eQv237MEH5QmG6NUkF-aWVDkiH35E";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const GeminiService = {
  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      console.log("Generating response with Gemini API");
      
      // Validate context quality
      const hasValidContext = context && 
        context.length > 100 && 
        !context.includes("Unable to extract text") &&
        !context.includes("Text extraction failed");
      
      // Always provide a basic prompt even if we don't have good context
      const systemPrompt = hasValidContext
        ? `You are a helpful AI assistant that answers questions about PDF documents. Answer based on the following document content:
        
Document content:
${context.substring(0, 30000)}`
        : "You are a helpful AI assistant. The system attempted to analyze a PDF but couldn't extract meaningful text. Please help the user with their question based on your general knowledge.";
        
      const requestBody = {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more factual responses
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };
      
      console.log("Context length:", context ? context.length : 0);
      console.log("Context quality check:", hasValidContext ? "Good context" : "Poor/missing context");
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log("Gemini API response received");
      
      // Extract text from the response
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                           "I'm sorry, I couldn't generate a response at this time.";
      
      return generatedText;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "I encountered an error while processing your request. Please try again.";
    }
  }
};
