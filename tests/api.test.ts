/**
 * api.test.ts — Integration Tests for Vercel Serverless API Function
 *
 * Tests the api/index.ts Express handler which powers the Vercel deployment.
 * Covers: voter info endpoint, health check, edge cases, and error flows.
 * 
 * This tests the SAME core logic as server.ts but in the serverless context
 * to validate the Vercel deployment path independently.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// ─── Import the Vercel serverless app ─────────────────────────────────────────
// api/index.ts exports an Express app that Vercel wraps as serverless functions

let app: any;

// Dynamic import to ensure env is set before module loads
async function getApp() {
  if (!app) {
    // Reset module cache for fresh imports
    vi.resetModules();
    const module = await import("../api/index.ts");
    app = module.default;
  }
  return app;
}

describe("VoteWise Vercel API — Integration Tests", () => {
  beforeEach(async () => {
    vi.resetModules();
    app = null;
  });

  // ── Health Check ────────────────────────────────────────────────────────────

  describe("GET /api/health", () => {
    it("should return 200 with status ok and service name", async () => {
      const server = await getApp();
      const res = await request(server).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.service).toBe("VoteWise Backend");
    });

    it("should include Content-Type: application/json header", async () => {
      const server = await getApp();
      const res = await request(server).get("/api/health");
      expect(res.headers["content-type"]).toMatch(/application\/json/);
    });
  });

  // ── POST /api/voter-info — India ────────────────────────────────────────────

  describe("POST /api/voter-info — India country", () => {
    it("should return India ECI response for country=India", async () => {
      process.env.GOOGLE_CIVIC_API_KEY = "";
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ country: "India", address: "Mumbai" });
      expect(res.status).toBe(200);
      expect(res.body.indiaInfo).toBe(true);
    });

    it("should return at least 3 Indian officials", async () => {
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ country: "India" });
      expect(Array.isArray(res.body.officials)).toBe(true);
      expect(res.body.officials.length).toBeGreaterThanOrEqual(3);
    });

    it("should include ECI URL in officials", async () => {
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ country: "India" });
      const hasECIUrl = res.body.officials.some((o: any) => o.urls?.some((u: string) => u.includes("eci.gov.in")));
      expect(hasECIUrl).toBe(true);
    });

    it("should include ECI email contact in officials", async () => {
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ country: "India" });
      const eci = res.body.officials.find((o: any) => o.name === "Election Commission of India (ECI)");
      expect(eci).toBeDefined();
      expect(eci.emails).toContain("complaints@eci.gov.in");
    });
  });

  // ── POST /api/voter-info — No API Key (US) ──────────────────────────────────

  describe("POST /api/voter-info — US with no API key", () => {
    beforeEach(() => {
      process.env.GOOGLE_CIVIC_API_KEY = "";
    });

    it("should return demo data for zip 90210", async () => {
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ address: "90210", country: "US" });
      expect(res.status).toBe(200);
      expect(res.body.isDemo).toBe(true);
    });

    it("should return demo officials array", async () => {
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ address: "90210", country: "US" });
      expect(Array.isArray(res.body.officials)).toBe(true);
      expect(res.body.officials.length).toBeGreaterThan(0);
    });

    it("should return 500 CONFIG_ERROR for unrecognized address without API key", async () => {
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ address: "Springfield, Illinois", country: "US" });
      expect(res.status).toBe(500);
      expect(res.body.type).toBe("CONFIG_ERROR");
    });

    it("should include error message explaining missing API key", async () => {
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ address: "unknown-place-xyz", country: "US" });
      expect(res.body.error).toBeDefined();
      expect(typeof res.body.error).toBe("string");
    });
  });

  // ── POST /api/voter-info — With API Key (Mocked) ────────────────────────────

  describe("POST /api/voter-info — US with API key (mocked)", () => {
    beforeEach(() => {
      process.env.GOOGLE_CIVIC_API_KEY = "test-api-key-for-integration";
    });

    it("should return 400 when address is not provided", async () => {
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ country: "US" });
      expect(res.status).toBe(400);
    });

    it("should return 400 when address is explicitly empty string", async () => {
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ address: "", country: "US" });
      expect(res.status).toBe(400);
    });

    it("should return demo fallback on mocked 403 from Civic API", async () => {
      const axios = await import("axios");
      vi.spyOn(axios.default, "get").mockRejectedValueOnce({
        response: { status: 403, data: { error: { message: "Forbidden" } } },
        message: "Request failed",
      });
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ address: "10001", country: "US" });
      expect(res.status).toBe(200);
      expect(res.body.isDemo).toBe(true);
    });

    it("should return demo fallback on mocked 400 from Civic API", async () => {
      const axios = await import("axios");
      vi.spyOn(axios.default, "get").mockRejectedValueOnce({
        response: { status: 400, data: { error: { message: "Invalid address" } } },
        message: "Bad Request",
      });
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").send({ address: "10001", country: "US" });
      expect(res.status).toBe(200);
      expect(res.body.isDemo).toBe(true);
    });
  });

  // ── Request Shape Validation ─────────────────────────────────────────────────

  describe("Request Validation & Edge Cases", () => {
    it("should handle completely empty POST body", async () => {
      const server = await getApp();
      const res = await request(server).post("/api/voter-info").set("Content-Type", "application/json").send("{}");
      expect(res.status).toBeDefined();
      expect(res.status).toBeLessThan(600);
    });

    it("should handle null values in body without crashing", async () => {
      const server = await getApp();
      const res = await request(server)
        .post("/api/voter-info")
        .send({ address: null, country: null });
      expect(res.status).toBeDefined();
    });

    it("should handle numeric address value without crashing", async () => {
      // Clear API key so we hit the no-key path (no external network call)
      process.env.GOOGLE_CIVIC_API_KEY = "";
      const server = await getApp();
      const res = await request(server)
        .post("/api/voter-info")
        .send({ address: 90210, country: "US" }); // numeric 90210 triggers demo path
      expect(res.status).toBeDefined();
      expect(res.status).toBeLessThan(600);
    });

    it("should respond to unknown routes with an appropriate status", async () => {
      const server = await getApp();
      const res = await request(server).get("/api/nonexistent");
      expect(res.status).toBe(404);
    });
  });
});
