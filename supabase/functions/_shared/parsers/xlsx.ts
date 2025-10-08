/**
 * XLSX Parser
 * Extracts text cell-by-cell from spreadsheets
 */

import { ParsedDocument } from './types.ts'
import {
  processExtractedText,
  validateExtractedText,
  createMetadata,
} from './utils.ts'

// Using xlsx (SheetJS) for Excel parsing via npm
import * as XLSX from 'npm:xlsx@0.18.5'

/**
 * Parse XLSX document and extract text from all cells
 */
export async function parseXLSX(buffer: ArrayBuffer): Promise<ParsedDocument> {
  try {
    // Read workbook from buffer
    const workbook = XLSX.read(buffer, { type: 'array' })
    
    // Extract text from all sheets
    const textParts: string[] = []
    let totalCells = 0
    
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert sheet to array of arrays
      const sheetData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
      })
      
      // Extract text from each cell
      sheetData.forEach((row) => {
        row.forEach((cell) => {
          if (cell !== null && cell !== undefined && cell !== '') {
            const cellText = String(cell).trim()
            if (cellText) {
              textParts.push(cellText)
              totalCells++
            }
          }
        })
      })
    })
    
    // Join all text with spaces
    const rawText = textParts.join(' ')
    const cleanedText = processExtractedText(rawText)
    
    validateExtractedText(cleanedText)

    // Create metadata
    const metadata = createMetadata('xlsx', {
      sheetCount: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames,
      totalCells,
      size: buffer.byteLength,
    })

    return {
      text: cleanedText,
      documentType: 'xlsx',
      metadata,
    }
  } catch (error) {
    throw new Error(`Failed to parse XLSX: ${error.message}`)
  }
}
