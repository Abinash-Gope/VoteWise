import express from "express";
import cors from "cors";
import axios from "axios";

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

export default app;
