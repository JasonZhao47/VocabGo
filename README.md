# VocabGo

An AI-powered bilingual wordlist generator that helps English learners extract vocabulary from documents.

## Features

- 📄 **Multi-format Support**: Upload PDF, TXT, DOCX, and XLSX files
- 🤖 **AI-Powered Processing**: Three-stage pipeline with text cleaning, word extraction, and translation
- 🌏 **Bilingual Output**: English words with Mandarin translations
- 💾 **Save & Manage**: Save wordlists for later access
- 📥 **Export Options**: Download as CSV or XLSX
- ⚡ **Fast Processing**: < 60 seconds for typical documents
- 🎯 **Smart Extraction**: Up to 40 relevant words per document

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: GLM-Flash LLM for extraction and translation
- **Build**: Vite + pnpm

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker Desktop (for local Supabase)
- Supabase CLI
- GLM API key ([Get one here](https://open.bigmodel.cn/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VocabGo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment**
   ```bash
   # Copy environment template
   cp .env.local.example .env.local
   
   # Edit .env.local and add your GLM API key
   # VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY will be set after starting Supabase
   ```

4. **Start Supabase**
   ```bash
   cd supabase
   ./setup-local.sh
   ```
   
   Copy the API URL and anon key from the output to your `.env.local` file.

5. **Set Edge Function secrets**
   ```bash
   supabase secrets set GLM_API_KEY=your-api-key-here
   ```

6. **Verify setup**
   ```bash
   ./scripts/verify-setup.sh
   ```

7. **Start development server**
   ```bash
   pnpm dev
   ```

8. **Open browser**
   ```
   http://localhost:5173
   ```

## Development

### Available Commands

```bash
# Development
pnpm dev              # Start dev server on port 5173

# Building
pnpm build            # Type check + build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests once
pnpm test:ui          # Run tests with UI

# Type Checking
pnpm type-check       # TypeScript validation
```

### Project Structure

```
.
├── src/                      # Frontend source code
│   ├── pages/               # Vue page components
│   ├── components/          # Reusable Vue components
│   ├── composables/         # Vue composables
│   ├── services/            # API service layer
│   ├── state/               # Global state management
│   └── lib/                 # Utilities and configs
├── supabase/                # Backend code
│   ├── functions/           # Edge Functions
│   │   ├── process-document/
│   │   ├── save-wordlist/
│   │   ├── fetch-wordlists/
│   │   └── delete-wordlist/
│   └── migrations/          # Database migrations
├── tests/                   # Test files
│   ├── e2e/                # End-to-end tests
│   └── smoke/              # Smoke tests
└── scripts/                # Utility scripts
```

## Testing

### Automated Tests

Run the end-to-end test suite:

```bash
pnpm test tests/e2e/end-to-end.test.ts
```

### Manual Testing

Follow the comprehensive testing checklist:

```bash
# View the checklist
cat TESTING_CHECKLIST.md
```

The checklist covers:
- Document upload and processing
- Saving wordlists
- Exporting (CSV and XLSX)
- Deleting wordlists
- Error handling
- Performance validation
- Word quality checks

## Configuration

### Environment Variables

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed configuration guide.

**Required Frontend Variables:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Required Backend Variables:**
- `GLM_API_KEY` - GLM API authentication key

**Optional Configuration:**
- `GLM_MODEL` - LLM model (default: glm-4-flash)
- `GLM_MAX_TOKENS` - Max tokens per request (default: 2000)
- `GLM_TEMPERATURE` - LLM temperature (default: 0.7)

### Feature Flags

- `MAX_WORDS_PER_DOCUMENT` - Words per wordlist (default: 40)
- `MAX_FILE_SIZE_MB` - Maximum file size (default: 50)
- `FILE_RETENTION_HOURS` - File storage duration (default: 24)

## Architecture

### Processing Pipeline

```
Document Upload
    ↓
Text Extraction (Parser)
    ↓
Text Cleaning (Regex/Heuristics)
    ↓
Word Extraction (AI Extractor Agent)
    ↓
Translation (AI Translator Agent)
    ↓
Wordlist Result
```

### AI Agents

1. **Extractor Agent**: Identifies up to 40 key English words
   - Filters duplicates and stop words
   - Ensures ≥95% word validity

2. **Translator Agent**: Generates Mandarin translations
   - Context-aware translation
   - ≥95% translation accuracy

### Design Decisions

See [ARCHITECTURE_DECISION.md](.kiro/specs/ai-wordlist-extraction/ARCHITECTURE_DECISION.md) for rationale on:
- Traditional text cleaning vs LLM-based cleaning
- Three-stage pipeline design
- Technology choices

## Documentation

- [ENV_SETUP.md](./ENV_SETUP.md) - Environment configuration guide
- [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Manual testing guide
- [Design Document](.kiro/specs/ai-wordlist-extraction/design.md) - Technical design
- [Requirements](.kiro/specs/ai-wordlist-extraction/requirements.md) - Feature requirements
- [Tasks](.kiro/specs/ai-wordlist-extraction/tasks-mvp.md) - Implementation tasks

## Troubleshooting

### Common Issues

**"Failed to connect to Supabase"**
```bash
# Check Supabase status
supabase status

# Restart if needed
supabase stop && supabase start

# Verify .env.local has correct values
cat .env.local
```

**"GLM_API_KEY not found"**
```bash
# Set the secret
supabase secrets set GLM_API_KEY=your-key-here

# Verify it's set
supabase secrets list
```

**"Processing takes too long"**
- Check GLM API quota and rate limits
- Verify network connection
- Check Edge Function logs: `supabase functions logs process-document`

**Environment variables not updating**
- Restart dev server after changing `.env.local`
- Clear browser cache
- Ensure variable names start with `VITE_` for frontend

### Getting Help

1. Check the [ENV_SETUP.md](./ENV_SETUP.md) guide
2. Run the verification script: `./scripts/verify-setup.sh`
3. Check Supabase logs: `supabase functions logs`
4. Review the [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Run `pnpm type-check` before committing
5. Test manually using the checklist

## License

[Your License Here]

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [GLM API Documentation](https://open.bigmodel.cn/dev/api)
- [Vite Documentation](https://vitejs.dev/)
