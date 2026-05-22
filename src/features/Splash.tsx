import React from 'react';
import { motion } from 'motion/react';

const Splash: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100] overflow-hidden">
      {/* Dynamic Background Glows */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-400/10 blur-[120px] rounded-full"
      />

      {/* Main Logo Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(255,138,0,0.3)] mb-8">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8L22 9L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9L9 8L12 2Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </motion.div>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-display font-bold text-slate-800 tracking-tight"
        >
          Health<span className="text-primary italic">.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          className="text-slate-500 font-medium uppercase tracking-[0.3em] text-[10px] mt-2"
        >
          Guardian AI 2026
        </motion.p>
      </motion.div>

      {/* Loading Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-20 flex flex-col items-center"
      >
        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full bg-primary"
          />
        </div>
        <span className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
          Khởi động hệ thống...
        </span>
      </motion.div>
    </div>
  );
};

export default Splash;
