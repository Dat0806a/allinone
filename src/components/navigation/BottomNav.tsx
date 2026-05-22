import React from "react";
import { motion } from "motion/react";
import { Home, MessageSquare, BarChart3, MapPin, User, Users } from "lucide-react";
import { cn } from "../premium/UI";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: "home", icon: Home, label: "Trang chủ" },
    { id: "chat", icon: MessageSquare, label: "AI Chat" },
    { id: "stats", icon: BarChart3, label: "Sức khỏe" },
    { id: "map", icon: MapPin, label: "Bản đồ" },
    { id: "profile", icon: User, label: "Cá nhân" },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full z-50 pointer-events-none">
      <div className="glass rounded-t-[1.75rem] rounded-b-none premium-shadow border-t border-white/40 px-2 pt-1.5 pb-1.5 flex items-center justify-around pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-2 px-3 group transition-transform active:scale-90"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon
                size={24}
                className={cn(
                  "transition-colors duration-300 relative z-10",
                  isActive
                    ? "text-primary"
                    : "text-slate-400 group-hover:text-slate-600",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-bold mt-1 uppercase tracking-wider relative z-10",
                  isActive
                    ? "text-primary opacity-100"
                    : "text-slate-400 opacity-60",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
