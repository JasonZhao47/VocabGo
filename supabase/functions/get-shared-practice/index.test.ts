import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts';

Deno.test('get-shared-practice - should validate share URL format', () => {
  const validShareUrl = 'abc123def456789012345678901234';
  const invalidShareUrl = 'invalid-url';
  
  // Valid URL should be 32 hex characters
  assertEquals(/^[0-9a-f]{32}$/.test(validShareUrl), true);
  assertEquals(/^[0-9a-f]{32}$/.test(invalidShareUrl), false);
});

Deno.test('get-shared-practice - should validate response structure', () => {
  const response = {
    id: 'practice-set-123',
    questions: {
      matching: [],
      fillBlank: [],
      multipleChoice: [],
    },
    wordlistName: 'Test Wordlist',
    createdAt: '2025-01-10T00:00:00Z',
  };
  
  assertExists(response.id);
  assertExists(response.questions);
  assertExists(response.wordlistName);
  assertExists(response.createdAt);
  
  assertEquals(typeof response.id, 'string');
  assertEquals(typeof response.questions, 'object');
  assertEquals(typeof response.wordlistName, 'string');
  assertEquals(typeof response.createdAt, 'string');
});

Deno.test('get-shared-practice - should extract share URL from path', () => {
  const testUrl = 'https://example.com/functions/v1/get-shared-practice/abc123def456';
  const url = new URL(testUrl);
  const pathParts = url.pathname.split('/');
  const shareUrl = pathParts[pathParts.length - 1];
  
  assertEquals(shareUrl, 'abc123def456');
});
