import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles, MapPin, Search, Phone, Mail, Globe, X, CheckCircle } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
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

const SYSTEM_PROMPT = `
You are VoteWise, a friendly and neutral civic education assistant.
Your mission is to help people of all ages understand how elections work.

TOPICS YOU COVER:
- Voter registration (deadlines, requirements, online vs in-person)
- Election Day procedures (polling stations, ID requirements, voting steps)
- Types of elections: primary, general, midterm, local, federal
- How votes are counted and results are certified
- The Electoral College: what it is and how it works
- Absentee and mail-in voting process
- Candidate nomination and primary process
- Campaign finance basics
- Election security and integrity
- Voting rights history and legislation
- Ballot initiatives and referendums
- How to find your polling place

RULES:
- Always be politically neutral — never favor any party, candidate, or ideology
- Use simple, jargon-free language accessible to first-time voters
- Keep answers under 150 words unless the user asks for more detail
- Use numbered lists for step-by-step processes
- Use bullet points for comparisons or lists of items
- Always offer to explain further at the end of your response
- If asked about a specific candidate or party, redirect to facts about the process
- Be encouraging — voting is a civic right worth celebrating
`;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm VoteWise, your AI election education assistant. How can I help you understand the voting process today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [isSearchingZip, setIsSearchingZip] = useState(false);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [voterInfo, setVoterInfo] = useState<VoterInfo | null>(null);
  const [lookupError, setLookupError] = useState("");
  
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
        throw new Error("GEMINI_API_KEY is not configured.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const history = messages.map(m => ({
        role: m.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: history.concat([{ role: "user", parts: [{ text }] }]),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          maxOutputTokens: 512,
        }
      });

      const reply = response.text || "I'm sorry, I couldn't generate a response.";
      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting to the AI service. Please make sure the API key is configured.",
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
      const response = await axios.post("/api/voter-info", { address: query });
      setOfficials(response.data.officials || []);
      setVoterInfo(response.data.voterInfo || null);
      
      if (!response.data.officials?.length && !response.data.voterInfo?.state?.length) {
        setLookupError("No specific information found for this location.");
      }
    } catch (err) {
      setLookupError("Could not find information for that location. Please try a more specific address.");
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
                <div className="whitespace-pre-wrap leading-relaxed">
                  {m.content}
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
              className="absolute inset-0 bg-[#1e3a8a]/20 backdrop-blur-sm z-20 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg md:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full md:h-auto md:max-h-[85vh] border border-[#e4e4f0]"
              >
                <div className="p-4 md:p-5 border-b border-[#e4e4f0] flex items-center justify-between bg-gray-50/80 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mr-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 tracking-tight">Voter Lookup</h3>
                  </div>
                  <button
                    onClick={() => setShowLookup(false)}
                    className="p-2 hover:bg-gray-200 rounded-xl transition-all"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="p-5 md:p-8 overflow-y-auto">
                  <div className="space-y-4 mb-8">
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                        Search by State
                      </label>
                      <div className="relative">
                        <select
                          value={selectedState}
                          onChange={(e) => handleStateSelect(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-[#e4e4f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-800"
                        >
                          <option value="">Select a State</option>
                          {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <X className="w-4 h-4 rotate-45" /> {/* Custom chevron feel */}
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <div className="w-full border-t border-gray-200"></div>
                        <span className="px-3 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap mx-auto">OR</span>
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="h-6"></div>
                    </div>

                    <form onSubmit={(e) => handleZipSearch(e)} className="flex flex-col">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                        Search by Zip or Address
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => {
                            setZipCode(e.target.value);
                            setSelectedState("");
                          }}
                          placeholder="e.g. 90210"
                          className="flex-grow px-4 py-3.5 bg-gray-50 border border-[#e4e4f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                        <button
                          type="submit"
                          disabled={isSearchingZip || !zipCode.trim()}
                          className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-[#1e3a8a] text-white rounded-xl shadow-lg shadow-blue-900/10 hover:bg-blue-800 disabled:opacity-50 transition-all active:scale-95"
                        >
                          {isSearchingZip ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        </button>
                      </div>
                    </form>
                  </div>

                  {lookupError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-6">
                      {lookupError}
                    </div>
                  )}

                  {/* State Help Links */}
                  {voterInfo?.state && voterInfo.state.length > 0 && (
                    <div className="mb-6 space-y-4">
                      <h4 className="text-sm font-bold text-gray-900 border-b pb-2">State-Level Resources ({voterInfo.state[0].name})</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {voterInfo.state[0].electionAdministrationBody?.electionInfoUrl && (
                          <a href={voterInfo.state[0].electionAdministrationBody.electionInfoUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                            <Globe className="w-4 h-4 mr-3" />
                            <span className="text-sm font-semibold">Official Election Website</span>
                          </a>
                        )}
                        {voterInfo.state[0].electionAdministrationBody?.electionRegistrationUrl && (
                          <a href={voterInfo.state[0].electionAdministrationBody.electionRegistrationUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center p-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors">
                            <CheckCircle className="w-4 h-4 mr-3" />
                            <span className="text-sm font-semibold">Register to Vote Online</span>
                          </a>
                        )}
                        {voterInfo.state[0].electionAdministrationBody?.absenteeVotingInfoUrl && (
                          <a href={voterInfo.state[0].electionAdministrationBody.absenteeVotingInfoUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center p-3 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors">
                            <Mail className="w-4 h-4 mr-3" />
                            <span className="text-sm font-semibold">Absentee/Mail-in Info</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Officials List */}
                  {officials.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-900 border-b pb-2">Local Election Officials</h4>
                      {officials.map((official, idx) => (
                        <div key={idx} className="p-4 border border-[#e4e4f0] rounded-xl bg-white shadow-sm">
                          <h5 className="font-bold text-gray-900 mb-2">{official.name}</h5>
                          <div className="space-y-2 text-sm text-gray-600">
                            {official.phones?.map(p => (
                              <div key={p} className="flex items-center">
                                <Phone className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                <span>{p}</span>
                              </div>
                            ))}
                            {official.emails?.map(e => (
                              <div key={e} className="flex items-center">
                                <Mail className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                <a href={`mailto:${e}`} className="hover:underline text-blue-600">{e}</a>
                              </div>
                            ))}
                            {official.urls?.map(u => (
                              <div key={u} className="flex items-center">
                                <Globe className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                <a href={u} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 truncate max-w-xs">{u}</a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isSearchingZip && officials.length === 0 && !voterInfo && !lookupError && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-blue-200" />
                      </div>
                      <p className="text-gray-500 text-sm">Select a state or enter your zip code to find registration links and contact info for election officials.</p>
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
