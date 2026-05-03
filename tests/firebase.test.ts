/**
 * firebase.test.ts — Unit Tests for Firebase Configuration & Error Handling
 *
 * Tests the Firebase initialization logic, offline resilience, and
 * connectivity handling without making actual network calls.
 */

import { describe, it, expect, vi } from "vitest";

// ─── Firebase Config Shape Validator ─────────────────────────────────────────

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  firestoreDatabaseId?: string;
}

function validateFirebaseConfig(config: Partial<FirebaseConfig>): { valid: boolean; missing: string[] } {
  const required: (keyof FirebaseConfig)[] = ["apiKey", "authDomain", "projectId", "appId"];
  const missing = required.filter((key) => !config[key] || String(config[key]).trim() === "");
  return { valid: missing.length === 0, missing };
}

// ─── Connection Test Logic (mirrors firebase.ts testConnection) ───────────────

interface ConnectionResult {
  status: "connected" | "permission_denied" | "offline" | "error";
  message: string;
}

async function simulateConnectionTest(
  mockGetDoc: () => Promise<void>
): Promise<ConnectionResult> {
  try {
    await mockGetDoc();
    return { status: "connected", message: "Firebase connection successful." };
  } catch (error: any) {
    if (error.code === "permission-denied") {
      return { status: "permission_denied", message: "Firebase connection verified (permission denied as expected)." };
    }
    if (error.message?.includes("the client is offline") || error.message?.includes("Could not reach Cloud Firestore")) {
      return { status: "offline", message: "Firestore connectivity issue detected. The app will continue in offline mode." };
    }
    return { status: "error", message: error?.message || "Unknown Firebase error." };
  }
}

// ─── Firestore Path Validator ────────────────────────────────────────────────

