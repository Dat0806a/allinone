import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PremiumButton } from '../components/premium/UI';
import { ChevronRight, Shield, Activity, Brain } from 'lucide-react';

const STEPS = [
  {
    title: "Bảo vệ bạn 24/7",
    description: "Hệ thống AI thông minh luôn theo sát và bảo vệ sức khỏe của bạn mọi lúc, mọi nơi.",
    icon: Shield,
    color: "bg-blue-500",
  },
  {
    title: "Phân tích thông minh",
    description: "Tự động phân tích các chỉ số sức khỏe và đưa ra lời khuyên cá nhân hóa phù hợp nhất.",
    icon: Brain,
    color: "bg-primary",
  },
  {
    title: "Phản ứng tức thì",
    description: "Kết nối trực tiếp với đội ngũ y tế và người thân ngay khi phát hiện dấu hiệu bất thường.",
    icon: Activity,
    color: "bg-red-500",
  }
];

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const activeStep = STEPS[currentStep];

  return (
    <div className="h-[100dvh] w-full max-w-[480px] mx-auto bg-white flex flex-col relative overflow-hidden select-none">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-slate-50 -skew-y-6 -translate-y-20 origin-top-left" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center text-center"
          >
            <div className={`w-28 h-28 ${activeStep.color} rounded-[2.2rem] flex items-center justify-center shadow-xl mb-8 transform rotate-6`}>
              <activeStep.icon size={48} className="text-white" />
            </div>
            
            <h1 className="text-3xl font-display font-black text-slate-800 mb-4 leading-tight">
              {activeStep.title}
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-xs">
              {activeStep.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 pb-8 space-y-6 bg-white relative z-20">
        {/* Indicators */}
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div 
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-primary' : 'w-1.5 bg-slate-200'}`}
            />
          ))}
        </div>

        <PremiumButton 
          onClick={next}
          size="lg" 
          className="w-full flex items-center justify-center gap-2"
        >
          {currentStep === STEPS.length - 1 ? "Bắt đầu ngay" : "Tiếp tục"}
          <ChevronRight size={20} />
        </PremiumButton>

        <button 
          onClick={onComplete}
          className="w-full text-slate-400 font-bold uppercase tracking-widest text-[10px] py-1 hover:text-slate-600 transition-colors"
        >
          Bỏ qua hướng dẫn
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
