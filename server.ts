import express from "express";
import cors from "cors";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

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
      console.error("Civic API Error:", error.response?.data || error.message);
      
      if (error.response?.status === 403) {
        return res.status(403).json({ 
          error: "API access forbidden. Please check your API key.",
          type: "FORBIDDEN"
        });
      }

      res.status(500).json({ error: "Could not find election information." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VoteWise server running on http://localhost:${PORT}`);
  });
}

startServer();
