import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg"
      >
        <div className="mb-8 relative">
          <h1 className="text-[12rem] font-black text-gray-100 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
               <Search className="w-16 h-16 text-[#1e3a8a] opacity-20" />
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Page Not Found</h2>
        <p className="text-gray-500 mb-10 text-lg max-w-md mx-auto">
          We couldn't find the civic knowledge you're looking for. It might have moved or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-10 py-5 bg-[#1e3a8a] text-white rounded-[2rem] font-black shadow-2xl shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-95 group"
        >
          <Home className="w-5 h-5 mr-3" />
          Back to Voter Center
        </Link>
      </motion.div>
    </div>
  );
}
