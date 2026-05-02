import { useState } from "react";
import { Trophy, CheckCircle, XCircle, ArrowRight, RefreshCcw, HelpCircle, GraduationCap, MessageCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const quizData = [
  {
    question: "When is Election Day in the US?",
    options: [
      "The first Monday in November",
      "November 1st",
      "First Tuesday after the first Monday in November",
      "The second Tuesday of November"
    ],
    correctIndex: 2,
    explanation: "Since 1845, federal law has fixed Election Day as the first Tuesday after the first Monday in November.",
    link: "https://www.usa.gov/election-day",
    linkText: "USA.gov: Election Day"
  },
  {
    question: "What is the minimum voting age in the US?",
    options: ["16 years old", "18 years old", "21 years old", "Graduation from high school"],
    correctIndex: 1,
    explanation: "The 26th Amendment, ratified in 1971, lowered the minimum voting age from 21 to 18.",
    link: "https://www.usa.gov/who-can-vote",
    linkText: "USA.gov: Who Can Vote"
  },
  {
    question: "What is the Electoral College?",
    options: [
      "A university where you learn about politics",
      "A group of electors who formally elect the President",
      "The physical building where Congress meets",
      "The list of candidates on the ballot"
    ],
    correctIndex: 1,
    explanation: "The Electoral College consists of 538 electors who cast the final ballots that determine the President and Vice President.",
    link: "https://www.usa.gov/electoral-college",
    linkText: "USA.gov: Electoral College"
  },
  {
    question: "What is a primary election?",
    options: [
      "The first election ever held in a state",
      "An election only for elementary school students",
      "An election to choose a party's candidate for the general election",
      "The final election of the year"
    ],
    correctIndex: 2,
    explanation: "Primaries allow party members to vote for their preferred candidate to represent the party on the general ballot.",
    link: "https://www.usa.gov/primaries-caucuses",
    linkText: "USA.gov: Primaries and Caucuses"
  },
  {
    question: "How many senators does each US state have?",
    options: ["Based on population", "1", "2", "4"],
    correctIndex: 2,
    explanation: "Regardless of size or population, every US state is constitutionally represented by exactly 2 senators.",
    link: "https://www.senate.gov/senators/index.htm",
    linkText: "Senate.gov: About Senators"
  },
  {
    question: "What is an absentee ballot?",
    options: [
      "A ballot that is ignored by officials",
      "A ballot cast by a candidate who is absent",
      "A ballot cast by mail or early when a voter can't get to the polls",
      "A ballot used only in local elections"
    ],
    correctIndex: 2,
    explanation: "Absentee voting allows voters to participate without being physically present at a polling station on Election Day.",
    link: "https://www.usa.gov/absentee-voting",
    linkText: "USA.gov: Absentee Voting"
  },
  {
    question: "Which amendment guarantees the right to vote regardless of race?",
    options: ["1st Amendment", "15th Amendment", "19th Amendment", "2th Amendment"],
    correctIndex: 1,
    explanation: "The 15th Amendment, ratified in 1870, prohibits federal or state governments from denying a citizen the right to vote based on race.",
    link: "https://www.archives.gov/founding-docs/amendment-15",
    linkText: "Archives.gov: 15th Amendment"
  },
  {
    question: "How long is a US Presidential term?",
    options: ["2 years", "4 years", "6 years", "8 years"],
    correctIndex: 1,
    explanation: "The President serves a 4-year term and is limited to two terms by the 22nd Amendment.",
    link: "https://www.usa.gov/presidents",
    linkText: "USA.gov: About the President"
  }
];

export default function Quiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === quizData[currentQ].correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < quizData.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
    } else {
      setIsComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setIsComplete(false);
    setScore(0);
  };

  if (isComplete) {
    const percentage = (score / quizData.length) * 100;
    let message = "";
    let Icon = Trophy;
    let colorClass = "text-amber-500 bg-amber-50";

    if (percentage === 100) {
      message = "Incredible! You're a true champion of democracy. Your knowledge of the process is exceptional.";
      Icon = Trophy;
      colorClass = "text-amber-500 bg-amber-50";
    } else if (percentage >= 70) {
      message = "Impressive work! You have a solid grasp of how elections function. Ready for the polls?";
      Icon = GraduationCap;
      colorClass = "text-blue-500 bg-blue-50";
    } else {
      message = "A good start! Democracy is complex, and learning is a journey. Explore more to master the process.";
      Icon = HelpCircle;
      colorClass = "text-gray-500 bg-gray-50";
    }

    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 text-center border border-[#e4e4f0] shadow-2xl shadow-blue-900/5 overflow-hidden relative"
        >
          <div className="relative z-10">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`w-28 h-28 md:w-36 md:h-36 ${colorClass} rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-xl`}
            >
              <Icon className="w-14 h-14 md:w-20 md:h-20" />
            </motion.div>
            
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tighter transition-all">
              {percentage === 100 ? "Perfect Score!" : "Journey Complete!"}
            </h1>
            
            <div className="flex flex-col items-center mb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Final Accuracy</span>
              <p className="text-6xl md:text-8xl font-black text-[#1e3a8a] tracking-tighter">
                {score}<span className="text-2xl md:text-4xl text-gray-300 mx-2">/</span>{quizData.length}
              </p>
            </div>
            
            <p className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed max-w-xl mx-auto font-medium opacity-80">
              {message}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={resetQuiz}
                className="flex-1 sm:flex-none flex items-center justify-center px-10 py-5 border-2 border-[#1e3a8a] text-[#1e3a8a] rounded-2xl font-black text-base hover:bg-blue-50 transition-all active:scale-95"
              >
                <RefreshCcw className="w-5 h-5 mr-3" />
                Try Again
              </button>
              <Link
                to="/chat"
                className="flex-1 sm:flex-none flex items-center justify-center px-10 py-5 bg-[#1e3a8a] text-white rounded-2xl font-black text-base hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                Ask Follow-ups
              </Link>
            </div>
          </div>
          
          {/* Decorative Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full translate-x-32 -translate-y-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-x-32 translate-y-32 blur-3xl" />
        </motion.div>
      </div>
    );
  }

  const q = quizData[currentQ];

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 md:px-0">
      <div className="mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mr-3">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block">Civic Knowledge</span>
              <span className="text-xs font-bold text-indigo-600">Question {currentQ + 1} of {quizData.length}</span>
            </div>
          </div>
          <div className="flex space-x-1.5 self-center">
            {quizData.map((_, i) => (
              <motion.div 
                key={i} 
                initial={false}
                animate={{
                  backgroundColor: i < currentQ ? "#10b981" : i === currentQ ? "#2563eb" : "#f3f4f6",
                  scale: i === currentQ ? 1.2 : 1
                }}
                className="h-1.5 w-6 rounded-full" 
              />
            ))}
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">
          {q.question}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 mb-8">
        {q.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = q.correctIndex === idx;
          const showColors = selectedAnswer !== null;

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.98 }}
              disabled={showColors}
              onClick={() => handleAnswerSelect(idx)}
              className={`w-full text-left p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center justify-between ${
                showColors
                  ? isCorrect
                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-lg shadow-emerald-900/5 ring-4 ring-emerald-100"
                    : isSelected
                    ? "bg-rose-50 border-rose-500 text-rose-900 ring-4 ring-rose-100"
                    : "bg-gray-50/50 border-gray-100 opacity-40"
                  : "bg-white border-[#e4e4f0] hover:border-blue-400 hover:bg-blue-50/10 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="flex items-center pr-4">
                <span className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex-shrink-0 flex items-center justify-center mr-4 md:mr-6 font-black text-sm md:text-base transition-colors ${
                  showColors && isCorrect ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-bold text-base md:text-lg tracking-tight">{option}</span>
              </div>
              {showColors && isCorrect && <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />}
              {showColors && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedAnswer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1e3a8a] text-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mb-12"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-16 -translate-y-16 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-start mb-6">
                <div className="p-2 bg-white/10 rounded-lg mr-4 mt-1">
                  <HelpCircle className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <p className="font-black text-blue-100 uppercase text-[10px] tracking-[0.2em] mb-2 leading-none">Perspective</p>
                  <p className="text-base md:text-lg font-medium leading-relaxed opacity-95">
                    {q.explanation}
                  </p>
                  {(q as any).link && (
                    <a 
                      href={(q as any).link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-4 text-xs font-black uppercase tracking-widest text-blue-300 hover:text-white transition-colors group/link"
                    >
                      <span className="border-b border-blue-400 pb-0.5 group-hover/link:border-white">
                        {(q as any).linkText || "Source Document"}
                      </span>
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={nextQuestion}
                className="w-full flex items-center justify-center py-4 md:py-5 bg-white text-[#1e3a8a] rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:bg-blue-50 transition-all shadow-xl active:scale-95"
              >
                {currentQ === quizData.length - 1 ? "Complete Journey" : "Next Challenge"}
                <ArrowRight className="ml-3 w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
