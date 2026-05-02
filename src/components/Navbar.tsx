import { NavLink } from "react-router-dom";
import { Vote, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Chat", path: "/chat" },
  { name: "Timeline", path: "/timeline" },
  { name: "Quiz", path: "/quiz" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e3a8a] text-white shadow-xl h-16 border-b border-white/5 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <NavLink to="/" className="flex items-center space-x-3 group transition-all">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#1e3a8a] transition-all">
            <Vote className="w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">VOTEWISE</span>
        </NavLink>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-xs font-black uppercase tracking-widest px-5 py-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-white text-[#1e3a8a] shadow-lg shadow-white/10" 
                    : "text-blue-100/70 hover:text-white hover:bg-white/10"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex border border-white/10 items-center justify-center rounded-xl hover:bg-blue-800 transition-all active:scale-90"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1e3a8a] border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                      isActive ? "bg-white text-[#1e3a8a]" : "text-blue-100 hover:bg-blue-800/50"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
