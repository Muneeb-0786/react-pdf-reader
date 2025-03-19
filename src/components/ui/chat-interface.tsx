import React, { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
// Replace html-react-parser with more powerful markdown renderer
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ChatInterfaceProps {
  documentName?: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
  className?: string;
}

const ChatInterface = ({
  documentName,
  messages,
  onSendMessage,
  isProcessing = false,
  className,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col h-[calc(100vh-12rem)] overflow-hidden glass-card transition-all duration-300",
        className
      )}
    >
      {/* Chat header */}
      <div className="p-4 border-b border-border/50 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        {documentName && (
          <div className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
            {documentName}
          </div>
        )}
      </div>

      {/* Chat messages */}
      <ScrollArea
        ref={scrollAreaRef}
        className=" h-[calc(100vh-12rem)] p-4 space-y-4 overflow-y-hidden "
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Ask about your document
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Your AI assistant can answer questions about the content of your
              PDF. Try asking something specific!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-3 max-w-[85%] transition-all duration-300 animate-in",
                message.role === "user"
                  ? "ml-auto justify-end fade-in mb-2"
                  : "fade-in mb-2"
              )}
            >
              {message.role !== "user" && (
                <Avatar className="h-8 w-8 border border-border items-center justify-center">
                  <Bot className="h-4 w-4" />
                </Avatar>
              )}

              <div
                className={cn(
                  "p-3 rounded-lg text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {message.role === "user" ? (
                  message.content
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 border border-border items-center justify-center m">
                  <User className="h-4 w-4" />
                </Avatar>
              )}
            </div>
          ))
        )}

        {isProcessing && (
          <div className="flex items-start space-x-3 max-w-[85%] animate-fade-in">
            <Avatar className="h-8 w-8 border border-border items-center justify-center">
              <Bot className="h-4 w-4" />
            </Avatar>
            <div className="p-3 rounded-lg bg-secondary text-secondary-foreground">
              <div className="flex space-x-1 h-5 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse opacity-75" />
                <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:150ms] opacity-75" />
                <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:300ms] opacity-75" />
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Chat input */}
      <div className="p-4 border-t border-border/50">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your document..."
            className="flex-1 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-ring"
            disabled={isProcessing}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isProcessing}
            className="transition-all duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatInterface;
