import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pill, Check, Clock, X } from 'lucide-react';
import { AlarmState } from '../hooks/useMedications';
import { createPortal } from 'react-dom';

interface AlarmPopupProps {
  alarm: AlarmState;
  onTake: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

export const AlarmPopup: React.FC<AlarmPopupProps> = ({ alarm, onTake, onSnooze, onDismiss }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {alarm.active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 pointer-events-auto"
        >
          {/* Gentle pulsing background effect */}
          <motion.div 
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 bg-teal-500/20 pointer-events-none"
          />

          <div className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center relative z-10 border border-teal-100">
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-24 h-24 bg-teal-50 text-teal-500 rounded-[28px] border-2 border-teal-100 flex items-center justify-center mb-6 shadow-xl shadow-teal-500/10"
            >
              <Pill size={48} strokeWidth={1.5} />
            </motion.div>
            
            <h2 className="text-3xl font-display font-bold text-slate-800 leading-tight mb-2">Đã đến giờ<br/>uống thuốc</h2>
            <p className="text-teal-600 font-bold text-lg mb-8 flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full">
              <Clock size={20} /> {alarm.time}
            </p>
            
            <div className="w-full space-y-3 mb-8 max-h-[30vh] overflow-y-auto no-scrollbar">
              {alarm.meds.map(med => (
                <div key={med.id} className="bg-white border-2 border-slate-50 p-4 rounded-3xl flex items-center gap-4 shadow-sm">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${med.color}`}>
                    {med.icon}
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-slate-800 text-lg leading-tight">{med.name}</h4>
                    <span className="text-sm font-bold text-slate-400">{med.dose}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={onTake}
                className="w-full bg-teal-500 text-white font-bold text-lg rounded-3xl py-5 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-teal-500/30 hover:bg-teal-600"
              >
                <Check size={24} strokeWidth={2.5} />
                Tôi đã uống thuốc
              </button>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={onSnooze}
                  className="flex-1 bg-slate-50 text-slate-500 font-bold text-sm rounded-2xl py-4 flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-slate-100"
                >
                  <Clock size={18} />
                  Để sau 10p
                </button>
                <button
                  onClick={onDismiss}
                  className="flex-1 bg-slate-50 text-slate-500 font-bold text-sm rounded-2xl py-4 flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-slate-100 hover:text-red-500"
                >
                  <X size={18} />
                  Bỏ qua
                </button>
              </div>
            </div>
            
            <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Nếu không nghe tiếng chuông, vui lòng chạm vào màn hình
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('app-modal-portal') || document.body
  );
};
