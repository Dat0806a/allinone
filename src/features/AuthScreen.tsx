import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Shield, ChevronRight, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { PremiumButton, PremiumInput } from '../components/premium/UI';
import { supabase } from '../lib/supabase';

import { useScrollLock } from '../hooks/useScrollLock';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useScrollLock(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!isLogin && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
      }
    } catch (e: any) {
      console.error(e);
      if (e.message.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (e.message.includes('User already registered')) {
        setError('Email này đã được sử dụng.');
      } else {
        setError(e.message || 'Đã xảy ra lỗi. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#FDFDFD] flex flex-col items-center p-6 pt-10 pb-10 overflow-y-auto no-scrollbar relative touch-auto">
      {/* Premium Background Accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[30%] bg-gradient-to-b from-orange-50 to-transparent pointer-events-none" />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-6 shrink-0"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-[#FF9D2E] rounded-[1.8rem] flex items-center justify-center shadow-[0_20px_40px_rgba(255,138,0,0.3)] border-4 border-white">
              <Shield size={32} className="text-white fill-white/10" />
            </div>
          </div>
          <div className="mt-4 text-center">
            <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight leading-none">AI HEALTH</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mt-1.5">Studio Premium 2026</p>
          </div>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          layout
          className="bg-white rounded-[3rem] p-7 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] border border-slate-50 relative overflow-hidden shrink-0"
        >
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Sparkles size={100} className="text-primary" />
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-display font-black text-slate-800">
              {isLogin ? "Chào bạn quay lại," : "Xin chào bạn mới,"}
            </h2>
            <p className="text-slate-400 font-medium text-base mt-2 px-2">
              {isLogin ? "Sẵn sàng để theo dõi sức khỏe của bạn chưa?" : "Cùng tạo hồ sơ để nhận hỗ trợ y tế tốt nhất."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAuth} 
              className="space-y-4"
            >
              {!isLogin && (
                <PremiumInput 
                  icon={User} 
                  placeholder="Họ và tên đầy đủ" 
                  value={fullName}
                  onChange={(e: any) => setFullName(e.target.value)}
                  className="h-14 text-lg rounded-[1.5rem] border-transparent bg-slate-50/50"
                  required
                />
              )}
              
              <PremiumInput 
                icon={Mail} 
                placeholder="Địa chỉ Email" 
                type="email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                className="h-14 text-lg rounded-[1.5rem] border-transparent bg-slate-50/50"
                required
              />

              <div className="relative">
                <PremiumInput 
                  icon={Lock} 
                  placeholder="Mật khẩu của bạn" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  className="h-14 text-lg rounded-[1.5rem] border-transparent bg-slate-50/50 pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {!isLogin && (
                <PremiumInput 
                  icon={Shield} 
                  placeholder="Xác nhận lại mật khẩu" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  className="h-14 text-lg rounded-[1.5rem] border-transparent bg-slate-50/50"
                  required
                />
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-600 font-bold text-[12px] bg-red-50/50 p-4 rounded-[1.5rem] flex items-center gap-2 border border-red-100/50"
                >
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="pt-2">
                <PremiumButton 
                  type="submit"
                  isLoading={isLoading}
                  className="w-full h-15 rounded-[1.8rem] bg-slate-900 hover:bg-black text-white font-black text-lg uppercase tracking-[0.1em] shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all active:scale-[0.97]"
                >
                  {isLogin ? "Đăng nhập ngay" : "Tạo tài khoản"}
                </PremiumButton>
              </div>
            </motion.form>
          </AnimatePresence>
        </motion.div>

        {/* Change Screen Section */}
        <div className="mt-6 mb-4 text-center shrink-0">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="group inline-flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <span className="text-slate-400 font-medium text-base">
               {isLogin ? "Bạn vẫn chưa có tài khoản?" : "Bạn đã có tài khoản rồi?"}
            </span>
            <span className="flex items-center gap-1 text-primary font-black text-[18px] tracking-tight">
               {isLogin ? "Đăng ký thành viên mới" : "Quay lại Đăng nhập"} 
               <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
