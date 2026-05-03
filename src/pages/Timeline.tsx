import { useState } from "react";
import { 
  Megaphone, 
  Users, 
  Flag, 
  Tv, 
  UserCheck, 
  CheckCircle2, 
  Scale, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const usStages = [
  {
    label: "Candidates Announce",
    timing: "12–18 months before",
    icon: Megaphone,
    description: "Individuals interested in running for office officially declare their candidacy. This stage involves fundraising, building campaign teams, and traveling the country to gain visibility.",
    keyFacts: [
      "Filing paperwork with the FEC",
      "Drafting primary policy platforms",
      "Securing early donor support",
      "Official launch speeches"
    ]
  },
  {
    label: "Primary Elections",
    timing: "Feb–Jun, election year",
    icon: Users,
    description: "Voters from each party determine who will represent the party in the general election. This is where delegates are allocated to candidates based on voting results.",
    keyFacts: [
      "Open vs Closed primaries",
      "Caucuses in some states",
      "Super Tuesday impact",
      "Delegate count benchmarks"
    ]
  },
  {
    label: "Party Conventions",
    timing: "Jul–Aug, election year",
    icon: Flag,
    description: "Each major party holds a massive convention to officially nominate their candidate for President and Vice President. The party 'platform' is also formally adopted here.",
    keyFacts: [
      "Roll-call delegate voting",
      "VP nominee announcement",
      "Prime-time keynote speeches",
      "Party platform finalization"
    ]
  },
  {
    label: "General Campaign",
    timing: "Aug–Nov, election year",
    icon: Tv,
    description: "The official nominees from all parties compete for the general vote. This stage is marked by national debates, focused campaigning in swing states, and heavy advertising.",
    keyFacts: [
      "Presidential debates",
      "Whistle-stop tours",
      "Focus on swing states",
      "Heavy volunteer mobilization"
    ]
  },
  {
    label: "Voter Registration",
    timing: "Deadlines vary by state",
    icon: UserCheck,
    description: "Citizens must ensure they are registered to vote according to their state laws. Deadlines range from 30 days before the election to same-day registration in some areas.",
    keyFacts: [
      "Online, mail, or in-person",
      "Update home address",
      "ID requirements verification",
      "Same-day registration options"
    ]
  },
  {
    label: "Election Day",
    timing: "1st Tue after 1st Mon in Nov",
    icon: CheckCircle2,
    description: "The culmination of the election cycle. Millions of Americans cast their ballots at polling stations, via secret ballot. Absentee and early voting ballots are also collected.",
    keyFacts: [
      "Secret ballot protection",
      "Fixed federal timing",
      "Poll watcher oversight",
      "Accessibility accommodations"
    ]
  },
  {
    label: "Vote Counting",
    timing: "Days to weeks after",
    icon: Scale,
    description: "Ballots are tabulated securely by local officials. While preliminary results are often available quickly, the official certification process takes longer to ensure accuracy.",
    keyFacts: [
      "Provisional ballot review",
      "Signature verification",
      "Post-election audits",
      "Final state certification"
    ]
  },
  {
    label: "Inauguration",
    timing: "January 20th",
    icon: ShieldCheck,
    description: "The President-elect is officially sworn into office, marking the peaceful transfer of power. This ceremony takes place at the U.S. Capitol in Washington, D.C.",
    keyFacts: [
      "Oath of office taken",
      "Peaceful transfer of power",
      "Inaugural address",
      "Transition of leadership"
    ]
  }
];

const indiaStages = [
  {
    label: "Notification",
    timing: "45-60 days before Poll",
    icon: Megaphone,
    description: "The President (for Lok Sabha) or Governor (for Vidhan Sabha) issues the official election notification on the advice of the Election Commission.",
    keyFacts: [
      "Official gazette notification",
      "Model Code of Conduct starts",
      "Election dates announced",
      "Preparation of Voter Rolls"
    ]
  },
  {
    label: "Nominations",
    timing: "8-10 days period",
    icon: UserCheck,
    description: "Candidates file their nomination papers and security deposits. Each candidate must provide affidavits regarding assets, criminal cases, and education.",
    keyFacts: [
      "Filing before Return Officer",
      "Deposit of security fee",
      "Disclosure of personal details",
      "Proposer requirements"
    ]
  },
  {
    label: "Scrutiny & Withdrawal",
    timing: "2-3 days following",
    icon: ShieldCheck,
    description: "Returning Officers examine nominations for validity. Candidates have a window to withdraw their names if they change their mind.",
    keyFacts: [
      "Validation of affidavits",
      "Rejection of invalid forms",
      "Final list of contestants",
      "Allocation of symbols"
    ]
  },
  {
    label: "Campaign Period",
    timing: "Minimum 14 days",
    icon: Users,
    description: "Political parties and candidates campaign to win votes. This is governed by strict rules on spending and public conduct.",
    keyFacts: [
      "Public rallies and manifestos",
      "Door-to-door campaigning",
      "Strict Code of Conduct oversight",
      "Campaigning stops 48h before poll"
    ]
  },
  {
    label: "Poll Day",
    timing: "Phased over several weeks",
    icon: CheckCircle2,
    description: "Millions of voters cast their ballots using Electronic Voting Machines (EVMs). VVPAT machines allow voters to verify their vote visually.",
    keyFacts: [
      "Use of EVMs and VVPATs",
      "Polling station management",
      "Indelible ink application",
      "Security by observers"
    ]
  },
  {
    label: "Counting & Results",
    timing: "Fixed date for all phases",
    icon: Scale,
    description: "Ballots/EVMs are counted at secure locations. The Election Commission declares the winner for each constituency.",
    keyFacts: [
      "Counting of postal ballots",
      "EVM tabulation under surveillance",
      "Result declaration certificates",
      "VVPAT slip matching (random)"
    ]
  }
];

export default function Timeline() {
  const [currentStage, setCurrentStage] = useState(0);
  const [region, setRegion] = useState<"US" | "India">("US");
  const navigate = useNavigate();
  
  const stages = region === "US" ? usStages : indiaStages;
  const stage = stages[currentStage] || stages[0];

  // Reset stage when switching region
  const handleRegionChange = (newRegion: "US" | "India") => {
    setRegion(newRegion);
    setCurrentStage(0);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-8">
      <div className="mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 md:mb-6 tracking-tighter">The Election Journey</h1>
        
        <div className="inline-flex p-1 bg-gray-100 rounded-2xl mb-8">
          {(["US", "India"] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRegionChange(r)}
              className={`px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                region === r ? "bg-[#1e3a8a] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {r === "US" ? "United States" : "India"}
            </button>
          ))}
        </div>

        <p className="text-gray-500 font-medium max-w-lg mx-auto">
          Explore the major stages of the {region === "US" ? "U.S. Presidential" : "Indian General"} election cycle.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 md:mb-16">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
              <stage.icon className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs md:text-sm font-bold text-blue-900 uppercase tracking-widest">
              Stage {currentStage + 1} <span className="text-gray-400 font-normal">/ {stages.length}</span>
            </span>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            {Math.round(((currentStage + 1) / stages.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Stage Dots - Horizontal Scroll on Mobile */}
      <div className="relative mb-8 md:mb-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2 hidden md:block" />
        <div className="flex overflow-x-auto no-scrollbar md:justify-between pb-4 md:pb-0 gap-4 md:gap-0 snap-x">
          {stages.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStage(idx)}
              className={`flex-shrink-0 snap-center relative z-10 w-12 h-12 md:w-10 md:h-10 rounded-2xl md:rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                idx < currentStage
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : idx === currentStage
                  ? "bg-[#1e3a8a] border-[#1e3a8a] text-white ring-4 ring-blue-100 scale-110 shadow-lg shadow-blue-900/20"
                  : "bg-white border-gray-200 text-gray-400 hover:border-blue-300"
              }`}
            >
              <span className="text-sm md:text-xs font-bold">{idx + 1}</span>
              <div className="absolute top-14 md:top-12 left-1/2 -translate-x-1/2 w-max max-w-[100px] text-center hidden md:block">
                <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${idx === currentStage ? "text-[#1e3a8a]" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-10 border border-[#e4e4f0] shadow-2xl shadow-blue-900/5"
        >
          <div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="flex items-center space-x-4 md:space-x-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
                  <stage.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">{stage.label}</h2>
                  <span className="inline-flex items-center mt-1 md:mt-2 px-2.5 py-1 md:px-3 bg-amber-50 text-amber-700 text-[10px] md:text-xs font-bold rounded-full tracking-wider uppercase border border-amber-100">
                    <ShieldCheck className="w-3 h-3 mr-1.5" />
                    {stage.timing}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-10 leading-relaxed max-w-3xl">
              {stage.description}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 md:gap-4 mb-8">
              {stage.keyFacts.map((fact, i) => (
                <div key={i} className="flex items-start bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 hover:bg-white hover:shadow-md transition-all group">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm md:text-base text-gray-700 font-medium">{fact}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-6 pt-6 md:pt-8 border-t border-gray-100">
            <div className="flex space-x-3 order-2 md:order-1 w-full md:w-auto">
              <button
                disabled={currentStage === 0}
                onClick={() => setCurrentStage(currentStage - 1)}
                className="flex-1 md:flex-none p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all active:scale-95"
                title="Previous Stage"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 mx-auto" />
              </button>
              <button
                disabled={currentStage === stages.length - 1}
                onClick={() => setCurrentStage(currentStage + 1)}
                className="flex-1 md:flex-none p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all active:scale-95"
                title="Next Stage"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 mx-auto" />
              </button>
            </div>
            
            <button
              onClick={() => navigate("/chat", { state: { initialMessage: `Tell me more about the '${stage.label}' stage of the election.` } })}
              className="w-full md:w-auto px-8 py-4 bg-[#1e3a8a] text-white rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center shadow-lg shadow-blue-900/20 order-1 md:order-2 active:scale-95"
            >
              <MessageCircle className="w-5 h-5 mr-2.5" />
              Ask AI specifics
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
