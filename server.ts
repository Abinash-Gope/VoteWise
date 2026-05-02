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
    const { address } = req.body;
    const apiKey = process.env.GOOGLE_CIVIC_API_KEY || "AIzaSyBtK5r79iH6C9um-FPy-zIxZMdlmMD2QtU";

    if (!address) {
      return res.status(400).json({ error: "Address/Zip code or State is required" });
    }

    try {
      // First, try voterinfo for general state/election rules
      const voterInfoResponse = await axios.get("https://www.googleapis.com/civicinfo/v2/voterinfo", {
        params: {
          address,
          key: apiKey,
          // Use a recent election ID if available, or it defaults to the next relevant one
        },
      });

      // Also get representatives for specific local officials
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
    } catch (error) {
      console.error("Civic API Error:", error);
      res.status(500).json({ error: "Could not find election information for that location." });
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
