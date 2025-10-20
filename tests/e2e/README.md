# End-to-End Tests

This directory contains end-to-end tests that validate complete user workflows by testing against actual backend services.

## Prerequisites

Before running E2E tests, ensure you have:

1. **Supabase running locally**
   ```bash
   cd supabase
   supabase start
   ```

2. **Environment variables configured**
   - Copy `.env.example` to `.env.local`
   - Ensure `VITE_SUPABASE_URL` points to your local Supabase instance (default: `http://localhost:54321`)

3. **Database migrations applied**
   ```bash
   cd supabase
   supabase db reset  # This applies all migrations
   ```

## Running Tests

### Run all E2E tests
```bash
pnpm test tests/e2e/
```

### Run specific test file
```bash
pnpm test tests/e2e/sharing-workflow.test.ts
```

### Run with UI
```bash
pnpm test:ui tests/e2e/
```

## Test Suites

### `end-to-end.test.ts`
Tests the core wordlist workflow:
- Document upload and processing
- Wordlist saving
- Fetching saved wordlists
- Exporting wordlists
- Deleting wordlists

### `sharing-workflow.test.ts`
Tests the student tracking and sharing system:
- Teacher enables sharing and gets share URL
- Student accesses via share link
- Student registers with nickname
- Student practices and makes mistakes
- Teacher views dashboard with accurate data
- Anonymous mode functionality
- Duplicate session prevention
- Nickname validation
- Disable sharing

## Troubleshooting

### Tests fail with "Supabase is not running"
**Solution:** Start Supabase locally:
```bash
cd supabase
supabase start
```

### Tests fail with "Function not found"
**Solution:** Ensure all edge functions are deployed locally:
```bash
cd supabase
supabase functions deploy
```

### Tests fail with database errors
**Solution:** Reset the database to apply all migrations:
```bash
cd supabase
supabase db reset
```

### Tests timeout
**Cause:** Network issues or slow backend processing
**Solution:** 
- Check Supabase logs: `supabase status`
- Increase test timeout in the test file
- Verify your internet connection (for LLM API calls)

## Test Data

E2E tests use minimal test data to keep tests fast:
- Small wordlists (2-5 words)
- Simple test documents
- Mock device information

All test data is cleaned up after tests complete (in `afterAll` hooks).

## CI/CD Considerations

These E2E tests require a running Supabase instance and are not suitable for standard CI/CD pipelines without additional setup. Consider:

1. **Skip in CI:** Add `test:unit` script that excludes E2E tests
2. **Separate E2E pipeline:** Run E2E tests in a separate job with Supabase setup
3. **Use Supabase CLI in CI:** Set up Supabase in CI environment

## Writing New E2E Tests

When adding new E2E tests:

1. **Follow the pattern:** Use existing tests as templates
2. **Add cleanup:** Always clean up test data in `afterAll`
3. **Check prerequisites:** Verify Supabase connection in `beforeAll`
4. **Use descriptive names:** Test names should clearly describe the workflow
5. **Add console logs:** Help developers understand test progress
6. **Handle errors gracefully:** Provide helpful error messages
7. **Keep tests independent:** Each test should be able to run in isolation

## Performance

E2E tests are slower than unit tests because they:
- Make real HTTP requests
- Interact with the database
- May call external APIs (LLM services)

Typical test durations:
- Simple workflow: 1-5 seconds
- Complex workflow with LLM: 10-30 seconds
- Full test suite: 1-2 minutes

## Best Practices

1. **Run unit tests first:** E2E tests are slower, so run unit tests during development
2. **Run E2E before commits:** Ensure full workflows work before pushing
3. **Keep tests focused:** Each test should validate one complete workflow
4. **Use realistic data:** Test data should resemble production data
5. **Document assumptions:** Clearly state what the test expects
