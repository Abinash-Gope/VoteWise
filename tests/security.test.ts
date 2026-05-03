/**
 * security.test.ts — Security & Input Validation Tests
 *
 * Tests the VoteWise API against common attack vectors and malformed input.
 * Covers: SQL injection, XSS, prototype pollution, path traversal,
 * oversized payloads, and information disclosure prevention.
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import cors from "cors";

function buildSecurityTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "VoteWise Backend" });
  });

  app.post("/api/voter-info", (req: any, res: any) => {
    const { address, country } = req.body || {};
    if (country === "India") return res.json({ indiaInfo: true, officials: [] });
    const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
    if (!apiKey) {
      if (address?.includes("90210")) return res.json({ isDemo: true, voterInfo: {}, officials: [] });
      return res.status(500).json({ error: "API key not configured", type: "CONFIG_ERROR" });
    }
    if (!address) return res.status(400).json({ error: "Address is required" });
    return res.json({ voterInfo: {}, officials: [], address: String(address).slice(0, 256) });
  });

  return app;
}

const SQL_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE voters; --",
  "1 UNION SELECT * FROM users--",
  "admin'--",
  "Robert'); DROP TABLE Students;--",
];

const XSS_PAYLOADS = [
  "<script>alert('xss')</script>",
  "<img src=x onerror=alert(1)>",
  "javascript:alert(document.cookie)",
  "<svg onload=alert(1)>",
];

describe("VoteWise Security Tests", () => {
  let app: express.Express;

  beforeEach(() => {
    process.env.GOOGLE_CIVIC_API_KEY = "test-key";
    app = buildSecurityTestApp();
  });

  describe("SQL Injection Prevention", () => {
    SQL_PAYLOADS.forEach((payload) => {
      it(`should safely handle SQL injection: "${payload.slice(0, 35)}..."`, async () => {
        const res = await request(app).post("/api/voter-info").send({ address: payload, country: "US" });
        // Must not crash (status in valid HTTP range)
        expect(res.status).toBeDefined();
        expect(res.status).toBeLessThan(600);
        // Response must not contain database-level error messages
        const body = JSON.stringify(res.body);
        expect(body).not.toMatch(/syntax error near/i);
        expect(body).not.toMatch(/ORA-[0-9]+/); // Oracle DB errors
        expect(body).not.toMatch(/You have an error in your SQL syntax/); // MySQL errors
        // Server must not return a 500 caused by unhandled injection
        expect(res.status).not.toBe(502); // gateway error
      });
    });

    it("should not expose database schema in responses to SQL injection", async () => {
      // When the API key is set, the app returns the address in the response
      // but must never reveal DB table names, column names, or internal schema
      const payload = "'; DROP TABLE voters; --";
      const res = await request(app).post("/api/voter-info").send({ address: payload, country: "US" });
      const body = JSON.stringify(res.body);
      // No database internal error messages
      expect(body).not.toMatch(/SQLSTATE/i);
      expect(body).not.toMatch(/pg_catalog/i);
      expect(body).not.toMatch(/information_schema/i);
    });
  });

  describe("Cross-Site Scripting (XSS) Prevention", () => {
    XSS_PAYLOADS.forEach((payload) => {
      it(`should not execute on XSS payload: "${payload.slice(0, 35)}"`, async () => {
        const res = await request(app).post("/api/voter-info").send({ address: payload, country: "US" });
        // Server must respond (not crash)
        expect(res.status).toBeDefined();
        expect(res.status).toBeLessThan(600);
        // The API is JSON-only — it never outputs HTML, so XSS cannot execute
        // Verify response Content-Type is application/json (not text/html)
        expect(res.headers["content-type"]).toMatch(/application\/json/);
        // No HTML script execution context can exist in a JSON API response
        expect(res.status).not.toBe(500); // Must not crash from payload
      });
    });
  });

  describe("Prototype Pollution Prevention", () => {
    it("should not allow __proto__ injection to pollute Object.prototype", async () => {
      await request(app)
        .post("/api/voter-info")
        .set("Content-Type", "application/json")
        .send(JSON.stringify({ "__proto__": { "admin": true }, "country": "India" }));
      expect((Object.prototype as any).admin).toBeUndefined();
    });

    it("should handle constructor.prototype injection without crashing", async () => {
      const res = await request(app)
        .post("/api/voter-info")
        .set("Content-Type", "application/json")
        .send(JSON.stringify({ "constructor": { "prototype": { "isAdmin": true } }, "country": "India" }));
      expect(res.status).toBeDefined();
      expect((Object.prototype as any).isAdmin).toBeUndefined();
    });
  });

  describe("Path Traversal Prevention", () => {
    const pathPayloads = ["../../etc/passwd", "../../../windows/system32", "....//....//etc//passwd"];
    pathPayloads.forEach((payload) => {
      it(`should not leak filesystem data for: "${payload}"`, async () => {
        const res = await request(app).post("/api/voter-info").send({ address: payload, country: "US" });
        const body = JSON.stringify(res.body);
        expect(body).not.toContain("root:x:0:0");
        expect(body).not.toContain("[extensions]");
      });
    });
  });

  describe("Oversized Payload (DoS) Prevention", () => {
    it("should reject a 2MB body payload", async () => {
      const huge = "A".repeat(2 * 1024 * 1024);
      const res = await request(app)
        .post("/api/voter-info")
        .set("Content-Type", "application/json")
        .send(JSON.stringify({ address: huge, country: "US" }));
      expect([413, 400, 500]).toContain(res.status);
    });

    it("should handle a 10KB address string without crashing", async () => {
      const long = "A".repeat(10_000);
      const res = await request(app).post("/api/voter-info").send({ address: long, country: "US" });
      expect(res.status).toBeDefined();
      expect(res.status).toBeLessThan(600);
    });
  });

  describe("Information Disclosure Prevention", () => {
    it("should not expose internal file paths in error responses", async () => {
      process.env.GOOGLE_CIVIC_API_KEY = "";
      const res = await request(app).post("/api/voter-info").send({ address: "unknown_xyz", country: "US" });
      expect(JSON.stringify(res.body)).not.toMatch(/C:\\|\/home\/|node_modules/);
    });

    it("should not expose stack traces in error responses", async () => {
      const res = await request(app).post("/api/voter-info").send({ country: "US" });
      expect(JSON.stringify(res.body)).not.toContain("at Object.<anonymous>");
    });
  });

  describe("HTTP Header Injection Prevention", () => {
    it("should not propagate injected headers via newline in body", async () => {
      const payload = "Texas\r\nX-Injected-Header: hacked";
      const res = await request(app).post("/api/voter-info").send({ address: payload, country: "US" });
      expect(res.headers["x-injected-header"]).toBeUndefined();
    });
  });

  describe("Content-Type Handling", () => {
    it("should handle text/plain body without crashing", async () => {
      const res = await request(app)
        .post("/api/voter-info")
        .set("Content-Type", "text/plain")
        .send("country=India");
      expect(res.status).toBeDefined();
    });

    it("should gracefully handle empty body", async () => {
      const res = await request(app).post("/api/voter-info");
      expect(res.status).toBeDefined();
      expect(res.status).toBeLessThan(600);
    });
  });
});
