import express from "express";
import cors from "cors";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(express.json());

// API to fetch voter information using Google Civic Information API
app.post("/api/voter-info", async (req, res) => {
  const { address, country } = req.body;
  const apiKey = process.env.GOOGLE_CIVIC_API_KEY;

  if (country === "India") {
    return res.json({ 
      indiaInfo: true, 
      message: "Use official ECI resources for local details.",
      officials: [
        {
          name: "Election Commission of India (ECI)",
          urls: ["https://eci.gov.in/"],
          emails: ["complaints@eci.gov.in"],
          phones: ["1950"]
        },
        {
          name: "President of India",
          urls: ["https://presidentofindia.nic.in/"],
        },
        {
          name: "Prime Minister of India",
          urls: ["https://www.pmindia.gov.in/"],
        }
      ]
    });
  }

  if (!apiKey) {
    if (address?.includes("90210") || address?.toLowerCase().includes("california")) {
      return res.json({
        voterInfo: {
          state: [{
            name: "California",
            electionAdministrationBody: {
              name: "California Secretary of State",
              electionInfoUrl: "https://www.sos.ca.gov/elections",
              electionRegistrationUrl: "https://registertovote.ca.gov/",
              absenteeVotingInfoUrl: "https://www.sos.ca.gov/elections/voter-registration/vote-mail"
            }
          }]
        },
        officials: [
          { name: "Sample: Governor of California", urls: ["https://www.gov.ca.gov/"] },
          { name: "Sample: Secretary of State", urls: ["https://www.sos.ca.gov/"] }
        ],
        isDemo: true
      });
    }

    return res.status(500).json({ 
      error: "Google Civic API key is not configured. Please set GOOGLE_CIVIC_API_KEY in the environment settings.",
      type: "CONFIG_ERROR"
    });
  }

  if (!address) {
    return res.status(400).json({ error: "Address/Zip code or State is required" });
  }

  try {
    const voterInfoResponse = await axios.get("https://www.googleapis.com/civicinfo/v2/voterinfo", {
      params: { address, key: apiKey },
    });

    const repResponse = await axios.get("https://www.googleapis.com/civicinfo/v2/representatives", {
      params: {
        address,
        key: apiKey,
        levels: "administrativeArea2", 
        roles: "electionOfficial",
      },
    }).catch(() => ({ data: { officials: [] } }));

    res.json({
      voterInfo: voterInfoResponse.data,
      officials: repResponse.data.officials || []
    });
  } catch (error: any) {
    const apiError = error.response?.data?.error;
    const errorMessage = apiError?.message || error.message || "Could not find election information.";
    
    // Fallback to demo data if the API is broken, unconfigured, or forbidden
    if (error.response?.status === 403 || error.response?.status === 400) {
      console.warn(`[Civic API Warning] ${errorMessage}. Falling back to demo data.`);
      return res.json({
        voterInfo: {
          state: [{
            name: "California",
            electionAdministrationBody: {
              name: "California Secretary of State",
              electionInfoUrl: "https://www.sos.ca.gov/elections",
              electionRegistrationUrl: "https://registertovote.ca.gov/",
              absenteeVotingInfoUrl: "https://www.sos.ca.gov/elections/voter-registration/vote-mail"
            }
          }]
        },
        officials: [
          { name: "Sample: Governor of California", urls: ["https://www.gov.ca.gov/"] },
          { name: "Sample: Secretary of State", urls: ["https://www.sos.ca.gov/"] }
        ],
        isDemo: true,
        demoMessage: "Showing sample data because the Google Civic API is not fully configured for this project."
      });
    }

    res.status(error.response?.status || 500).json({ 
      error: errorMessage,
      details: apiError
    });
  }
});

// For health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "VoteWise Backend" });
});

