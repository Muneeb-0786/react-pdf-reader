
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

// Mock service - in a real app, this would interact with Supabase
export const PdfService = {
  uploadDocument(file: File): Promise<PDFDocument> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`Uploading document: ${file.name}`);
        
        // Create a reader to read the file
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const fileContents = e.target?.result;
            const docId = uuidv4();
            
            if (!fileContents) {
              throw new Error("Failed to read file contents");
            }
            
            // Store PDF data URL
            localStorage.setItem(`pdf_${docId}`, fileContents.toString());
            
            // Extract text from PDF using PDF.js
            const pdfText = await this.extractText(file);
            localStorage.setItem('current_document_text', pdfText);
            
            console.log("Extracted text sample:", pdfText.substring(0, 200));
            
            // Create document metadata
            const doc: PDFDocument = {
              id: docId,
              name: file.name,
              fileName: file.name,
              uploadedAt: new Date(),
              size: file.size,
              pages: 0, // Will be updated after text extraction
              text: pdfText
            };
            
            // Save to "database" (localStorage in this mock)
            const docs = this.getDocuments();
            docs.push(doc);
            localStorage.setItem('documents', JSON.stringify(docs));
            
            resolve(doc);
          } catch (error) {
            console.error('Error processing file:', error);
            
            // Create document with error message
            const doc: PDFDocument = {
              id: uuidv4(),
              name: file.name,
              fileName: file.name,
              uploadedAt: new Date(),
              size: file.size,
              pages: 0,
              text: `Unable to extract text from the PDF. Using basic file information only.`
            };
            
            // Save to "database" even with the error
            const docs = this.getDocuments();
            docs.push(doc);
            localStorage.setItem('documents', JSON.stringify(docs));
            
            // Still resolve with the doc to allow the user to continue
            resolve(doc);
          }
        };
        
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
          reject(error);
        };
        
        // Read the file as data URL (this will create a valid data URL for PDF display)
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error in uploadDocument:', error);
        reject(error);
      }
    });
  },
  
  async extractText(file: File): Promise<string> {
    try {
      // Create an array buffer from the file
      const arrayBuffer = await file.arrayBuffer();
      
      try {
        // Load the PDF document using PDF.js
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        
        // Update the pages count in localStorage
        const docs = this.getDocuments();
        const docIndex = docs.findIndex(d => d.fileName === file.name);
        if (docIndex !== -1) {
          docs[docIndex].pages = pdf.numPages;
          localStorage.setItem('documents', JSON.stringify(docs));
        }
        
        // Extract text from each page
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Extract text items and join them
          const pageText = textContent.items
            .map(item => 'str' in item ? item.str : '')
            .join(' ');
          
          fullText += pageText + '\n\n';
        }
        
        console.log(`Extracted ${pdf.numPages} pages of text from ${file.name}`);
        return fullText;
      } catch (pdfError) {
        console.error('Error processing PDF with PDF.js:', pdfError);
        
        // Alternative approach: Use basic file info
        return `Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type}\n\nText extraction failed. Please try a different PDF or check file format.`;
      }
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return `Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type}\n\nUnable to read file content. Please try again or use a different file.`;
    }
  },
  
  getDocuments(): PDFDocument[] {
    const docs = localStorage.getItem('documents');
    return docs ? JSON.parse(docs) : [];
  },
  
  getDocumentById(id: string): PDFDocument | null {
    const docs = this.getDocuments();
    const doc = docs.find(d => d.id === id);
    return doc || null;
  },
  
  deleteDocument(id: string): void {
    const docs = this.getDocuments();
    const filteredDocs = docs.filter(d => d.id !== id);
    localStorage.setItem('documents', JSON.stringify(filteredDocs));
    localStorage.removeItem(`pdf_${id}`);
  }
};
