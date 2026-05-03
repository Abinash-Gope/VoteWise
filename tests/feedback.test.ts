/**
 * feedback.test.ts — Unit Tests for Feedback Validation Logic
 *
 * Validates feedback form constraints that mirror the Firestore security rules
 * in firestore.rules. Tests boundary conditions, field types, and submission flow.
 *
 * Firestore rules require:
 *   - rating: int, 1–5
 *   - type: string, one of ['accuracy', 'improvement', 'helpfulness']
 *   - createdAt: serverTimestamp
 *   - comment: optional, string, max 2000 chars
 *   - page: optional, string, max 256 chars
 *   - userId: optional, string, max 128 chars
 *   - Max 6 keys total
 */

import { describe, it, expect } from "vitest";

// ─── Feedback Payload Validator ───────────────────────────────────────────────
// Mirrors the Firestore rule validation logic in pure TypeScript.

type FeedbackType = "accuracy" | "improvement" | "helpfulness";

interface FeedbackPayload {
  rating: number;
  type: FeedbackType | string;
  comment?: string;
  page?: string;
  userId?: string | null;
  [key: string]: unknown;
}

const VALID_TYPES: FeedbackType[] = ["accuracy", "improvement", "helpfulness"];

function validateFeedback(data: FeedbackPayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!("rating" in data) || !("type" in data)) {
    errors.push("Missing required fields: rating, type");
  }

  // Rating: integer 1–5
  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
    errors.push("Rating must be an integer between 1 and 5");
  }

  // Type: must be valid enum
  if (!VALID_TYPES.includes(data.type as FeedbackType)) {
    errors.push(`Type must be one of: ${VALID_TYPES.join(", ")}`);
  }

  // Comment: optional, max 2000 chars
  if (data.comment !== undefined && data.comment !== null) {
    if (typeof data.comment !== "string") errors.push("Comment must be a string");
    else if (data.comment.length > 2000) errors.push("Comment must be 2000 characters or fewer");
  }

  // Page: optional, max 256 chars
  if (data.page !== undefined && data.page !== null) {
    if (typeof data.page !== "string") errors.push("Page must be a string");
    else if (data.page.length > 256) errors.push("Page must be 256 characters or fewer");
  }

  // UserId: optional, max 128 chars
  if (data.userId !== undefined && data.userId !== null) {
    if (typeof data.userId !== "string") errors.push("UserId must be a string");
    else if (data.userId.length > 128) errors.push("UserId must be 128 characters or fewer");
  }

  // Max 6 keys
  const keyCount = Object.keys(data).length;
  if (keyCount > 6) {
    errors.push("Payload must not exceed 6 keys");
  }

  return { valid: errors.length === 0, errors };
}

function isSubmitEnabled(rating: number): boolean {
  return rating >= 1 && rating <= 5;
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe("Feedback Payload Validation — Rating Field", () => {
  it("should accept rating of 1 (minimum valid)", () => {
    const { valid } = validateFeedback({ rating: 1, type: "accuracy" });
    expect(valid).toBe(true);
  });

  it("should accept rating of 5 (maximum valid)", () => {
    const { valid } = validateFeedback({ rating: 5, type: "helpfulness" });
    expect(valid).toBe(true);
  });

  it("should reject rating of 0 (below minimum)", () => {
    const { valid, errors } = validateFeedback({ rating: 0, type: "accuracy" });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes("Rating"))).toBe(true);
  });

  it("should reject rating of 6 (above maximum)", () => {
    const { valid } = validateFeedback({ rating: 6, type: "accuracy" });
    expect(valid).toBe(false);
  });

  it("should reject rating of -1 (negative)", () => {
    const { valid } = validateFeedback({ rating: -1, type: "accuracy" });
    expect(valid).toBe(false);
  });

  it("should reject non-integer rating (float)", () => {
    const { valid } = validateFeedback({ rating: 3.5, type: "accuracy" });
    expect(valid).toBe(false);
  });

  it("should prevent form submission when rating is 0", () => {
    expect(isSubmitEnabled(0)).toBe(false);
  });

  it("should allow form submission for all valid ratings 1–5", () => {
    [1, 2, 3, 4, 5].forEach((r) => {
      expect(isSubmitEnabled(r)).toBe(true);
    });
  });
});

