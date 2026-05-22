import React from 'react';
import { motion } from 'motion/react';
import { Home, MessageCircle, Pill, MapPin, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Trang chủ' },
    { id: 'chat', icon: MessageCircle, label: 'AI Chat' },
    { id: 'medicines', icon: Pill, label: 'Thuốc' },
    { id: 'map', icon: MapPin, label: 'Bản đồ' },
    { id: 'profile', icon: User, label: 'Cá nhân' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pt-2 pb-6 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center min-w-[64px] transition-colors duration-200 ${
            activeTab === tab.id ? 'text-[#FF8A00]' : 'text-gray-400'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeTab === tab.id ? 'bg-[#FFF4E5]' : ''}`}>
            <tab.icon size={28} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          </div>
          <span className="text-xs font-bold mt-1 uppercase tracking-wider">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="w-1 h-1 bg-[#FF8A00] rounded-full mt-1"
            />
          )}
        </button>
      ))}
    </nav>
  );
};
