# Google Cloud Functions Integration Guide

VoteWise is architected to support **Google Cloud Functions** as a serverless compute layer for its AI analysis and API endpoints. This document explains how to deploy the `analyze-trends` endpoint as a standalone Cloud Function.

---

## Overview

The `/api/analyze-trends` endpoint (powered by **Google Gemini AI**) is designed to be **Cloud Function-ready** — stateless, self-contained, and using only HTTP request/response objects. It currently runs as:

1. **Express route** in `server.ts` (local dev)
2. **Vercel Serverless Function** via `api/index.ts` (production)
3. **Google Cloud Function** via `cloud-functions/analyzeVotingTrends/` (GCP deployment)

---

## Architecture Diagram

```
User Browser
      │
      ▼
 VoteWise Frontend (Vite/React)
      │
      ├── POST /api/analyze-trends
      │         │
      │    ┌────┴──────────────────────────────────┐
      │    │  Deployment Target (choose one):       │
      │    │                                        │
      │    │  [Dev]    Express (server.ts)          │
      │    │  [Prod]   Vercel Serverless Function   │
      │    │  [GCP]    Google Cloud Function        │
      │    └────┬──────────────────────────────────┘
      │         │
      │    Uses Google Gemini AI API
      │    (gemini-2.0-flash model)
      │         │
      │    Returns civic engagement insights JSON
      │
      └── Firebase Firestore (feedback collection)
```

---

## Cloud Function Source Code

The Cloud Function handler is a direct port of the Express route, using Google's Functions Framework:

```typescript
// cloud-functions/analyzeVotingTrends/index.ts
import { http, HttpFunction } from "@google-cloud/functions-framework";
import { GoogleGenAI } from "@google/genai";

const FALLBACK_INSIGHTS = {
  summary: "Civic engagement analysis indicates strong interest in election education.",
  keyFindings: [
    "Quiz performance reflects growing awareness of electoral procedures.",
    "US election topics receive higher engagement.",
    "Voter registration is the most queried topic.",
    "Completed quiz users show 3x higher AI chatbot engagement.",
  ],
  recommendation: "Focus on absentee voting and Electoral College content.",
  engagementScore: 75,
  generatedBy: "static-fallback",
};

export const analyzeVotingTrends: HttpFunction = async (req, res) => {
  // CORS headers for browser requests
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { quizScore, totalQuestions, region, topicsExplored, sessionDuration } = req.body || {};
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return res.json({ insights: FALLBACK_INSIGHTS, isFallback: true });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const score = typeof quizScore === "number" ? quizScore : null;
    const total = typeof totalQuestions === "number" ? totalQuestions : null;
    const pct = score !== null && total ? Math.round((score / total) * 100) : null;

    const prompt = `You are a civic engagement analyst for VoteWise.
USER DATA: Region=${region || "US & India"}, Score=${score !== null ? `${score}/${total} (${pct}%)` : "N/A"}, Topics=${topicsExplored?.join(", ") || "General"}, Duration=${sessionDuration || "unknown"}min.
Return ONLY JSON: {"summary":"...","keyFindings":["...","...","..."],"recommendation":"...","engagementScore":75,"literacyLevel":"beginner|intermediate|advanced","nextStep":"..."}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 512, temperature: 0.3 },
    });

    const cleaned = (response.text || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return res.json({ insights: { ...parsed, generatedBy: "gemini-2.0-flash" }, isFallback: false });
  } catch (error: any) {
    console.error("[Cloud Function] Error:", error?.message);
    return res.json({ insights: { ...FALLBACK_INSIGHTS, generatedBy: "error-fallback" }, isFallback: true });
  }
};

http("analyzeVotingTrends", analyzeVotingTrends);
```

---

## Deployment Instructions

### Prerequisites

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### Deploy Command

```bash
gcloud functions deploy analyzeVotingTrends \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=./cloud-functions/analyzeVotingTrends \
  --entry-point=analyzeVotingTrends \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY \
  --memory=256MB \
  --timeout=30s
```

### Test the Deployed Function

```bash
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/analyzeVotingTrends \
  -H "Content-Type: application/json" \
  -d '{
    "quizScore": 8,
    "totalQuestions": 11,
    "region": "US",
    "topicsExplored": ["Electoral College", "Voter Registration"],
    "sessionDuration": 5
  }'
```

### Expected Response

```json
{
  "insights": {
    "summary": "Strong civic literacy demonstrated with 73% quiz accuracy...",
    "keyFindings": [
      "Electoral College understanding is above average.",
      "Voter registration is a key area of interest.",
      "US-focused content resonates strongly with this user."
    ],
    "recommendation": "Explore mail-in voting procedures next.",
    "engagementScore": 82,
    "literacyLevel": "intermediate",
    "nextStep": "Take the full quiz and use the Voter Lookup feature.",
    "generatedBy": "gemini-2.0-flash"
  },
  "isFallback": false
}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) |
| `GOOGLE_CIVIC_API_KEY` | Optional | Google Civic Information API key for voter lookup |

### Setting Secrets Securely

```bash
# Use Secret Manager instead of plain env vars for production
gcloud secrets create gemini-api-key --data-file=- <<< "$GEMINI_API_KEY"

gcloud functions deploy analyzeVotingTrends \
  --set-secrets "GEMINI_API_KEY=gemini-api-key:latest"
```

---

## Google Services Used in VoteWise

| Service | Usage | Status |
|---------|-------|--------|
| **Google Gemini AI** (`gemini-2.0-flash`) | Civic chatbot + Trend analysis | ✅ Active |
| **Google Civic Information API** | Voter lookup, officials data | ✅ Active |
| **Firebase Firestore** | User feedback storage | ✅ Active |
| **Firebase Auth** | Optional user identification | ✅ Configured |
| **Google Cloud Functions** | Serverless API endpoints | 🔄 Ready to Deploy |

---

## Local Testing

```bash
# Install Functions Framework
npm install --save-dev @google-cloud/functions-framework

# Run locally
npx functions-framework --target=analyzeVotingTrends --port=8080

# Test
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"region": "India", "quizScore": 5, "totalQuestions": 11}'
```
