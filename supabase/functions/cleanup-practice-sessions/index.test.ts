/**
 * Tests for Cleanup Practice Sessions Edge Function
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts';

const FUNCTION_URL = 'http://localhost:54321/functions/v1/cleanup-practice-sessions';

Deno.test('Cleanup Practice Sessions - Success', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(data.success, true);
  assertExists(data.deletedSessions);
  assertExists(data.deletedPracticeSets);
  assertEquals(typeof data.deletedSessions, 'number');
  assertEquals(typeof data.deletedPracticeSets, 'number');
});

Deno.test('Cleanup Practice Sessions - CORS headers', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'OPTIONS',
  });

  assertEquals(response.status, 200);
  assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*');
  assertExists(response.headers.get('Access-Control-Allow-Headers'));
});
