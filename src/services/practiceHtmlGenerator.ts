import { generateStaticHtml } from './htmlGenerationService'
import type { Question } from '@/types/practice'

/**
 * Options for generating HTML practice interface
 */
export interface HtmlGenerationOptions {
  /** Name of the wordlist */
  wordlistName: string
  /** Array of practice questions */
  questions: Question[]
  /** Timestamp for file naming */
  timestamp: Date
}

/**
 * Result of HTML generation
 */
export interface GeneratedHtml {
  /** Complete HTML document as string */
  html: string
  /** Suggested filename for download */
  filename: string
  /** File size in bytes */
  size: number
}

/**
 * Service for generating self-contained HTML practice interfaces
 * Wrapper around htmlGenerationService for backward compatibility
 */
export class PracticeHtmlGenerator {
  /**
   * Generate a complete HTML practice interface
   */
  generateHtml(options: HtmlGenerationOptions): GeneratedHtml {
    const { wordlistName, questions, timestamp } = options
    
    // Generate HTML using the simple service
    const html = generateStaticHtml({
      wordlistName,
      questions
    })
    
    // Calculate file size
    const size = new Blob([html]).size
    
    // Generate filename
    const filename = this.generateFilename(wordlistName, timestamp)
    
    return {
      html,
      filename,
      size
    }
  }

  /**
   * Generate filename for the HTML download
   */
  private generateFilename(wordlistName: string, timestamp: Date): string {
    // Sanitize wordlist name for filename
    const sanitizedName = wordlistName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)
    
    // Format date as YYYY-MM-DD
    const year = timestamp.getFullYear()
    const month = String(timestamp.getMonth() + 1).padStart(2, '0')
    const day = String(timestamp.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    return `${sanitizedName || 'practice'}-practice-${dateStr}.html`
  }
}
