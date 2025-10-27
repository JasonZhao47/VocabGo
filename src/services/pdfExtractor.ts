/**
 * PDF Extractor Service
 * 
 * Client-side PDF text extraction using PDF.js
 * Handles large PDFs (>5MB) that would cause memory issues on the server
 */

// PDF.js types
declare global {
  interface Window {
    pdfjsLib?: any
  }
}

export interface PDFExtractionOptions {
  onProgress?: (progress: PDFExtractionProgress) => void
  signal?: AbortSignal
}

export interface PDFExtractionProgress {
  currentPage: number
  totalPages: number
  extractedChars: number
  estimatedTimeMs: number
}

export interface PDFExtractionResult {
  text: string
  metadata: {
    pageCount: number
    characterCount: number
    extractionTimeMs: number
  }
}

export enum PDFErrorCode {
  LOAD_FAILED = 'LOAD_FAILED',
  PARSE_FAILED = 'PARSE_FAILED',
  ENCRYPTED = 'ENCRYPTED',
  CORRUPTED = 'CORRUPTED',
  CANCELLED = 'CANCELLED',
  MEMORY_ERROR = 'MEMORY_ERROR'
}

export class PDFExtractionError extends Error {
  constructor(
    message: string,
    public code: PDFErrorCode,
    public userMessage: string
  ) {
    super(message)
    this.name = 'PDFExtractionError'
  }
}

const ERROR_MESSAGES: Record<PDFErrorCode, string> = {
  LOAD_FAILED: 'Unable to load PDF library. Please check your connection.',
  PARSE_FAILED: 'Unable to read PDF file. The file may be corrupted.',
  ENCRYPTED: 'Password-protected PDFs are not supported.',
  CORRUPTED: 'PDF file appears to be corrupted. Please try a different file.',
  CANCELLED: 'PDF extraction was cancelled.',
  MEMORY_ERROR: 'PDF is too large to process. Please try a smaller file.'
}

class PDFExtractor {
  private pdfjsLoaded = false

  /**
   * Load PDF.js library from CDN
   */
  private async loadPDFJS(): Promise<void> {
    if (this.pdfjsLoaded && window.pdfjsLib) {
      return
    }

    try {
      // Load PDF.js from CDN
      await this.loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js')
      
      // Configure worker
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
        this.pdfjsLoaded = true
      } else {
        throw new Error('PDF.js failed to load')
      }
    } catch (error) {
      throw new PDFExtractionError(
        'Failed to load PDF.js library',
        PDFErrorCode.LOAD_FAILED,
        ERROR_MESSAGES.LOAD_FAILED
      )
    }
  }

  /**
   * Load a script dynamically
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
      document.head.appendChild(script)
    })
  }

  /**
   * Extract text from a single PDF page
   */
  private async extractPageText(page: any): Promise<string> {
    try {
      const textContent = await page.getTextContent()
      const text = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      return text
    } catch (error) {
      console.error('Error extracting page text:', error)
      return ''
    }
  }

  /**
   * Extract text from PDF file
   */
  async extractText(
    file: File,
    options?: PDFExtractionOptions
  ): Promise<PDFExtractionResult> {
    const startTime = Date.now()
    let accumulatedText = ''
    let pdf: any = null

    try {
      // Load PDF.js if not already loaded
      await this.loadPDFJS()

      // Check for cancellation
      if (options?.signal?.aborted) {
        throw new PDFExtractionError(
          'Extraction cancelled',
          PDFErrorCode.CANCELLED,
          ERROR_MESSAGES.CANCELLED
        )
      }

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Load PDF document
      try {
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer })
        pdf = await loadingTask.promise
      } catch (error: any) {
        // Handle specific PDF.js errors
        if (error.name === 'PasswordException') {
          throw new PDFExtractionError(
            'PDF is password protected',
            PDFErrorCode.ENCRYPTED,
            ERROR_MESSAGES.ENCRYPTED
          )
        }
        throw new PDFExtractionError(
          'Failed to parse PDF',
          PDFErrorCode.PARSE_FAILED,
          ERROR_MESSAGES.PARSE_FAILED
        )
      }

      const numPages = pdf.numPages

      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        // Check for cancellation
        if (options?.signal?.aborted) {
          throw new PDFExtractionError(
            'Extraction cancelled',
            PDFErrorCode.CANCELLED,
            ERROR_MESSAGES.CANCELLED
          )
        }

        // Get page
        const page = await pdf.getPage(pageNum)
        
        // Extract text
        const pageText = await this.extractPageText(page)
        accumulatedText += pageText + '\n'

        // Cleanup page resources
        page.cleanup()

        // Report progress
        if (options?.onProgress) {
          const elapsedMs = Date.now() - startTime
          const avgTimePerPage = elapsedMs / pageNum
          const remainingPages = numPages - pageNum
          const estimatedTimeMs = Math.round(avgTimePerPage * remainingPages)

          options.onProgress({
            currentPage: pageNum,
            totalPages: numPages,
            extractedChars: accumulatedText.length,
            estimatedTimeMs
          })
        }
      }

      // Cleanup PDF resources
      if (pdf) {
        pdf.cleanup()
        pdf.destroy()
      }

      const extractionTimeMs = Date.now() - startTime

      return {
        text: accumulatedText.trim(),
        metadata: {
          pageCount: numPages,
          characterCount: accumulatedText.length,
          extractionTimeMs
        }
      }
    } catch (error) {
      // Cleanup on error
      if (pdf) {
        try {
          pdf.cleanup()
          pdf.destroy()
        } catch (cleanupError) {
          console.error('Error cleaning up PDF:', cleanupError)
        }
      }

      // Re-throw PDFExtractionError as-is
      if (error instanceof PDFExtractionError) {
        throw error
      }

      // Handle other errors
      if (error instanceof Error) {
        throw new PDFExtractionError(
          error.message,
          PDFErrorCode.PARSE_FAILED,
          ERROR_MESSAGES.PARSE_FAILED
        )
      }

      throw new PDFExtractionError(
        'Unknown error during PDF extraction',
        PDFErrorCode.PARSE_FAILED,
        ERROR_MESSAGES.PARSE_FAILED
      )
    }
  }
}

// Export singleton instance
export const pdfExtractor = new PDFExtractor()
