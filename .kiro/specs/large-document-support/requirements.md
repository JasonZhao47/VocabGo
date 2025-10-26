# Large Document Support Requirements

## Introduction

Enable processing of large documents (up to 5MB DOCX/PDF) by moving text extraction to the client side, reducing Edge Function memory pressure.

## Glossary

- **Client-Side Extraction**: Text extraction performed in the browser before sending to server
- **Edge Function**: Serverless function with limited memory (current limit causes crashes for files >500KB)
- **Streaming Upload**: Sending extracted text instead of binary file data

## Requirements

### Requirement 1: Client-Side DOCX Text Extraction

**User Story:** As a user, I want to upload large DOCX files (up to 5MB) without encountering memory errors

#### Acceptance Criteria

1. WHEN a user selects a DOCX file, THE System SHALL extract text content in the browser before upload
2. WHEN text extraction completes, THE System SHALL send only the extracted text to the Edge Function
3. WHEN a DOCX file exceeds 5MB, THE System SHALL reject the file with a clear error message
4. WHEN text extraction fails, THE System SHALL display a user-friendly error message

### Requirement 2: Maintain PDF Processing

**User Story:** As a user, I want PDF processing to continue working as before

#### Acceptance Criteria

1. WHEN a user uploads a PDF file, THE System SHALL continue using server-side extraction
2. WHEN a PDF file exceeds 5MB, THE System SHALL reject the file with a clear error message

### Requirement 3: Backward Compatibility

**User Story:** As a developer, I want the API contract to remain stable

#### Acceptance Criteria

1. WHEN the frontend sends extracted text, THE Edge Function SHALL process it through the existing AI pipeline
2. WHEN processing completes, THE Edge Function SHALL return the same response format as before
3. WHEN errors occur, THE Edge Function SHALL return consistent error codes and messages
