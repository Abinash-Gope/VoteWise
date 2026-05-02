import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles, MapPin, Search, Phone, Mail, Globe, X, CheckCircle } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

interface Official {
  name: string;
  address?: { line1: string; city: string; state: string; zip: string }[];
  phones?: string[];
  emails?: string[];
  urls?: string[];
  photoUrl?: string;
}

interface VoterInfo {
  state?: {
    name: string;
    electionAdministrationBody?: {
      name?: string;
      electionInfoUrl?: string;
      electionRegistrationUrl?: string;
      electionRegistrationConfirmationUrl?: string;
      absenteeVotingInfoUrl?: string;
      votingLocationFinderUrl?: string;
      ballotInfoUrl?: string;
    };
  }[];
}

const INDIA_STATE_CEO_LINKS: Record<string, string> = {
  "Andhra Pradesh": "https://ceoandhra.nic.in/",
  "Arunachal Pradesh": "https://ceoarunachal.nic.in/",
  "Assam": "https://ceoassam.nic.in/",
  "Bihar": "https://ceobihar.nic.in/",
  "Chhattisgarh": "https://ceochhattisgarh.nic.in/",
  "Goa": "https://ceogoa.nic.in/",
  "Gujarat": "https://ceogujarat.nic.in/",
  "Haryana": "https://ceoharyana.gov.in/",
  "Himachal Pradesh": "https://ceohimachal.nic.in/",
  "Jharkhand": "https://ceojharkhand.nic.in/",
  "Karnataka": "https://ceo.karnataka.gov.in/",
  "Kerala": "https://www.ceo.kerala.gov.in/",
  "Madhya Pradesh": "https://ceomadhyapradesh.nic.in/",
  "Maharashtra": "https://ceo.maharashtra.gov.in/",
  "Manipur": "https://ceomanipur.nic.in/",
  "Meghalaya": "https://ceomeghalaya.nic.in/",
  "Mizoram": "https://ceomizoram.nic.in/",
  "Nagaland": "https://ceonagaland.nic.in/",
  "Odisha": "https://ceoodisha.nic.in/",
  "Punjab": "https://ceopunjab.nic.in/",
  "Rajasthan": "https://ceorajasthan.nic.in/",
  "Sikkim": "https://ceosikkim.nic.in/",
  "Tamil Nadu": "https://www.elections.tn.gov.in/",
  "Telangana": "https://ceotelangana.nic.in/",
  "Tripura": "https://ceotripura.nic.in/",
  "Uttar Pradesh": "https://ceouttarpradesh.nic.in/",
  "Uttarakhand": "https://ceouttarakhand.nic.in/",
  "West Bengal": "https://ceowestbengal.nic.in/",
  "Delhi": "https://ceodelhi.nic.in/",
  "Jammu and Kashmir": "https://ceojk.nic.in/",
  "Ladakh": "https://ceoladakh.nic.in/",
  "Puducherry": "https://ceopuducherry.py.gov.in/",
  "Chandigarh": "https://ceochandigarh.gov.in/",
  "Andaman and Nicobar Islands": "https://ceoandaman.nic.in/",
  "Lakshadweep": "https://ceolakshadweep.gov.in/"
};

