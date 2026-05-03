import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Calendar, ClipboardCheck, ArrowRight, ChevronRight, Sparkles, BarChart3, Loader2, CheckCircle, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

const features = [
  {
    title: "AI Chatbot",
    description: "Ask anything about the voting process and get neutral, factual answers instantly.",
    icon: MessageSquare,
    link: "/chat",
    buttonText: "Ask a Question",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Interactive Timeline",
    description: "Explore the journey of an election, from candidate announcements to inauguration day.",
    icon: Calendar,
    link: "/timeline",
    buttonText: "View Timeline",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Knowledge Quiz",
    description: "Test your understanding of civic procedures and election laws in our fun quiz.",
    icon: ClipboardCheck,
    link: "/quiz",
    buttonText: "Take the Quiz",
    color: "bg-emerald-50 text-emerald-600",
  },
];

interface CivicInsights {
  summary: string;
  keyFindings: string[];
  recommendation: string;
  engagementScore: number;
  literacyLevel?: string;
  nextStep?: string;
  generatedBy?: string;
}

export default function Home() {
  const [insights, setInsights] = useState<CivicInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insightError, setInsightError] = useState("");

  const handleAnalyzeTrends = async () => {
    setIsAnalyzing(true);
    setInsightError("");
    try {
      const res = await axios.post("/api/analyze-trends", {
        region: "US & India",
        topicsExplored: ["Voter Registration", "Electoral College", "Election Day", "EVM"],
        sessionDuration: Math.round(performance.now() / 60000),
      });
      setInsights(res.data.insights);
    } catch {
      setInsightError("Unable to fetch AI insights right now. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12 md:space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-28 px-6 bg-gradient-to-br from-white via-blue-50 to-white rounded-[2rem] md:rounded-[4rem] border border-blue-100/50 shadow-2xl shadow-blue-900/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 mb-8 text-xs font-black tracking-[0.2em] text-blue-600 uppercase bg-white border border-blue-100 rounded-full shadow-sm"
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Civic Literacy AI</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-7xl font-black text-[#111827] leading-[1.1] tracking-tighter mb-8">
            Know Your Vote. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-blue-500">
              Own Your Future.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600/90 mb-12 leading-relaxed font-medium">
            VoteWise simplifies the complex machinery of democracy in the US and India. Get factual, non-partisan guidance on registration, deadlines, and procedures.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
            <Link
              to="/chat"
              className="w-full sm:w-auto px-10 py-5 bg-[#1e3a8a] text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-900/20 hover:bg-blue-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
            >
              Consult AI <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/timeline"
              className="w-full sm:w-auto px-10 py-5 bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] rounded-2xl font-black text-lg hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg shadow-blue-900/5"
            >
              The Election Cycle
            </Link>
          </div>
        </motion.div>
        
        {/* Abstract Shapes for Texture */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none"></div>
      </section>

      {/* Feature Grid with Card Hover Effects */}
      <section className="px-4">
        <div className="max-w-xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Master the Process</h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 font-medium">Clear, step-by-step knowledge for every stage of your civic journey.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white p-8 md:p-10 rounded-[2rem] border border-[#e4e4f0] shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all flex flex-col items-start text-left relative overflow-hidden"
            >
              {/* Subtle hover background accent */}
              <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-all duration-500 pointer-events-none"></div>
              
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                <feature.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight relative z-10">{feature.title}</h3>
              <p className="text-gray-600 mb-8 flex-grow leading-relaxed font-medium relative z-10">{feature.description}</p>
              
              <Link
                to={feature.link}
                className="inline-flex items-center text-[#1e3a8a] font-black group px-6 py-3 bg-blue-50/50 rounded-xl group-hover:bg-[#1e3a8a] group-hover:text-white transition-all duration-300 relative z-10"
              >
                {feature.buttonText} <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="relative bg-[#111827] text-white p-8 md:p-20 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#1e3a8a33,transparent_40%)]"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-12 items-center gap-12 relative z-10">
          <div className="lg:col-span-7">
            <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight tracking-tight">Democracy starts with <span className="text-blue-400">knowledge.</span></h2>
            <p className="text-gray-400 text-lg md:text-xl mb-12 leading-relaxed font-medium max-w-lg">
              Knowledge reduces barriers to entry. VoteWise ensures that logistics never stand in the way of your right to be heard.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { text: "Neutral & Factual", desc: "No bias, just laws and procedures." },
                { text: "Simple Access", desc: "Complex laws made for everyone." }
              ].map((item) => (
                <div key={item.text} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <ClipboardCheck className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="font-black text-blue-100 tracking-tight">{item.text}</span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium pl-11">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white/5 p-8 md:p-12 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-2xl relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-2xl font-serif">“</span>
              </div>
              <blockquote className="text-2xl md:text-3xl font-bold tracking-tight italic mb-8 leading-snug">
                Understanding the process is the most powerful tool a citizen has.
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-px bg-blue-500 mr-4"></div>
                <cite className="text-blue-300 font-black uppercase text-xs tracking-widest not-italic">VoteWise Mission</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI Civic Insights — Powered by Gemini ──────────────────────────── */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 mb-4 text-xs font-black tracking-[0.2em] text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by Gemini AI</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Civic Engagement Insights
            </h2>
            <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full mb-6" />
            <p className="text-gray-600 font-medium max-w-lg mx-auto">
              Get real-time AI analysis of civic engagement trends and personalized recommendations for your democracy journey.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
            {/* Background orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full translate-x-32 -translate-y-32 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-x-32 translate-y-32 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {!insights && !isAnalyzing && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                    <BarChart3 className="w-10 h-10 text-blue-300" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">
                    Analyze Your Civic Journey
                  </h3>
                  <p className="text-blue-200/80 mb-10 max-w-md mx-auto font-medium leading-relaxed">
                    Our Gemini AI will analyze your engagement patterns and provide personalized civic literacy insights.
                  </p>
                  <button
                    id="analyze-trends-btn"
                    onClick={handleAnalyzeTrends}
                    className="inline-flex items-center px-10 py-5 bg-white text-[#1e3a8a] rounded-2xl font-black text-base hover:bg-blue-50 transition-all shadow-2xl active:scale-95 group"
                  >
                    <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                    Generate AI Insights
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20"
                  >
                    <Loader2 className="w-8 h-8 text-blue-300" />
                  </motion.div>
                  <p className="text-blue-200 font-bold text-lg">Gemini AI is analyzing civic trends...</p>
                  <p className="text-blue-300/60 text-sm mt-2">Processing engagement data with Google AI</p>
                </div>
              )}

              {insightError && (
                <div className="text-center py-4">
                  <p className="text-rose-300 font-bold mb-4">{insightError}</p>
                  <button onClick={handleAnalyzeTrends} className="px-6 py-3 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                    Try Again
                  </button>
                </div>
              )}

              <AnimatePresence>
                {insights && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Score + Summary Row */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                      <div className="bg-white/10 rounded-2xl p-6 border border-white/10 flex-shrink-0 text-center md:w-48">
                        <TrendingUp className="w-6 h-6 text-blue-300 mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Engagement</p>
                        <p className="text-5xl font-black text-white">{insights.engagementScore}</p>
                        <p className="text-[10px] text-blue-300/70 font-bold mt-1">/ 100</p>
                        {insights.literacyLevel && (
                          <span className="inline-block mt-3 px-3 py-1 bg-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-200 border border-blue-400/20">
                            {insights.literacyLevel}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-3">AI Summary</p>
                        <p className="text-white/90 font-medium leading-relaxed text-lg">{insights.summary}</p>
                        {insights.nextStep && (
                          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1.5">Recommended Next Step</p>
                            <p className="text-blue-100 text-sm font-medium">{insights.nextStep}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Key Findings */}
                    <div className="mb-8">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-4">Key Findings</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {insights.keyFindings.map((finding, i) => (
                          <div key={i} className="flex items-start bg-white/5 rounded-xl p-4 border border-white/10">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
                            <p className="text-white/80 text-sm font-medium leading-relaxed">{finding}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl p-6 border border-blue-400/20 mb-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">AI Recommendation</p>
                      <p className="text-white/90 font-medium leading-relaxed">{insights.recommendation}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAnalyzeTrends}
                        className="flex items-center justify-center px-6 py-3.5 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all border border-white/10 group"
                      >
                        <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        Refresh Analysis
                      </button>
                      <Link
                        to="/chat"
                        className="flex items-center justify-center px-6 py-3.5 bg-white text-[#1e3a8a] rounded-xl font-black text-sm hover:bg-blue-50 transition-all shadow-lg group"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Discuss with AI
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {insights.generatedBy && (
                      <p className="text-[10px] text-blue-400/40 font-bold uppercase tracking-widest mt-6 text-center">
                        Analysis by {insights.generatedBy} · Google AI/ML Services
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
