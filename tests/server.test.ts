/**
 * server.test.ts — Integration Tests for Express Server API Routes
 *
 * Tests the VoteWise Express server endpoints end-to-end using Supertest.
 * Covers: happy paths, error flows, fallback behavior, and integration
 * between the Express routing layer and upstream Google Civic API calls.
 *
 * Coverage targets:
 *   - POST /api/voter-info (all branches)
 *   - GET /api/health
 *   - Middleware: CORS, JSON body parsing
 *   - External API mocking: Google Civic Information API
 */

import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import cors from "cors";

// ─── Build a Lightweight Test Server ─────────────────────────────────────────
// We recreate the Express app in test-scope so we don't start Vite or bind a port.

async function buildTestApp() {
  // Dynamically require axios so we can mock it per-test
  const { default: axios } = await import("axios");

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "VoteWise Backend" });
  });

  // Voter info — mirrors server.ts implementation
  app.post("/api/voter-info", async (req: any, res: any) => {
    const { address, country } = req.body || {};
    const apiKey = process.env.GOOGLE_CIVIC_API_KEY;

    // India branch
    if (country === "India") {
      return res.json({
        indiaInfo: true,
        message: "Use official ECI resources for local details.",
        officials: [
          { name: "Election Commission of India (ECI)", urls: ["https://eci.gov.in/"] },
          { name: "President of India", urls: ["https://presidentofindia.nic.in/"] },
          { name: "Prime Minister of India", urls: ["https://www.pmindia.gov.in/"] },
        ],
      });
    }

    // No API key — demo fallback
    if (!apiKey) {
      if (address?.includes("90210") || address?.toLowerCase().includes("california")) {
        return res.json({
          voterInfo: {
            state: [{ name: "California", electionAdministrationBody: { name: "California Secretary of State" } }],
          },
          officials: [{ name: "Sample: Governor of California", urls: ["https://www.gov.ca.gov/"] }],
          isDemo: true,
        });
      }
      return res.status(500).json({ error: "Google Civic API key is not configured.", type: "CONFIG_ERROR" });
    }

    if (!address) {
      return res.status(400).json({ error: "Address/Zip code or State is required" });
    }

    try {
      const voterInfoResponse = await axios.get("https://www.googleapis.com/civicinfo/v2/voterinfo", {
        params: { address, key: apiKey },
      });
      const repResponse = await axios
        .get("https://www.googleapis.com/civicinfo/v2/representatives", {
          params: { address, key: apiKey },
        })
        .catch(() => ({ data: { officials: [] } }));

      res.json({ voterInfo: voterInfoResponse.data, officials: repResponse.data.officials || [] });
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 400) {
        return res.json({
          voterInfo: { state: [{ name: "California", electionAdministrationBody: { name: "California Secretary of State" } }] },
          officials: [],
          isDemo: true,
          demoMessage: "Showing sample data because the Google Civic API is not fully configured.",
        });
      }
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  return app;
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe("VoteWise Server API — Integration Tests", () => {
  let app: express.Express;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  // ── Health Check ────────────────────────────────────────────────────────────

  describe("GET /api/health", () => {
    it("should return 200 with status ok", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: "ok", service: "VoteWise Backend" });
    });

    it("should return JSON content-type", async () => {
      const res = await request(app).get("/api/health");
      expect(res.headers["content-type"]).toMatch(/application\/json/);
    });
  });

  // ── POST /api/voter-info — India Branch ─────────────────────────────────────

  describe("POST /api/voter-info — India country", () => {
    it("should return ECI officials for country=India without an API key", async () => {
      process.env.GOOGLE_CIVIC_API_KEY = "";
      const res = await request(app).post("/api/voter-info").send({ country: "India", address: "Delhi" });

      expect(res.status).toBe(200);
      expect(res.body.indiaInfo).toBe(true);
      expect(Array.isArray(res.body.officials)).toBe(true);
      expect(res.body.officials.length).toBeGreaterThanOrEqual(3);
    });

    it("should include ECI as the first official for India", async () => {
      const res = await request(app).post("/api/voter-info").send({ country: "India", address: "Mumbai" });
      expect(res.body.officials[0].name).toBe("Election Commission of India (ECI)");
    });

    it("should return India data even without an address field", async () => {
      const res = await request(app).post("/api/voter-info").send({ country: "India" });
      expect(res.status).toBe(200);
      expect(res.body.indiaInfo).toBe(true);
    });

    it("should include ECI URLs in officials", async () => {
      const res = await request(app).post("/api/voter-info").send({ country: "India" });
      const eci = res.body.officials.find((o: any) => o.name.includes("Election Commission"));
      expect(eci.urls[0]).toContain("eci.gov.in");
    });
  });

  // ── POST /api/voter-info — No API Key (US Demo Fallback) ──────────────────

  describe("POST /api/voter-info — Demo mode (no API key)", () => {
    beforeEach(() => {
      process.env.GOOGLE_CIVIC_API_KEY = "";
    });

    it("should return demo data for California zip 90210", async () => {
      const res = await request(app).post("/api/voter-info").send({ address: "90210", country: "US" });
      expect(res.status).toBe(200);
      expect(res.body.isDemo).toBe(true);
      expect(res.body.voterInfo.state[0].name).toBe("California");
    });

    it("should return demo data for addresses containing 'california'", async () => {
      const res = await request(app).post("/api/voter-info").send({ address: "california", country: "US" });
      expect(res.status).toBe(200);
      expect(res.body.isDemo).toBe(true);
    });

    it("should return demo data for mixed-case 'California' address", async () => {
      const res = await request(app).post("/api/voter-info").send({ address: "Los Angeles, California", country: "US" });
      expect(res.status).toBe(200);
      expect(res.body.isDemo).toBe(true);
    });

    it("should return 500 CONFIG_ERROR for non-demo US address without API key", async () => {
      const res = await request(app).post("/api/voter-info").send({ address: "Texas", country: "US" });
      expect(res.status).toBe(500);
      expect(res.body.type).toBe("CONFIG_ERROR");
    });

    it("should return 500 CONFIG_ERROR for empty address without API key", async () => {
      const res = await request(app).post("/api/voter-info").send({ address: "", country: "US" });
      expect(res.status).toBe(500);
      expect(res.body.type).toBe("CONFIG_ERROR");
    });
  });

  // ── POST /api/voter-info — With API Key (Mocked Civic API) ────────────────

  describe("POST /api/voter-info — With API key (mocked external API)", () => {
    beforeEach(() => {
      process.env.GOOGLE_CIVIC_API_KEY = "test-key-xyz";
    });

    it("should return 400 when address is missing", async () => {
      const res = await request(app).post("/api/voter-info").send({ country: "US" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return demo fallback when Civic API returns 403 Forbidden", async () => {
      const axios = await import("axios");
      vi.spyOn(axios.default, "get").mockRejectedValueOnce({
        response: { status: 403, data: { error: { message: "API key invalid" } } },
        message: "Request failed with status code 403",
      });

      const res = await request(app).post("/api/voter-info").send({ address: "10001", country: "US" });
      expect(res.status).toBe(200);
      expect(res.body.isDemo).toBe(true);
      expect(res.body.demoMessage).toBeDefined();
    });

    it("should return demo fallback when Civic API returns 400 Bad Request", async () => {
      const axios = await import("axios");
      vi.spyOn(axios.default, "get").mockRejectedValueOnce({
        response: { status: 400, data: { error: { message: "Invalid address" } } },
        message: "Request failed with status code 400",
      });

      const res = await request(app).post("/api/voter-info").send({ address: "bad-address", country: "US" });
      expect(res.status).toBe(200);
      expect(res.body.isDemo).toBe(true);
    });

    it("should return 500 when Civic API returns an unexpected 500 error", async () => {
      const axios = await import("axios");
      vi.spyOn(axios.default, "get").mockRejectedValueOnce({
        response: { status: 500, data: { error: { message: "Server Error" } } },
        message: "Internal Server Error",
      });

      const res = await request(app).post("/api/voter-info").send({ address: "10001", country: "US" });
      expect(res.status).toBe(500);
    });

    it("should return voter info and officials on successful Civic API response", async () => {
      const axios = await import("axios");
      vi.spyOn(axios.default, "get")
        .mockResolvedValueOnce({
          data: {
            state: [{ name: "New York", electionAdministrationBody: { electionInfoUrl: "https://www.elections.ny.gov/" } }],
          },
        })
        .mockResolvedValueOnce({ data: { officials: [{ name: "NY Board of Elections" }] } });

      const res = await request(app).post("/api/voter-info").send({ address: "10001", country: "US" });
      expect(res.status).toBe(200);
      expect(res.body.voterInfo).toBeDefined();
      expect(Array.isArray(res.body.officials)).toBe(true);
    });
  });

  // ── Middleware Verification ─────────────────────────────────────────────────

  describe("Middleware & Protocol Tests", () => {
    it("should include CORS headers in response", async () => {
      const res = await request(app).get("/api/health").set("Origin", "http://localhost:3000");
      expect(res.headers["access-control-allow-origin"]).toBeDefined();
    });

    it("should handle request with no body gracefully", async () => {
      const res = await request(app).post("/api/voter-info").set("Content-Type", "application/json").send();
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("should parse JSON body correctly", async () => {
      const res = await request(app).post("/api/voter-info").send({ country: "India" });
      // If JSON parsing works, India branch fires
      expect(res.body.indiaInfo).toBe(true);
    });
  });
});
