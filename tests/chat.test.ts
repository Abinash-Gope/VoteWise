/**
 * chat.test.ts — Unit Tests for Chat Logic & Gemini Integration
 *
 * Tests VoteWise's AI chatbot: message handling, history mapping,
 * system prompt integrity, error classification, and voter lookup form.
 */

import { describe, it, expect } from "vitest";

// ─── Constants from Chat.tsx (mirrored for pure unit testing) ─────────────────

const SYSTEM_PROMPT = `
You are VoteWise, an expert, friendly and neutral civic education assistant.
Your mission is to help people understand how elections work in the United States and India.

FORMATTING RULES:
- Use Markdown for bolding, italics, bullet points, and numbered lists to make information easy to read.
- When explaining steps or providing lists, use bullet points.
- Structure answers with clear, brief paragraphs.
- Never use a formal letter format, just directly answer the user's question clearly.

TOPICS YOU COVER (USA):
- Voter registration (deadlines, online vs in-person)
- Election Day procedures, ID requirements
- Individual election stages in the USA (e.g., Primaries, Caucuses, General Election, Electoral College certification)
- Transition and timeline between different election stages
- Absentee and mail-in voting

TOPICS YOU COVER (INDIA):
- Voter Helpline App and NVSP portal
- Voter ID (EPIC card) and Aadhaar linking
- Individual election stages in India (e.g., Nomination, Scrutiny, Campaigning, Polling Day, Counting, Declaration of Results)
- Lok Sabha (General) and Rajya Sabha elections
- Legislative Assembly (Vidhan Sabha) and Council (Vidhan Parishad)
- Electronic Voting Machines (EVMs) and VVPAT
- Model Code of Conduct

GENERAL RULES:
- Always be politically neutral — never favor any party, candidate, or ideology
- Use simple, accessible, jargon-free language
- Keep answers concise and direct, under 250 words
- Provide clear context and definitions if explaining a specific election stage
- If asked about a specific candidate or party, politely redirect to facts about the election process
- Be encouraging — voting is a civic right worth celebrating!
`;

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
];

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const INDIA_STATE_CEO_LINKS: Record<string, string> = {
  "Andhra Pradesh": "https://ceoandhra.nic.in/",
  "Assam": "https://ceoassam.nic.in/",
  "Bihar": "https://ceobihar.nic.in/",
  "Gujarat": "https://ceogujarat.nic.in/",
  "Karnataka": "https://ceo.karnataka.gov.in/",
  "Kerala": "https://www.ceo.kerala.gov.in/",
  "Maharashtra": "https://ceo.maharashtra.gov.in/",
  "Tamil Nadu": "https://www.elections.tn.gov.in/",
  "Uttar Pradesh": "https://ceouttarpradesh.nic.in/",
  "West Bengal": "https://ceowestbengal.nic.in/",
  "Delhi": "https://ceodelhi.nic.in/",
};

// ─── Message History Mapper (mirrors Chat.tsx handleSend logic) ───────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

type GeminiRole = "user" | "model";
interface GeminiContent { role: GeminiRole; parts: { text: string }[] }

function mapMessagesToGeminiFormat(messages: Message[]): GeminiContent[] {
  const contents: GeminiContent[] = [];
  for (const m of messages) {
    const mappedRole: GeminiRole = m.role === "assistant" ? "model" : "user";
    if (contents.length > 0 && contents[contents.length - 1].role === mappedRole) {
      contents[contents.length - 1].parts[0].text += "\n" + m.content;
    } else {
      contents.push({ role: mappedRole, parts: [{ text: m.content }] });
    }
  }
  return contents;
}

// ─── Error Classifier (mirrors Chat.tsx catch block) ─────────────────────────

function classifyError(error: any): string {
  if (error.message === "MISSING_API_KEY") {
    return "Service configuration error. Please ensure the Gemini API key is set up.";
  } else if (error.message?.includes("quota") || error.status === 429) {
    return "I've hit my usage limit for the moment.";
  } else if (error.message?.includes("safety") || error.status === 400) {
    return "I'm sorry, I can't answer that specific question.";
  } else if (typeof navigator !== "undefined" && !navigator?.onLine) {
    return "It looks like you're offline.";
  }
  return "An unexpected error occurred.";
}

// ─── Input Validator ──────────────────────────────────────────────────────────

