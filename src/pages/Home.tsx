import { Link } from "react-router-dom";
import { MessageSquare, Calendar, ClipboardCheck, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

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

export default function Home() {
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
            VoteWise simplifies the complex machinery of democracy. Get factual, non-partisan guidance on registration, deadlines, and procedures.
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
    </div>
  );
}