const suggestionChips = [
  "How do I register to vote?",
  "What happens on Election Day?",
  "How are votes counted?",
  "What is the Electoral College?",
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", 
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

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

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm VoteWise, your AI election education assistant. How can I help you understand the voting process in the US or India today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [country, setCountry] = useState<"US" | "India">("US");
  const [zipCode, setZipCode] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [isSearchingZip, setIsSearchingZip] = useState(false);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [voterInfo, setVoterInfo] = useState<VoterInfo | null>(null);
  const [lookupError, setLookupError] = useState("");
  
  const [isDemoData, setIsDemoData] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages: Message[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("MISSING_API_KEY");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const rawHistory = messages.filter(m => !m.isError && m !== messages[0]);
      const fullMessages = [...rawHistory, { role: "user" as const, content: text }];
      
      const contents: { role: "user"|"model", parts: {text: string}[] }[] = [];
      for (const m of fullMessages) {
         const mappedRole = m.role === "assistant" ? "model" as const : "user" as const;
         if (contents.length > 0 && contents[contents.length - 1].role === mappedRole) {
             contents[contents.length - 1].parts[0].text += "\n" + m.content;
         } else {
             contents.push({ role: mappedRole, parts: [{ text: m.content }] });
         }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          maxOutputTokens: 512,
        }
      });

      const reply = response.text || "I'm sorry, I couldn't generate a response.";
      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      
      let errorMessage = "I'm sorry, I'm having trouble connecting to my knowledge base right now.";
      
      if (error.message === "MISSING_API_KEY") {
        errorMessage = "Service configuration error. Please ensure the Gemini API key is set up in the environment settings.";
      } else if (error.message?.includes("quota") || error.status === 429) {
        errorMessage = "I've hit my usage limit for the moment. Please wait a minute and try your question again.";
      } else if (error.message?.includes("safety") || error.status === 400) {
        errorMessage = "I'm sorry, I can't answer that specific question. My purpose is to provide factual, non-partisan information about voting processes and civic education.";
      } else if (!window.navigator.onLine) {
        errorMessage = "It looks like you're offline. Please check your internet connection and try again.";
      } else {
        errorMessage = "An unexpected error occurred. Please try refreshing the page or asking your question again in a moment.";
      }

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: errorMessage,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipSearch = async (e?: React.FormEvent, searchAddress?: string) => {
    if (e) e.preventDefault();
    const query = searchAddress || zipCode || selectedState;
    if (!query.trim()) return;

    setIsSearchingZip(true);
    setLookupError("");
    setOfficials([]);
    setVoterInfo(null);

    try {
      const response = await axios.post("/api/voter-info", { address: query, country });
      setOfficials(response.data.officials || []);
      setVoterInfo(response.data.voterInfo || null);
      setIsDemoData(!!response.data.isDemo);
      
      if (!response.data.officials?.length && !response.data.voterInfo?.state?.length && !response.data.indiaInfo) {
        setLookupError("We couldn't find specific officials or ballot info for that location. Some local data might be unavailable for this specific region.");
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      
      if (err.response?.status === 403) {
        setLookupError("API access is forbidden. Please verify the Google Civic Information API is enabled and the key is valid in the platform settings.");
      } else if (errorData?.type === "CONFIG_ERROR") {
        setLookupError("The Civic API key is not configured. Please set GOOGLE_CIVIC_API_KEY in the environment secrets.");
      } else if (err.response?.status === 404) {
        setLookupError("This address wasn't recognized. Please double-check your zip code or try searching by State instead.");
      } else if (!window.navigator.onLine) {
        setLookupError("Network error. Please check your internet connection and try searching again.");
      } else {
        setLookupError("The voter information service is currently unavailable. You can try again in a few minutes or visit USA.gov for standard voting info.");
      }
    } finally {
      setIsSearchingZip(false);
    }
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setZipCode("");
    handleZipSearch(undefined, state);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            Ask VoteWise <Sparkles className="ml-2 w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-0.5 md:mt-1 font-medium italic">Neutral, factual civic guidance.</p>
        </div>
        
        <button
          onClick={() => setShowLookup(true)}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-white border border-[#e4e4f0] rounded-xl text-sm font-bold text-[#1e3a8a] shadow-sm hover:bg-blue-50 transition-all active:scale-95"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Voter Lookup
        </button>
      </div>

      <div className="flex-grow bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-[#e4e4f0] overflow-hidden flex flex-col relative">
        {/* Chat Messages */}
        <div
          ref={scrollRef}
          className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6 scroll-smooth"
        >
          {messages.map((m, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index % 5 * 0.05 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] md:max-w-[80%] rounded-2xl md:rounded-3xl p-4 md:p-5 relative shadow-sm ${
                  m.role === "user"
                    ? "bg-[#1e3a8a] text-white rounded-tr-none"
                    : "bg-blue-50/50 text-gray-800 border border-blue-100/50 rounded-tl-none font-sans"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="flex items-center mb-1 space-x-1">
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      VoteWise AI
                    </span>
                  </div>
                )}
                <div className="leading-relaxed">
                  {m.role === "assistant" ? (
                    <div className="markdown-body">
                      <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-blue-50/50 text-gray-800 border border-blue-100/50 rounded-2xl rounded-tl-none p-4 w-full max-w-[280px] md:max-w-[320px] shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex space-x-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                        className="w-2 h-2 bg-blue-600 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-blue-700 tracking-tight">VoteWise is thinking...</span>
                </div>
                {/* Simulated Polished Progress Bar */}
                <div className="h-1 w-full bg-blue-200/50 rounded-full overflow-hidden relative">
                  <motion.div
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-y-0 w-1/3 bg-blue-600 opacity-60 blur-[1px]"
                    style={{ left: 0 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-3.5 bg-gray-50/50 border-t border-[#e4e4f0] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="flex-shrink-0 px-4 py-2 bg-white border border-[#e4e4f0] rounded-full text-[11px] md:text-xs font-bold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#e4e4f0]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about elections..."
              className="flex-grow px-4 py-3 bg-gray-50 border border-[#e4e4f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-[#1e3a8a] text-white rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50 transition-all flex items-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            AI can make mistakes. Always verify with official local election offices.
          </p>
        </div>

        {/* Local Lookup Modal/Overlay */}
        <AnimatePresence>
          {showLookup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1e3a8a]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[85vh] border border-[#e4e4f0]"
              >
                <div className="p-5 md:p-6 border-b border-[#e4e4f0] flex items-center justify-between bg-gray-50/80 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-100 flex items-center justify-center mr-4">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 tracking-tighter text-lg md:text-xl leading-none">Voter Lookup</h3>
                      <p className="text-[10px] md:text-xs font-bold text-blue-600/70 uppercase tracking-widest mt-1">Official Resources</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLookup(false)}
                    className="p-3 hover:bg-gray-200 rounded-2xl transition-all active:scale-90"
                  >
                    <X className="w-7 h-7 text-gray-400 hover:text-gray-900" />
                  </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-8 scroll-smooth">
                  <div>
                    <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8">
                      {(["US", "India"] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setCountry(c);
                            setSelectedState("");
                            setZipCode("");
                            setVoterInfo(null);
                            setOfficials([]);
                            setLookupError("");
                          }}
                          className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
                            country === c ? "bg-white text-[#1e3a8a] shadow-sm" : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-3 ml-1 opacity-50">
                          Search by {country === "US" ? "State" : "State/UT"}
                        </label>
                        <div className="relative group">
                          <select
                            value={selectedState}
                            onChange={(e) => handleStateSelect(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-[#e4e4f0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-bold text-gray-800 transition-all cursor-pointer hover:bg-white"
                          >
                            <option value="">Select a {country === "US" ? "State" : "State/UT"}</option>
                            {(country === "US" ? US_STATES : INDIA_STATES).map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-600 transition-colors">
                            <Search className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      <div className="relative py-2">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                          <div className="w-full border-t border-gray-200"></div>
                          <span className="px-4 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap mx-auto">OR</span>
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="h-6"></div>
                      </div>

                      <form onSubmit={(e) => handleZipSearch(e)} className="flex flex-col">
                        <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-3 ml-1 opacity-50">
                          {country === "US" ? "Search by Zip or Address" : "Search by Pin Code or District"}
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => {
                              setZipCode(e.target.value);
                              setSelectedState("");
                            }}
                            placeholder={country === "US" ? "e.g. 90210" : "e.g. 110001"}
                            className="flex-grow px-5 py-4 bg-gray-50 border-2 border-[#e4e4f0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-gray-800 placeholder:text-gray-300 transition-all"
                          />
                          <button
                            type="submit"
                            disabled={isSearchingZip || !zipCode.trim()}
                            className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-[#1e3a8a] text-white rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-blue-800 disabled:opacity-50 transition-all active:scale-95"
                          >
                            {isSearchingZip ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                          </button>
                        </div>
                        {country === "US" && !process.env.GOOGLE_CIVIC_API_KEY && (
                          <div className="mt-3 flex flex-wrap gap-2 ml-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Example:</span>
                            <button 
                              type="button"
                              onClick={() => { setZipCode("90210"); handleZipSearch(undefined, "90210"); }}
                              className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              90210 (Beverly Hills)
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>

                  {isDemoData && (
                    <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl text-[10px] text-amber-700 font-black uppercase tracking-widest flex items-center shadow-sm">
                      <Sparkles className="w-4 h-4 mr-3 text-amber-500 shrink-0" />
                      Notice: Showing Demo Data (API Key not configured)
                    </div>
                  )}

                  {lookupError && (
                    <div className="p-5 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-bold shadow-sm leading-relaxed">
                      {lookupError}
                    </div>
                  )}

                  {/* India Specific Info */}
                  {country === "India" && selectedState && !lookupError && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 border-b-2 border-gray-100 pb-3">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Resources for {selectedState}</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer" 
                           className="flex items-center p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all font-black text-sm group">
                          <Globe className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" />
                          <span>ECI Voter Service Portal</span>
                        </a>
                        {INDIA_STATE_CEO_LINKS[selectedState] && (
                          <a href={INDIA_STATE_CEO_LINKS[selectedState]} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all font-black text-sm group">
                            <Globe className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" />
                            <span>State CEO Website</span>
                          </a>
                        )}
                        <a href="https://voterportal.eci.gov.in/" target="_blank" rel="noopener noreferrer" 
                           className="flex items-center p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all font-black text-sm group">
                          <CheckCircle className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" />
                          <span>Register as a New Voter</span>
                        </a>
                        <a href="https://wheredoivote.in/" target="_blank" rel="noopener noreferrer" 
                           className="flex items-center p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 hover:bg-rose-100 transition-all font-black text-sm group">
                          <MapPin className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" />
                          <span>Find Polling Station</span>
                        </a>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4 px-2 leading-relaxed opacity-70">
                        * Data provided by the Election Commission of India (ECI).
                      </p>
                    </div>
                  )}

                  {/* State Help Links */}
                  {voterInfo?.state && voterInfo.state.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 border-b-2 border-gray-100 pb-3">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">{voterInfo.state[0].name} Resources</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {voterInfo.state[0].electionAdministrationBody?.electionInfoUrl && (
                          <a href={voterInfo.state[0].electionAdministrationBody.electionInfoUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all font-black text-sm group">
                            <Globe className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" />
                            <span>Official Election Website</span>
                          </a>
                        )}
                        {voterInfo.state[0].electionAdministrationBody?.electionRegistrationUrl && (
                          <a href={voterInfo.state[0].electionAdministrationBody.electionRegistrationUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all font-black text-sm group">
                            <CheckCircle className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" />
                            <span>Register to Vote</span>
                          </a>
                        )}
                        {voterInfo.state[0].electionAdministrationBody?.absenteeVotingInfoUrl && (
                          <a href={voterInfo.state[0].electionAdministrationBody.absenteeVotingInfoUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center p-4 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all font-black text-sm group">
                            <Mail className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" />
                            <span>Absentee / Mail-in Info</span>
                          </a>
                        )}
                        <a 
                          href={voterInfo.state[0].electionAdministrationBody?.votingLocationFinderUrl || "https://www.vote.org/polling-place-locator/"} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 hover:bg-rose-100 transition-all font-black text-sm group"
                        >
                          <MapPin className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" />
                          <span>Polling Place Finder</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Officials List */}
                  {officials.length > 0 && (
                    <div className="space-y-5">
                      <div className="flex items-center space-x-2 border-b-2 border-gray-100 pb-3">
                        <User className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Local Election Officials</h4>
                      </div>
                      <div className="space-y-4">
                        {officials.map((official, idx) => (
                          <div key={idx} className="p-5 md:p-6 border-2 border-[#e4e4f0] rounded-2xl bg-white shadow-sm hover:border-blue-200 transition-colors">
                            <h5 className="font-black text-gray-900 text-lg mb-4 tracking-tight">{official.name}</h5>
                            <div className="space-y-3">
                              {official.phones?.map(p => (
                                <div key={p} className="flex items-center group">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Phone className="w-4 h-4" />
                                  </div>
                                  <span className="font-bold text-gray-700">{p}</span>
                                </div>
                              ))}
                              {official.emails?.map(e => (
                                <div key={e} className="flex items-center group">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <a href={`mailto:${e}`} className="font-bold text-blue-600 hover:underline break-all">{e}</a>
                                </div>
                              ))}
                              {official.urls?.map(u => (
                                <div key={u} className="flex items-center group">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                                    <Globe className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <a href={u} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline truncate hover:text-blue-800">{u}</a>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isSearchingZip && officials.length === 0 && !voterInfo && !lookupError && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPin className="w-10 h-10 text-blue-200" />
                      </div>
                      <h4 className="font-black text-gray-900 mb-2 uppercase tracking-widest text-xs">Ready to Search</h4>
                      <p className="text-gray-400 text-sm font-medium px-8 max-w-sm mx-auto leading-relaxed">Select a state or enter your zip code to find official registration links and contact information.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
