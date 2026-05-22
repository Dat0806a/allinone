import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Phone, X } from 'lucide-react';
import { useAppStore } from '../store/useStore';

export const SOSOverlay: React.FC = () => {
  const { isEmergency, setIsEmergency } = useAppStore();

  if (!isEmergency) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center p-6 text-white overflow-hidden"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-[120px] mb-8"
      >
        <AlertCircle size={160} strokeWidth={1} />
      </motion.div>

      <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase">KHẨN CẤP</h1>
      <p className="text-xl text-center mb-12 opacity-90 leading-relaxed font-medium">
        Đã gửi yêu cầu hỗ trợ đến người thân và cứu hộ. Vị trí của bạn đang được theo dõi.
      </p>

      <div className="grid grid-cols-1 w-full gap-4 max-w-sm">
        <a 
          href="tel:115"
          className="bg-white text-red-600 py-6 rounded-3xl text-3xl font-bold flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-transform"
        >
          <Phone size={36} fill="currentColor" />
          GỌI 115
        </a>
        
        <button 
          onClick={() => setIsEmergency(false)}
          className="bg-red-800/40 border-2 border-white/30 text-white py-4 rounded-2xl text-xl font-bold flex items-center justify-center gap-2 mt-4"
        >
          <X size={24} />
          HUỶ BỎ SAU KHI AN TOÀN
        </button>
      </div>

      {/* Pulse Rings */}
      <div className="absolute inset-0 pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 3, delay: i }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white/20 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};