describe("Feedback Payload Validation — Type Field", () => {
  it("should accept type 'accuracy'", () => {
    const { valid } = validateFeedback({ rating: 3, type: "accuracy" });
    expect(valid).toBe(true);
  });

  it("should accept type 'improvement'", () => {
    const { valid } = validateFeedback({ rating: 3, type: "improvement" });
    expect(valid).toBe(true);
  });

  it("should accept type 'helpfulness'", () => {
    const { valid } = validateFeedback({ rating: 3, type: "helpfulness" });
    expect(valid).toBe(true);
  });

  it("should reject invalid type 'spam'", () => {
    const { valid } = validateFeedback({ rating: 3, type: "spam" });
    expect(valid).toBe(false);
  });

  it("should reject empty string type", () => {
    const { valid } = validateFeedback({ rating: 3, type: "" });
    expect(valid).toBe(false);
  });

  it("should reject numeric type", () => {
    const { valid } = validateFeedback({ rating: 3, type: 42 as any });
    expect(valid).toBe(false);
  });
});

describe("Feedback Payload Validation — Optional Fields", () => {
  it("should accept payload with no optional fields", () => {
    const { valid } = validateFeedback({ rating: 4, type: "accuracy" });
    expect(valid).toBe(true);
  });

  it("should accept comment up to 2000 characters", () => {
    const { valid } = validateFeedback({ rating: 4, type: "accuracy", comment: "A".repeat(2000) });
    expect(valid).toBe(true);
  });

  it("should reject comment exceeding 2000 characters", () => {
    const { valid } = validateFeedback({ rating: 4, type: "accuracy", comment: "A".repeat(2001) });
    expect(valid).toBe(false);
  });

  it("should accept page up to 256 characters", () => {
    const { valid } = validateFeedback({ rating: 4, type: "accuracy", page: "/chat" });
    expect(valid).toBe(true);
  });

  it("should reject page exceeding 256 characters", () => {
    const { valid } = validateFeedback({ rating: 4, type: "accuracy", page: "/".repeat(257) });
    expect(valid).toBe(false);
  });

  it("should accept userId up to 128 characters", () => {
    const { valid } = validateFeedback({ rating: 3, type: "helpfulness", userId: "uid_" + "x".repeat(124) });
    expect(valid).toBe(true);
  });

  it("should reject userId exceeding 128 characters", () => {
    const { valid } = validateFeedback({ rating: 3, type: "helpfulness", userId: "x".repeat(129) });
    expect(valid).toBe(false);
  });

  it("should accept null userId (anonymous user)", () => {
    const { valid } = validateFeedback({ rating: 3, type: "helpfulness", userId: null });
    expect(valid).toBe(true);
  });
});

describe("Feedback Payload Validation — Structural Rules", () => {
  it("should reject payload with more than 6 keys", () => {
    const { valid } = validateFeedback({
      rating: 3,
      type: "accuracy",
      comment: "ok",
      page: "/quiz",
      userId: "uid123",
      extraField1: "not allowed",
      extraField2: "also not allowed",
    });
    expect(valid).toBe(false);
  });

  it("should accept a full valid payload with 5 keys", () => {
    const { valid } = validateFeedback({
      rating: 5,
      type: "helpfulness",
      comment: "Very helpful!",
      page: "/chat",
      userId: "user_abc_123",
    });
    expect(valid).toBe(true);
  });

  it("should return all validation errors, not just the first", () => {
    const { errors } = validateFeedback({ rating: 0, type: "invalid_type" });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