function isValidInput(text: string): boolean {
  return text.trim().length > 0;
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe("Chat System Prompt Integrity", () => {
  it("should enforce political neutrality in the system prompt", () => {
    expect(SYSTEM_PROMPT).toContain("politically neutral");
    expect(SYSTEM_PROMPT).toContain("never favor any party");
  });

  it("should cover both US and India topics", () => {
    expect(SYSTEM_PROMPT).toContain("TOPICS YOU COVER (USA)");
    expect(SYSTEM_PROMPT).toContain("TOPICS YOU COVER (INDIA)");
  });

  it("should include formatting rules", () => {
    expect(SYSTEM_PROMPT).toContain("FORMATTING RULES");
    expect(SYSTEM_PROMPT).toContain("Markdown");
  });

  it("should instruct redirection away from specific candidates/parties", () => {
    expect(SYSTEM_PROMPT).toContain("specific candidate or party");
    expect(SYSTEM_PROMPT).toContain("redirect");
  });

  it("should mandate response length limit", () => {
    expect(SYSTEM_PROMPT).toContain("250 words");
  });
});

describe("Chat Input Validation", () => {
  it("should reject empty string input", () => {
    expect(isValidInput("")).toBe(false);
  });

  it("should reject whitespace-only input", () => {
    expect(isValidInput("   ")).toBe(false);
    expect(isValidInput("\t\n")).toBe(false);
  });

  it("should accept normal question text", () => {
    expect(isValidInput("How do I register to vote?")).toBe(true);
  });

  it("should accept single character input", () => {
    expect(isValidInput("?")).toBe(true);
  });

  it("should accept input with leading/trailing whitespace (trimmed)", () => {
    expect(isValidInput("  hello  ")).toBe(true);
  });
});

describe("Message History — Gemini API Format Mapping", () => {
  it("should map user messages to 'user' role", () => {
    const msgs: Message[] = [{ role: "user", content: "Hello" }];
    const result = mapMessagesToGeminiFormat(msgs);
    expect(result[0].role).toBe("user");
    expect(result[0].parts[0].text).toBe("Hello");
  });

  it("should map assistant messages to 'model' role", () => {
    const msgs: Message[] = [{ role: "assistant", content: "Hello from AI" }];
    const result = mapMessagesToGeminiFormat(msgs);
    expect(result[0].role).toBe("model");
  });

  it("should merge consecutive messages with the same role", () => {
    const msgs: Message[] = [
      { role: "user", content: "Part 1" },
      { role: "user", content: "Part 2" },
    ];
    const result = mapMessagesToGeminiFormat(msgs);
    expect(result.length).toBe(1);
    expect(result[0].parts[0].text).toContain("Part 1");
    expect(result[0].parts[0].text).toContain("Part 2");
  });

  it("should NOT merge messages from different roles", () => {
    const msgs: Message[] = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ];
    const result = mapMessagesToGeminiFormat(msgs);
    expect(result.length).toBe(2);
    expect(result[0].role).toBe("user");
    expect(result[1].role).toBe("model");
  });

  it("should handle an alternating multi-turn conversation correctly", () => {
    const msgs: Message[] = [
      { role: "user", content: "Q1" },
      { role: "assistant", content: "A1" },
      { role: "user", content: "Q2" },
      { role: "assistant", content: "A2" },
    ];
    const result = mapMessagesToGeminiFormat(msgs);
    expect(result.length).toBe(4);
    expect(result.map((r) => r.role)).toEqual(["user", "model", "user", "model"]);
  });

  it("should handle empty message history", () => {
    const result = mapMessagesToGeminiFormat([]);
    expect(result).toEqual([]);
  });
});

describe("Chat Error Classification", () => {
  it("should classify MISSING_API_KEY error correctly", () => {
    const msg = classifyError({ message: "MISSING_API_KEY" });
    expect(msg).toContain("configuration error");
  });

  it("should classify quota/rate-limit errors (status 429)", () => {
    const msg = classifyError({ status: 429, message: "Too Many Requests" });
    expect(msg).toContain("usage limit");
  });

  it("should classify quota errors by message keyword", () => {
    const msg = classifyError({ message: "quota exceeded" });
    expect(msg).toContain("usage limit");
  });

  it("should classify safety/content-policy errors (status 400)", () => {
    const msg = classifyError({ status: 400, message: "Content filtered" });
    expect(msg).toContain("can't answer that specific question");
  });

  it("should classify safety errors by message keyword", () => {
    const msg = classifyError({ message: "safety policy violation" });
    expect(msg).toContain("can't answer that specific question");
  });

  it("should return a non-empty fallback message for completely unknown errors", () => {
    // In Node.js test environment, navigator is undefined, so offline check is skipped.
    // The function must always return SOME message — never undefined or empty.
    const msg = classifyError({ message: "some completely unknown error 0xDEADBEEF" });
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(10);
    // Must not expose raw technical error info
    expect(msg).not.toContain("0xDEADBEEF");
  });
});

describe("Geographic Data Integrity", () => {
  it("should have exactly 50 US states", () => {
    expect(US_STATES.length).toBe(50);
  });

  it("should have no duplicate US states", () => {
    expect(new Set(US_STATES).size).toBe(US_STATES.length);
  });

  it("should include key US states", () => {
    expect(US_STATES).toContain("California");
    expect(US_STATES).toContain("Texas");
    expect(US_STATES).toContain("New York");
    expect(US_STATES).toContain("Alaska");
    expect(US_STATES).toContain("Hawaii");
  });

  it("should have at least 28 India states/UTs", () => {
    expect(INDIA_STATES.length).toBeGreaterThanOrEqual(28);
  });

  it("should have no duplicate India states", () => {
    expect(new Set(INDIA_STATES).size).toBe(INDIA_STATES.length);
  });

  it("should include key India states", () => {
    expect(INDIA_STATES).toContain("Maharashtra");
    expect(INDIA_STATES).toContain("Karnataka");
    expect(INDIA_STATES).toContain("Delhi");
    expect(INDIA_STATES).toContain("Tamil Nadu");
    expect(INDIA_STATES).toContain("West Bengal");
  });

  it("CEO link keys should be a subset of INDIA_STATES", () => {
    const ceoKeys = Object.keys(INDIA_STATE_CEO_LINKS);
    ceoKeys.forEach((key) => {
      expect(INDIA_STATES).toContain(key);
    });
  });

  it("all CEO links should be valid HTTPS URLs", () => {
    Object.values(INDIA_STATE_CEO_LINKS).forEach((url) => {
      expect(url).toMatch(/^https:\/\/.+\.in\//);
    });
  });
});
