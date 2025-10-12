/**
 * Tests for Save Practice Session Edge Function
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts';

const FUNCTION_URL = 'http://localhost:54321/functions/v1/save-practice-session';
const TEST_SESSION_ID = 'test-session-' + Date.now();

Deno.test('Save Practice Session - Missing session ID', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      practiceSetId: 'test-id',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      answers: {},
      score: 85,
      completed: true,
    }),
  });

  assertEquals(response.status, 401);
  const data = await response.json();
  assertEquals(data.error, 'Session ID required');
});

Deno.test('Save Practice Session - Missing required fields', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      practiceSetId: 'test-id',
      // Missing other required fields
    }),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, 'Missing required fields');
});

Deno.test('Save Practice Session - Invalid score range', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      practiceSetId: 'test-id',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      answers: {},
      score: 150, // Invalid score
      completed: true,
    }),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, 'Score must be between 0 and 100');
});

Deno.test('Save Practice Session - Practice set not found', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': TEST_SESSION_ID,
    },
    body: JSON.stringify({
      practiceSetId: '00000000-0000-0000-0000-000000000000',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      answers: {},
      score: 85,
      completed: true,
    }),
  });

  assertEquals(response.status, 404);
  const data = await response.json();
  assertEquals(data.error, 'Practice set not found');
});

Deno.test('Save Practice Session - CORS headers', async () => {
  const response = await fetch(FUNCTION_URL, {
    method: 'OPTIONS',
  });

  assertEquals(response.status, 200);
  assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*');
  assertExists(response.headers.get('Access-Control-Allow-Headers'));
});