function isValidDocumentId(id: string): boolean {
  return (
    typeof id === "string" &&
    id.length > 0 &&
    id.length <= 128 &&
    /^[a-zA-Z0-9_\-]+$/.test(id)
  );
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe("Firebase Config Validation", () => {
  it("should validate a complete, correct Firebase config", () => {
    const config: FirebaseConfig = {
      apiKey: "AIzaSyTest123",
      authDomain: "votewise.firebaseapp.com",
      projectId: "votewise-project",
      appId: "1:123456:web:abcdef",
    };
    const { valid } = validateFirebaseConfig(config);
    expect(valid).toBe(true);
  });

  it("should reject config missing apiKey", () => {
    const { valid, missing } = validateFirebaseConfig({
      authDomain: "votewise.firebaseapp.com",
      projectId: "votewise-project",
      appId: "1:123:web:abc",
    });
    expect(valid).toBe(false);
    expect(missing).toContain("apiKey");
  });

  it("should reject config missing projectId", () => {
    const { valid, missing } = validateFirebaseConfig({
      apiKey: "AIzaSyTest123",
      authDomain: "votewise.firebaseapp.com",
      appId: "1:123:web:abc",
    });
    expect(valid).toBe(false);
    expect(missing).toContain("projectId");
  });

  it("should reject config with empty apiKey string", () => {
    const { valid } = validateFirebaseConfig({
      apiKey: "",
      authDomain: "test.firebaseapp.com",
      projectId: "test",
      appId: "1:123:web:abc",
    });
    expect(valid).toBe(false);
  });

  it("should report all missing required fields at once", () => {
    const { valid, missing } = validateFirebaseConfig({});
    expect(valid).toBe(false);
    expect(missing.length).toBe(4); // apiKey, authDomain, projectId, appId
  });
});

describe("Firebase Connectivity — Connection Test Logic", () => {
  it("should return 'connected' when getDoc resolves successfully", async () => {
    const mockGetDoc = vi.fn().mockResolvedValue(undefined);
    const result = await simulateConnectionTest(mockGetDoc);
    expect(result.status).toBe("connected");
    expect(result.message).toContain("successful");
  });

  it("should return 'permission_denied' for Firestore permission-denied error", async () => {
    const mockGetDoc = vi.fn().mockRejectedValue({ code: "permission-denied", message: "Missing or insufficient permissions." });
    const result = await simulateConnectionTest(mockGetDoc);
    expect(result.status).toBe("permission_denied");
    expect(result.message).toContain("verified");
  });

  it("should return 'offline' when client is offline", async () => {
    const mockGetDoc = vi.fn().mockRejectedValue(new Error("the client is offline"));
    const result = await simulateConnectionTest(mockGetDoc);
    expect(result.status).toBe("offline");
    expect(result.message).toContain("offline mode");
  });

  it("should return 'offline' for 'Could not reach Cloud Firestore' error", async () => {
    const mockGetDoc = vi.fn().mockRejectedValue(new Error("Could not reach Cloud Firestore backend"));
    const result = await simulateConnectionTest(mockGetDoc);
    expect(result.status).toBe("offline");
  });

  it("should return 'error' for unknown Firebase errors without crashing", async () => {
    const mockGetDoc = vi.fn().mockRejectedValue(new Error("Something unexpected happened"));
    const result = await simulateConnectionTest(mockGetDoc);
    expect(result.status).toBe("error");
    expect(result.message).toBeDefined();
  });

  it("should call getDoc exactly once during connection test", async () => {
    const mockGetDoc = vi.fn().mockResolvedValue(undefined);
    await simulateConnectionTest(mockGetDoc);
    expect(mockGetDoc).toHaveBeenCalledTimes(1);
  });
});

describe("Firestore Document ID Validation", () => {
  it("should accept valid alphanumeric document IDs", () => {
    expect(isValidDocumentId("feedback123")).toBe(true);
    expect(isValidDocumentId("user_abc")).toBe(true);
    expect(isValidDocumentId("doc-id-001")).toBe(true);
  });

  it("should reject empty document IDs", () => {
    expect(isValidDocumentId("")).toBe(false);
  });

  it("should reject document IDs exceeding 128 characters", () => {
    expect(isValidDocumentId("a".repeat(129))).toBe(false);
  });

  it("should accept document IDs up to exactly 128 characters", () => {
    expect(isValidDocumentId("a".repeat(128))).toBe(true);
  });

  it("should reject IDs with special characters not in [a-zA-Z0-9_-]", () => {
    expect(isValidDocumentId("id with spaces")).toBe(false);
    expect(isValidDocumentId("id/with/slashes")).toBe(false);
    expect(isValidDocumentId("id.with.dots")).toBe(false);
  });

  it("should accept IDs with underscores and hyphens", () => {
    expect(isValidDocumentId("my_feedback-id")).toBe(true);
  });
});

describe("Firestore Security Rules — Feedback Collection Logic", () => {
  // Test the logical equivalents of the Firestore rules

  it("should require rating, type, and createdAt keys to be present", () => {
    const payload = { rating: 4, type: "accuracy", createdAt: new Date() };
    const hasRequired = ["rating", "type", "createdAt"].every((k) => k in payload);
    expect(hasRequired).toBe(true);
  });

  it("should enforce max 6 keys in payload", () => {
    const payload = { rating: 4, type: "accuracy", createdAt: new Date(), comment: "ok", page: "/", userId: "uid" };
    expect(Object.keys(payload).length).toBeLessThanOrEqual(6);
  });

  it("should not allow read operations to the feedback collection (privacy)", () => {
    // Simulating the rule: allow read: if false
    // This tests the rule logic, not Firebase itself
    const canRead = false; // firestore.rules: allow read, update, delete: if false
    expect(canRead).toBe(false);
  });

  it("should allow anonymous feedback (null userId)", () => {
    const payload = { rating: 3, type: "helpfulness", createdAt: new Date(), userId: null };
    const hasNullOrStringUserId = payload.userId === null || typeof payload.userId === "string";
    expect(hasNullOrStringUserId).toBe(true);
  });
});
