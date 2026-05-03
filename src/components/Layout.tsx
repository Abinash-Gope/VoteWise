import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import FeedbackButton from "./FeedbackButton";
import { motion } from "motion/react";

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f7f7fb] font-sans text-gray-900 overflow-hidden">
      <Navbar />
      <main className="flex-grow pt-16 flex flex-col overflow-y-auto overflow-x-hidden min-h-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 flex flex-col shrink-0"
        >
          <div className={`flex-grow flex flex-col h-full min-h-0 ${isHomePage ? 'pb-8 md:pb-12' : ''}`}>
            <Outlet />
          </div>
        </motion.div>
        
        {isHomePage && (
          <footer className="bg-white border-t border-[#e4e4f0] py-6 md:py-12 px-6 shrink-0 z-10 relative w-full">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gray-900 font-bold mb-2">VoteWise</p>
              <p className="text-gray-500 text-sm mb-6 font-medium">© {new Date().getFullYear()} Know Your Vote, Own Your Voice.</p>
              <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase font-black tracking-widest text-gray-400">
                <span className="cursor-help hover:text-blue-600 transition-colors">Non-Partisan Information</span>
                <span className="cursor-help hover:text-blue-600 transition-colors">Powered by Official Civic Data</span>
                <span className="cursor-help hover:text-blue-600 transition-colors">Voter Privacy Matters</span>
              </div>
              <p className="mt-8 text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Disclaimer: VoteWise is an educational tool. While we use official sources, 
                always verify voting locations and deadlines with your local election office or 
                state's official website. We do not store your personal voting choices.
              </p>
            </div>
          </footer>
        )}
      </main>
      {isHomePage && <FeedbackButton />}
    </div>
  );
}
