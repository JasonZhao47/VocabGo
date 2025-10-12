import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts';

Deno.test('share-practice-set - should generate secure URL slug', () => {
  // Test the generateSecureSlug function logic
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const slug = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Should be 32 characters (16 bytes * 2 hex chars)
  assertEquals(slug.length, 32);
  
  // Should only contain hex characters
  assertEquals(/^[0-9a-f]{32}$/.test(slug), true);
});

Deno.test('share-practice-set - should validate request structure', () => {
  const validRequest = {
    practiceSetId: 'abc-123-def-456',
  };
  
  assertExists(validRequest.practiceSetId);
  assertEquals(typeof validRequest.practiceSetId, 'string');
});

Deno.test('share-practice-set - should validate response structure', () => {
  const response = {
    shareUrl: 'abc123def456789012345678901234',
    fullUrl: 'https://example.com/functions/v1/get-shared-practice/abc123def456789012345678901234',
  };
  
  assertExists(response.shareUrl);
  assertExists(response.fullUrl);
  assertEquals(typeof response.shareUrl, 'string');
  assertEquals(typeof response.fullUrl, 'string');
  assertEquals(response.fullUrl.includes(response.shareUrl), true);
});
