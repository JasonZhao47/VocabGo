# Security Verification Tests

This directory contains comprehensive security tests for the anonymous session-based authentication system.

## Test Coverage

### Session Security Tests (`session-security.test.ts`)
Tests the client-side session management system:

1. **Session ID Collision Handling**
   - Generates 1000+ unique session IDs to verify no collisions
   - Validates UUID v4 format compliance
   - Verifies sufficient entropy (122 bits of randomness)

2. **Session Persistence Across Page Reloads**
   - Tests localStorage persistence
   - Verifies session ID remains constant across multiple reads
   - Tests session clearing and regeneration

3. **No Sensitive Data in Session IDs**
   - Verifies no PII (email, phone, names) in session IDs
   - Confirms session IDs are not reversible to user data
   - Ensures no system information exposure (timestamps, IPs)

4. **Session Isolation Between Browsers**
   - Documents browser-level localStorage isolation
   - Verifies different sessions are created when localStorage is cleared

### Edge Function Security Tests (`edge-function-security.test.ts`)
Tests the server-side security enforcement:

1. **Cross-Session Data Access Prevention**
   - Verifies users can only fetch their own wordlists
   - Tests that delete operations are session-scoped
   - Confirms new sessions see empty data

2. **Edge Functions Always Include session_id in WHERE Clauses**
   - Tests all Edge Functions require X-Session-ID header
   - Verifies 400 BAD_REQUEST for missing session IDs
   - Rejects empty or whitespace-only session IDs

3. **RLS Policies Prevent Direct Table Access**
   - Tests that direct Supabase queries work with session filtering
   - Verifies session-based data isolation at database level
   - Confirms wrong session IDs return no data

## Running the Tests

### Session Security Tests (No Dependencies)
```bash
pnpm vitest --run tests/security/session-security.test.ts
```

### Edge Function Security Tests (Requires Supabase)
```bash
# Start Supabase first
cd supabase && supabase start

# In another terminal, run the tests
pnpm vitest --run tests/security/edge-function-security.test.ts
```

### Run All Security Tests
```bash
# Make sure Supabase is running
pnpm vitest --run tests/security/
```

## Security Requirements Verified

These tests verify all security requirements from the spec:

- **Requirement 5.1**: Data isolation is enforced (cross-session access tests)
- **Requirement 5.2**: RLS policies prevent unauthorized access (RLS tests)
- **Requirement 5.3**: Files have appropriate access controls (Edge Function tests)
- **Requirement 5.4**: No data leakage between sessions (all tests)

## Test Data Cleanup

The Edge Function tests automatically clean up test data in the `afterAll` hook. If tests fail unexpectedly, you may need to manually clean up:

```bash
# Reset the database
cd supabase && supabase db reset
```

## Security Considerations

### What These Tests Verify
- ✅ Session IDs are cryptographically random (UUID v4)
- ✅ No collision risk with realistic usage (1 in 2^122 probability)
- ✅ Session data is isolated between different sessions
- ✅ Edge Functions enforce session-based filtering
- ✅ No sensitive data in session identifiers
- ✅ Session persistence works correctly

### What These Tests Don't Cover
- ❌ Physical device access (if someone has your device, they can access your session)
- ❌ Network security (HTTPS should be used in production)
- ❌ Session hijacking via XSS (mitigated by localStorage, not cookies)
- ❌ Long-term session management (no expiration implemented)

### Trade-offs Accepted
- **No cross-device sync**: Sessions are browser-specific
- **Data loss on localStorage clear**: Users lose data if they clear browser storage
- **No authentication**: Anyone with the session ID can access that session's data
- **Acceptable for MVP**: Temporary vocabulary lists don't require strong authentication

## Future Enhancements

If stronger security is needed:
1. Add server-side session storage with expiration
2. Implement optional user authentication for data persistence
3. Add session refresh/rotation mechanisms
4. Implement rate limiting per session
5. Add audit logging for security events
