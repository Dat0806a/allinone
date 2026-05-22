import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useUserStore, useAppStore } from './store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from './components/navigation/BottomNav';
import { AlertTriangle } from 'lucide-react';
import { cn } from './components/premium/UI';
import { useMedicationContext } from './contexts/MedicationContext';
import { AlarmPopup } from './components/AlarmPopup';
import { useSettingsStore, applyFontSize, applyTheme } from './store/useSettingsStore';
import { unlockAudio } from './lib/audio';

// New Feature Screens
const Splash = React.lazy(() => import('./features/Splash'));
const Onboarding = React.lazy(() => import('./features/Onboarding'));
const AuthScreen = React.lazy(() => import('./features/AuthScreen'));
const Dashboard = React.lazy(() => import('./features/Dashboard'));
const AIChat = React.lazy(() => import('./features/AIChat'));
const Analytics = React.lazy(() => import('./features/Analytics'));
const CommunityScreen = React.lazy(() => import('./features/Community'));
const MapScreen = React.lazy(() => import('./features/MapScreen'));
const Profile = React.lazy(() => import('./features/Profile'));
const Notifications = React.lazy(() => import('./features/Notifications'));
const Settings = React.lazy(() => import('./features/Settings'));
const Emergency = React.lazy(() => import('./features/Emergency'));
const Tests = React.lazy(() => import('./features/Tests'));
const Nutrition = React.lazy(() => import('./features/Nutrition'));
const Medicines = React.lazy(() => import('./features/Medicines'));

export default function App() {
  const { user, setUser, loading, setLoading } = useUserStore();
  const { isEmergency, setIsEmergency, activeTab, setActiveTab } = useAppStore();
  const [showSplash, setShowSplash] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  
  const { fontSize, theme, refreshPermissions } = useSettingsStore();

  useEffect(() => {
    applyFontSize(fontSize);
    applyTheme(theme);
    refreshPermissions();
  }, [fontSize, theme, refreshPermissions]);

  // Global Audio Unlock
  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Use alarm state globally for the popup
  const { alarm, takeAlarmMeds, snoozeAlarm, dismissAlarm } = useMedicationContext();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user && event === 'SIGNED_IN') {
        const u = session.user;
        const updates = {
          id: u.id,
          full_name: u.user_metadata?.full_name || 'Người dùng',
          avatar_url: u.user_metadata?.avatar_url || '',
          created_at: new Date().toISOString(),
        };

        try {
          await supabase.from('profiles').upsert(updates);
        } catch (error) {
          console.error("Supabase Error updating profile:", error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (showSplash) return <Splash />;
  if (!user) return <AuthScreen />;
  if (!hasCompletedOnboarding) return <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard />;
      case 'chat': return <AIChat />;
      case 'community': return <CommunityScreen />;
      case 'map': return <MapScreen />;
      case 'stats': return <Analytics />;
      case 'profile': return <Profile />;
      case 'notifications': return <Notifications />;
      case 'settings': return <Settings />;
      case 'tests': return <Tests />;
      case 'nutrition': return <Nutrition />;
      case 'medicines': return <Medicines />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="h-[100dvh] bg-background max-w-[480px] mx-auto relative shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
      <main className={cn("flex-1 no-scrollbar w-full relative touch-scroll", (activeTab === "community" || activeTab === "chat" || activeTab === "map") ? "overflow-hidden" : "overflow-y-auto pb-20")}>
        <AnimatePresence mode="wait">
          <React.Suspense fallback={<ScreenSkeleton />}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn("w-full", (activeTab === "community" || activeTab === "chat" || activeTab === "map") ? "absolute inset-0 h-full" : "p-6")}
            >
              {renderContent()}
            </motion.div>
          </React.Suspense>
        </AnimatePresence>
      </main>

      {/* Global Medication Alarm Popup */}
      <AlarmPopup 
        alarm={alarm} 
        onTake={takeAlarmMeds} 
        onSnooze={snoozeAlarm} 
        onDismiss={dismissAlarm} 
      />

      {/* Global Emergency SOS Button */}
      {!isEmergency && (
        <div className="absolute top-2 right-2 z-[2000]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEmergency(true)}
            className="relative group"
          >
            {/* Animated rings */}
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
            
            <div className="relative w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(239,68,68,0.4)] border-2 border-white/30 text-white overflow-hidden">
              <AlertTriangle size={24} className="mb-0.5" />
              <span className="text-[10px] font-black tracking-tighter leading-none uppercase">SOS</span>
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
            </div>
          </motion.button>
        </div>
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <AnimatePresence>
        {isEmergency && <Emergency onClose={() => setIsEmergency(false)} />}
      </AnimatePresence>

      {/* Global modal/portal target inside the 480px mobile viewport */}
      <div id="app-modal-portal" className="absolute inset-0 pointer-events-none z-[11000]" />
    </div>
  );
}

function ScreenSkeleton() {
  return (
    <div className="space-y-6 pt-4 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-2xl w-1/2" />
      <div className="h-48 bg-slate-200 rounded-[2.5rem] w-full" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 bg-slate-200 rounded-[2rem]" />
        <div className="h-32 bg-slate-200 rounded-[2rem]" />
      </div>
      <div className="h-48 bg-slate-200 rounded-[2.5rem] w-full" />
    </div>
  );
}
