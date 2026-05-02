# VoteWise — Know Your Vote, Own Your Voice

VoteWise is an AI-powered election education assistant designed to help citizens understand the mechanics of voting, election cycles, and civic procedures through a friendly, factual, and neutral lens.

## Hackathon Overview

### Chosen Vertical
**Civic Technology / Election Education / Governance**
Our focus is on empowering citizens with verified, accessible, and non-partisan voting information, reducing the barrier to civic participation.

### Approach and Logic
The goal was to build a comprehensive, unbiased platform that makes civic education engaging and easy to understand. We identified that many potential voters find election procedures overwhelming. Our approach breaks this down into four logical pillars:
1. **Conversational AI**: A non-partisan chatbot that answers specific queries dynamically.
2. **Interactive Education**: A visual timeline of election cycles to provide structural understanding.
3. **Gamification**: A knowledge quiz to test and reinforce civic literacy.
4. **Actionable Utility**: A voter lookup tool to instantly connect users with official resources and representatives.

By combining Gemini AI's natural language processing with official data feeds, we ensure users get accurate, context-aware information without partisan bias.

### How the Solution Works
VoteWise is a full-stack application:
- **Frontend**: Built with React, Vite, and Tailwind CSS, featuring interactive components heavily utilizing `motion/react` for smooth transitions.
- **Backend & AI**: An Express Node.js server proxies requests to the **Google Gemini API** (`@google/genai`) for the conversational chatbot. The system prompt strictly enforces neutrality and factual responses.
- **Data Integrations**: We integrate the **Google Civic Information API** to fetch real-time voter information, polling locations, and local officials based on the user's address. 
- **Resilience**: The backend includes intelligent fallbacks—if the Civic API errors out or encounters quota limits, the app seamlessly serves demonstrational data so the user experience is never broken.

### Assumptions Made
- **Neutrality is Key**: We assume users prefer a completely objective, non-partisan source of truth for election mechanics.
- **Geographic Focus**: While the app aims to be globally educational, the primary data integrations and timelines currently focus on the **United States** (via Civic API) and **India** (via structured ECI links).
- **API Availability**: We assume users have a stable internet connection. We also gracefully handle scenarios where the Google Civic API might be unconfigured or restricted by using fallback demo data.

---

## Features

- **Ask VoteWise AI**: A non-partisan chatbot that answers any question about the election process using factual data.
- **Interactive Timeline**: A step-by-step journey through the election cycles of the U.S. and India.
- **Knowledge Quiz**: Test your civic literacy with questions on voting laws and procedures for multiple regions.
- **Voter Lookup**: Find official registration links, state officials, and polling stations based on your location.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Motion (Animations), Lucide React (Icons), Axios.
- **Backend**: Node.js, Express, Google Gemini AI (via @google/genai).
- **Architecture**: Full-stack Express with Vite Middleware for a seamless development experience.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Keys**:
   - The app requires `GEMINI_API_KEY` for AI responses.
   - It optionally uses `GOOGLE_CIVIC_API_KEY` for real-time voter lookups.
   - If running locally, add these to your `.env` file.

3. **Run the Application**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Scripts

- `npm run dev`: Starts the Express server with Vite middleware on port 3000.
- `npm run build`: Builds the production-ready static assets.
- `npm run start`: Starts the production server.
- `npm run lint`: Checks for TypeScript errors.

## Content Coverage

VoteWise covers key topics across the US and India, including:
- Voter registration requirements, deadlines, and official State CEO links.
- Election Day procedures, EVM/VVPAT info (India), and polling station locators.
- Presidential nomination processes and Lok Sabha/Vidhan Sabha cycles.
- Official contact info for local election officials and election commissions.
- Voting rights history and historical constitutional amendments.
