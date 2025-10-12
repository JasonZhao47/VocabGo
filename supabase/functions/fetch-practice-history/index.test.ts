/**
 * Tests for Fetch Practice History Edge Function
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts';

const FUNCTION_URL = 'http://localhost:54321/functions/v1/fetch-practice-history';
const TEST_SESSION_ID = 'test-session-' + Date.now();

Deno.test('Fetch Practice History - Missing session ID', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  assertEquals(response.status, 401);
  const data = await response.json();
  assertEquals(data.error, 'Session ID required');
});

Deno.test('Fetch Practice History - Success with empty history', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(data.success, true);
  assertExists(data.history);
  assertEquals(Array.isArray(data.history), true);
});

Deno.test('Fetch Practice History - With wordlist filter', async () => {
  const wordlistId = '00000000-0000-0000-0000-000000000000';
  const response = await fetch(`${FUNCTION_URL}?wordlistId=${wordlistId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(data.success, true);
  assertExists(data.history);
});

Deno.test('Fetch Practice History - With pagination', async () => {
  const response = await fetch(`${FUNCTION_URL}?limit=10&offset=0`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(data.success, true);
  assertExists(data.history);
  assertEquals(data.history.length <= 10, true);
});

Deno.test('Fetch Practice History - CORS headers', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'OPTIONS',
  });

  assertEquals(response.status, 200);
  assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*');
  assertExists(response.headers.get('Access-Control-Allow-Headers'));
});
