# VoteWise — Know Your Vote, Own Your Voice

VoteWise is an AI-powered election education assistant designed to help citizens understand the mechanics of voting, election cycles, and civic procedures through a friendly, factual, and neutral lens.

## Features

- **Ask VoteWise AI**: A non-partisan chatbot that answers any question about the election process using factual data.
- **Interactive Timeline**: A step-by-step journey through the 8 major stages of the U.S. Presidential election cycle.
- **Knowledge Quiz**: Test your civic literacy with an 8-question quiz on voting laws and procedures.
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
   - The app uses `GEMINI_API_KEY` for AI responses.
   - In Google AI Studio, this is automatically managed via the **Secrets** panel.
   - If running locally, add `GEMINI_API_KEY` to your `.env` file.

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

VoteWise covers key topics including:
- Voter registration requirements and deadlines.
- Election Day procedures and polling station info.
- The Electoral College and presidential nomination process.
- Vote counting, auditing, and certification.
- Voting rights history and ballot initiatives.
