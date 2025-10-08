# Parser Unit Tests

This directory contains comprehensive unit tests for all document parsers.

## Test Files

- `utils.test.ts` - Tests for utility functions (text cleaning, validation, metadata)
- `txt.test.ts` - Tests for TXT parser
- `pdf.test.ts` - Tests for PDF parser
- `docx.test.ts` - Tests for DOCX parser
- `xlsx.test.ts` - Tests for XLSX parser
- `index.test.ts` - Tests for main parser entry point

## Running Tests

### Prerequisites

Install Deno (Supabase Edge Functions runtime):
```bash
# macOS/Linux
curl -fsSL https://deno.land/x/install/install.sh | sh

# Or via Homebrew
brew install deno
```

### Run All Parser Tests

```bash
cd supabase/functions
deno task test
```

### Run Specific Test File

```bash
deno test --allow-read --allow-env --allow-net _shared/parsers/utils.test.ts
deno test --allow-read --allow-env --allow-net _shared/parsers/txt.test.ts
deno test --allow-read --allow-env --allow-net _shared/parsers/pdf.test.ts
deno test --allow-read --allow-env --allow-net _shared/parsers/docx.test.ts
deno test --allow-read --allow-env --allow-net _shared/parsers/xlsx.test.ts
deno test --allow-read --allow-env --allow-net _shared/parsers/index.test.ts
```

## Test Coverage

### Utils Tests (utils.test.ts)
- ✅ Text cleaning (line endings, whitespace, trimming)
- ✅ Noise removal (page numbers, separators)
- ✅ Text validation (empty, whitespace-only)
- ✅ Metadata creation

### TXT Parser Tests (txt.test.ts)
- ✅ Simple text parsing
- ✅ UTF-8 character handling (Chinese, accents, emojis)
- ✅ Whitespace cleaning
- ✅ Empty file handling
- ✅ Whitespace-only file handling
- ✅ Large file handling (1MB+)
- ✅ Line ending normalization
- ✅ Metadata inclusion

### PDF Parser Tests (pdf.test.ts)
- ✅ Simple PDF parsing
- ✅ Metadata extraction (page count, document info)
- ✅ Corrupted PDF handling
- ✅ Empty buffer handling
- ✅ PDF with no text handling
- ✅ Text cleaning

### DOCX Parser Tests (docx.test.ts)
- ✅ Simple DOCX parsing
- ✅ UTF-8 character handling
- ✅ Text cleaning
- ✅ Corrupted DOCX handling
- ✅ Empty buffer handling
- ✅ DOCX with no text handling
- ✅ Metadata inclusion
- ✅ Large document handling (1000+ paragraphs)

### XLSX Parser Tests (xlsx.test.ts)
- ✅ Simple spreadsheet parsing
- ✅ Cell-by-cell text extraction
- ✅ Mixed data types (text, numbers, booleans)
- ✅ UTF-8 character handling
- ✅ Empty cell skipping
- ✅ Multiple sheet handling
- ✅ Metadata inclusion (sheet count, cell count)
- ✅ Corrupted XLSX handling
- ✅ Empty buffer handling
- ✅ Spreadsheet with no text handling
- ✅ Large spreadsheet handling (100+ rows)
- ✅ Text cleaning

### Index Tests (index.test.ts)
- ✅ Get supported types
- ✅ Type support validation
- ✅ Document parsing routing
- ✅ Unsupported type error handling
- ✅ Empty buffer handling

## Edge Cases Tested

### Empty Files
All parsers handle empty files and throw appropriate errors with message "No text content extracted".

### Corrupted Files
All parsers handle corrupted/invalid files and throw errors with descriptive messages like "Failed to parse [TYPE]".

### Large Files
- TXT: Tested with 1MB+ files
- DOCX: Tested with 1000+ paragraphs
- XLSX: Tested with 100+ rows and 300+ cells

### Special Characters
All parsers handle:
- UTF-8 characters (Chinese: 中文)
- Accented characters (Français, émojis)
- Emojis (🎉)
- Mixed encodings

### Whitespace Handling
All parsers properly clean:
- Multiple consecutive spaces
- Multiple consecutive line breaks
- Different line ending formats (\r\n, \r, \n)
- Leading/trailing whitespace

## Test Helpers

### TXT Tests
Uses `TextEncoder` to create test buffers from strings.

### PDF Tests
Includes `createMinimalPDF()` helper that generates valid minimal PDF structures for testing.

### DOCX Tests
Includes `createMinimalDOCX()` helper that uses JSZip to create valid DOCX (ZIP with XML) structures.

### XLSX Tests
Uses `XLSX.utils.aoa_to_sheet()` to create test spreadsheets from arrays.

## Requirements Coverage

These tests satisfy:
- **Requirement 1.1**: Document upload and validation (file format support)
- **Requirement 2.5**: Document preprocessing and text extraction

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Test Parsers
  run: |
    cd supabase/functions
    deno task test
```

## Notes

- Tests use Deno's standard testing library
- All tests are isolated and can run independently
- Mock data is generated programmatically (no external test files needed)
- Tests verify both success and error cases
- All parsers are tested for consistent behavior
