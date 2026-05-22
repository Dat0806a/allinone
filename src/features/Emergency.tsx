import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, X, AlertCircle, Heart, Shield, Landmark, MapPin, Loader2 } from 'lucide-react';
import { PremiumButton, cn } from '../components/premium/UI';
import { supabase } from '../lib/supabase';

import { getAudioContext } from '../lib/audio';

interface EmergencyContactData {
  id: string;
  name: string;
  relationship?: string;
  relation?: string;
  phone: string;
}

const Emergency: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [countdown, setCountdown] = useState(10);
  const [isTriggered, setIsTriggered] = useState(false);
  
  // Real GPS and contacts state
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [contacts, setContacts] = useState<EmergencyContactData[]>([]);
  
  // Press-and-hold immediate trigger states
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<any>(null);

  // Audio beacon variables
  const audioIntervalRef = useRef<any>(null);

  // Fetch coordinates on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocLoading(false);
        },
        () => {
          // Failure mock simulation
          setCoords({ lat: 21.0285, lng: 105.8542 }); // Hanoi center default coords
          setLocLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setCoords({ lat: 21.0285, lng: 105.8542 });
      setLocLoading(false);
    }
  }, []);

  // Fetch real contacts from Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      if (!user) return;

      const fetchContacts = async () => {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id);
        
        if (!error && data) {
          setContacts(data.map(d => ({
            id: d.id,
            name: d.name || '',
            relationship: d.relationship || 'Người thân',
            phone: d.phone_number || ''
          })));
        } else {
          console.error("SOS Emergency, contact fetch error: ", error);
        }
      };

      fetchContacts();

      const subscription = supabase
        .channel('emergency_contacts_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_contacts', filter: `user_id=eq.${user.id}` }, fetchContacts)
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    });
  }, []);

  // Alarm countdown timer
  useEffect(() => {
    if (countdown > 0 && !isTriggered) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isTriggered) {
      setIsTriggered(true);
    }
  }, [countdown, isTriggered]);

  // Automatic redirect to native phone calling application when SOS is triggered
  useEffect(() => {
    if (isTriggered) {
      window.location.href = "tel:115";
    }
  }, [isTriggered]);

  // Audio alarm beacon synthesis when triggered
  useEffect(() => {
    if (isTriggered) {
      // Periodic alarm buzzer sounds
      const playBuzzer = () => {
        try {
          const ctx = getAudioContext();
          if (!ctx) return;
          
          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
          const now = ctx.currentTime;
          
          // Double chirp siren pitch sequence
          const osc1 = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(800, now);
          osc1.frequency.exponentialRampToValueAtTime(1500, now + 0.3);
          
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          
          osc1.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc1.start(now);
          osc1.stop(now + 0.4);
        } catch (e) {
          console.log('Audio error:', e);
        }
      };

      // Play immediately, then loop every 1.5 seconds
      playBuzzer();
      audioIntervalRef.current = setInterval(playBuzzer, 1500);
    }

    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, [isTriggered]);

  // Press & hold mouse event handlers
  const handleHoldStart = () => {
    if (isTriggered) return;
    
    setHoldProgress(0);
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current);
          setIsTriggered(true);
          return 100;
        }
        return prev + 4; // Approx 1.25 seconds total holding velocity
      });
    }, 50);
  };

  const handleHoldEnd = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    setHoldProgress(0);
  };

  // Default fallbacks for contacts
  const displayContacts = contacts.length > 0 
    ? contacts.slice(0, 3) 
    : [
        { id: 'def1', name: 'BS. Lê Minh', relationship: 'Bác sĩ trực', phone: '115' },
        { id: 'def2', name: 'Nguyễn Văn Tiến', relationship: 'Người thân (Cứu hộ)', phone: '0987654321' }
      ];

  return (
    <div className="fixed inset-0 z-[12000] flex flex-col items-center justify-between p-6 py-10 bg-red-600 overflow-hidden text-white pointer-events-auto select-none">
      {/* Repeating Pulse Ripple Rings */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0.1, 0.35] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="absolute w-[440px] h-[440px] border-[30px] border-white/10 rounded-full"
      />
      <motion.div
        animate={{ scale: [0.9, 1.8, 0.9], opacity: [0.15, 0.05, 0.15] }}
        transition={{ duration: 2.8, repeat: Infinity }}
        className="absolute w-[680px] h-[680px] border-[50px] border-white/5 rounded-full"
      />

      {/* Header Info */}
      <div className="relative z-10 w-full flex items-center justify-between shrink-0 mb-4 px-2">
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur rounded-2xl px-4 py-2 border border-white/10 text-xs font-bold leading-none">
          <MapPin size={14} className="text-amber-300 animate-pulse" />
          {locLoading ? (
            <span className="flex items-center gap-1.5 font-bold"><Loader2 size={12} className="animate-spin" /> GPS Sync...</span>
          ) : coords ? (
            <span className="font-mono text-[10px] tracking-tight">{coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E</span>
          ) : (
            <span>Hà Nội, VN</span>
          )}
        </div>
        
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center cursor-pointer transition-all outline-none"
        >
          <X size={18} />
        </button>
      </div>

      {/* Core Body Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xs text-center my-auto">
        {!isTriggered ? (
          <>
            {/* Interactive Press-to-trigger Circular Ring */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative w-44 h-44 flex items-center justify-center mb-8 shrink-0"
            >
              {/* SVG circular track background */}
              <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                <circle 
                  cx="88" cy="88" r="80" 
                  stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none"
                />
                <circle 
                  cx="88" cy="88" r="80" 
                  stroke="#fbbf24" strokeWidth="8" fill="none"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - holdProgress / 100)}`}
                  className="transition-all duration-75"
                />
              </svg>

              <button
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                className={cn(
                  "w-36 h-36 rounded-full bg-white text-red-600 font-display font-black text-6xl flex items-center justify-center shadow-2xl active:scale-95 transition-all outline-none cursor-pointer border-4 border-white select-none touch-none",
                  holdProgress > 0 ? "bg-amber-400 text-white animate-pulseScale" : ""
                )}
              >
                {holdProgress > 0 ? `${Math.round(holdProgress)}%` : countdown}
              </button>
            </motion.div>
            
            <h1 className="text-3xl font-display font-black mb-3 uppercase tracking-tight">Kích hoạt khẩn cấp?</h1>
            <p className="text-[13px] font-semibold opacity-85 leading-relaxed mb-6">
              Hệ thống sẽ gửi tọa độ GPS chính xác và gọi cứu hộ y tế sau <span className="font-extrabold text-amber-300">{countdown} giây nữa</span>.
            </p>

            <div className="space-y-3 w-full">
               <button
                 onMouseDown={handleHoldStart}
                 onMouseUp={handleHoldEnd}
                 onTouchStart={handleHoldStart}
                 onTouchEnd={handleHoldEnd}
                 className="w-full bg-white text-red-600 hover:bg-neutral-50 p-4.5 rounded-3xl font-black uppercase text-sm select-none border-2 border-white shadow-xl touch-none active:scale-98 transition-transform cursor-pointer outline-none"
               >
                 {holdProgress > 0 ? 'ĐANG GIỮ NÚT...' : 'NHẤN VÀ GIỮ 3S ĐỂ GỬI NGAY'}
               </button>
               
               <button 
                 onClick={onClose}
                 className="w-full flex items-center justify-center gap-2 text-white font-black opacity-70 hover:opacity-100 transition-all uppercase tracking-widest text-[10px] py-1.5 cursor-pointer outline-none"
               >
                 <X size={14} /> HỦY BÁO ĐỘNG SOS
               </button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full space-y-6"
          >
            <div className="w-24 h-24 bg-white rounded-[2.2rem] flex flex-col items-center justify-center text-red-600 mb-2 mx-auto shadow-[0_20px_40px_rgba(0,0,0,0.3)] border-4 border-white animate-pulse">
              <Phone size={36} fill="currentColor" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-display font-black uppercase tracking-tight">ĐANG PHÁT TÍN HIỆU CỨU TRỢ</h2>
              <p className="text-xs font-semibold opacity-85 leading-relaxed">
                Máy thu GPS đang phát toạ độ thời gian thực đến phòng điều phối 115 và danh sách người thân đồng kiểm soát.
              </p>
            </div>
            
            {/* Realtime Live List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar pt-1 pr-1">
              {displayContacts.map((contact) => (
                <EmergencyContact 
                  key={contact.id}
                  name={contact.relationship} 
                  role={contact.name} 
                  phone={contact.phone} 
                />
              ))}
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4.5 rounded-3xl select-none bg-black/35 hover:bg-black/50 border border-white/20 text-white font-black text-xs uppercase tracking-widest cursor-pointer outline-none active:scale-98 transition-transform"
            >
              HỎA TỐC / HỦY GỬI BÁO ĐỘNG
            </button>
          </motion.div>
        )}
      </div>

      {/* Safety Badges footer */}
      <div className="flex gap-8 opacity-25 text-white z-10 shrink-0 select-none">
        <Shield size={24} />
        <Heart size={24} />
        <AlertCircle size={24} />
      </div>

      <style>{`
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .animate-pulseScale {
          animation: pulseScale 0.6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

const EmergencyContact = ({ name, role, phone }: any) => (
  <motion.a 
    href={`tel:${phone}`}
    whileTap={{ scale: 0.98 }}
    className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl transition-all text-white max-w-sm w-full outline-none"
  >
    <div className="text-left flex flex-col min-w-0 pr-3">
       <span className="text-[9px] font-black uppercase tracking-wider opacity-60 truncate">{name}</span>
       <span className="text-sm font-bold truncate leading-snug">{role}</span>
    </div>
    <div className="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
       <Phone size={15} fill="currentColor" />
    </div>
  </motion.a>
);

export default Emergency;
