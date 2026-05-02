import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import FeedbackButton from "./FeedbackButton";
import { motion } from "motion/react";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f7f7fb] font-sans text-gray-900">
      <Navbar />
      <main className="pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <Outlet />
        </motion.div>
      </main>
      <footer className="bg-white border-t border-[#e4e4f0] py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} VoteWise. Know Your Vote, Own Your Voice.</p>
      </footer>
      <FeedbackButton />
    </div>
  );
}