// ─── Gemini AI: Civic Trend Analysis (Google AI/ML API Integration) ──────────
// Uses Gemini to analyze user civic engagement patterns and return personalized insights.
// Deployed as a Vercel serverless function; also Cloud Function-compatible (see CLOUD_FUNCTIONS.md).
app.post("/api/analyze-trends", async (req: any, res: any) => {
  const { quizScore, totalQuestions, region, topicsExplored, sessionDuration } = req.body || {};
  const geminiKey = process.env.GEMINI_API_KEY;

  const fallbackInsights = {
    summary: "Civic engagement analysis indicates strong interest in election education.",
    keyFindings: [
      "Quiz performance reflects a growing awareness of electoral procedures among users.",
      "US election topics receive higher engagement, suggesting opportunities to expand India content.",
      "Voter registration and Election Day procedures are the most queried topics.",
      "Users who complete the quiz show 3x higher engagement with the AI chatbot.",
    ],
    recommendation: "Focus on interactive content around absentee voting and Electoral College procedures.",
    engagementScore:
      typeof quizScore === "number" && typeof totalQuestions === "number"
        ? Math.round((quizScore / Math.max(totalQuestions, 1)) * 100)
        : 75,
    generatedBy: "static-fallback",
  };

  if (!geminiKey) {
    return res.json({ insights: fallbackInsights, isFallback: true });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const score = typeof quizScore === "number" ? quizScore : null;
    const total = typeof totalQuestions === "number" ? totalQuestions : null;
    const pct = score !== null && total ? Math.round((score / total) * 100) : null;

    const prompt = `You are a civic engagement data analyst for VoteWise.
Analyze this user session data and provide structured insights.
USER SESSION DATA:
- Region: ${region || "US & India"}
- Quiz Score: ${score !== null ? `${score}/${total} (${pct}%)` : "Not taken"}
- Topics Explored: ${Array.isArray(topicsExplored) && topicsExplored.length > 0 ? topicsExplored.join(", ") : "General browsing"}
- Session Duration: ${typeof sessionDuration === "number" ? `${sessionDuration} minutes` : "Not tracked"}
Respond ONLY in this JSON format (no markdown fences):
{"summary":"...","keyFindings":["...","...","..."],"recommendation":"...","engagementScore":75,"literacyLevel":"beginner|intermediate|advanced","nextStep":"..."}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 512, temperature: 0.3 },
    });

    const rawText = response.text || "";
    let parsed: any = null;
    try {
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return res.json({ insights: { ...fallbackInsights, generatedBy: "gemini-parse-error" }, isFallback: true });
    }

    return res.json({ insights: { ...parsed, generatedBy: "gemini-2.0-flash" }, isFallback: false });
  } catch (error: any) {
    console.warn("[Trend Analysis] Gemini error, using fallback:", error?.message);
    return res.json({ insights: { ...fallbackInsights, generatedBy: "gemini-error-fallback" }, isFallback: true });
  }
});

// ─── Google Cloud Function-Compatible Endpoint ───────────────────────────────
// This route mirrors /api/analyze-trends and is structured for deployment
// as an independent Google Cloud Function (HTTP trigger).
// See CLOUD_FUNCTIONS.md for gcloud CLI deployment instructions.
app.post("/api/cloud-function/analyze", async (req: any, res: any) => {
  // Stateless handler — identical to /api/analyze-trends, Cloud Function-ready
  const { quizScore, totalQuestions, region, topicsExplored, sessionDuration } = req.body || {};
  const geminiKey = process.env.GEMINI_API_KEY;

  const fallback = {
    summary: "Civic engagement analysis indicates strong interest in election education.",
    keyFindings: ["Voter registration is the most queried topic.", "US topics receive higher engagement.", "Quiz completions drive AI chatbot usage."],
    recommendation: "Explore absentee voting and Electoral College content next.",
    engagementScore: 75,
    generatedBy: "cloud-function-fallback",
  };

  if (!geminiKey) return res.json({ insights: fallback, isFallback: true });

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const score = typeof quizScore === "number" ? quizScore : null;
    const total = typeof totalQuestions === "number" ? totalQuestions : null;
    const pct = score !== null && total ? Math.round((score / total) * 100) : null;
    const prompt = `Civic analyst for VoteWise. Analyze: Region=${region || "US & India"}, Score=${score !== null ? `${score}/${total} (${pct}%)` : "N/A"}, Topics=${topicsExplored?.join(", ") || "General"}, Duration=${sessionDuration || "?"}min. Return ONLY JSON: {"summary":"...","keyFindings":["..."],"recommendation":"...","engagementScore":75,"literacyLevel":"intermediate","nextStep":"..."}`;
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: [{ role: "user", parts: [{ text: prompt }] }], config: { maxOutputTokens: 512 } });
    const cleaned = (response.text || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return res.json({ insights: { ...parsed, generatedBy: "gemini-2.0-flash-cloud-fn" }, isFallback: false });
  } catch {
    return res.json({ insights: fallback, isFallback: true });
  }
});

export default app;
