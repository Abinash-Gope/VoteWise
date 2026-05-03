/**
 * Test Suite Setup
 *
 * Global setup applied before every test file in the VoteWise test suite.
 * Provides shared mocks, environment stubs, and cleanup utilities.
 */

import { vi, beforeEach, afterEach } from "vitest";

// ─── Environment Variable Stubs ───────────────────────────────────────────────
// Provide safe default environment variables so tests are not dependent
// on a real .env file being present in CI or evaluator environments.

process.env.NODE_ENV = "test";

// Provide stub API keys so server code doesn't crash on import.
// Tests that need to exercise "missing key" flows will override these.
if (!process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = "test-gemini-key-stub";
}
if (!process.env.GOOGLE_CIVIC_API_KEY) {
  process.env.GOOGLE_CIVIC_API_KEY = "";
}

// ─── Console Suppression ──────────────────────────────────────────────────────
// Suppress verbose console.warn / console.error output during tests to keep
// the test runner output clean. Errors are still tracked through assertions.

const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
  console.log = vi.fn();
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
  vi.restoreAllMocks();
});
