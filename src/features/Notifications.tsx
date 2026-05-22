import React from 'react';
import { motion } from 'motion/react';
import { Bell, Heart, Activity, Shield, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PremiumCard, SectionHeader, cn } from '../components/premium/UI';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'critical',
    title: "Cảnh báo chỉ số",
    desc: "Nhịp tim của bạn tăng nhẹ (85 BPM) lúc 11:30. Hãy ngồi nghỉ ngơi 5 phút ạ.",
    time: "10 phút trước",
    icon: ShieldAlert,
    read: false
  },
  {
    id: 2,
    type: 'success',
    title: "Uống thuốc thành công",
    desc: "Bạn đã xác nhận uống thuốc huyết áp lúc 08:00 sáng nay.",
    time: "4 giờ trước",
    icon: CheckCircle2,
    read: true
  },
  {
    id: 3,
    type: 'info',
    title: "Nhắc nhở sức khỏe",
    desc: "Đã đến lúc bạn nên thực hiện bài tập giãn cơ nhẹ nhàng.",
    time: "2 giờ trước",
    icon: Activity,
    read: true
  }
];

const Notifications: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header Layout */}
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md rounded-2xl p-2.5 pr-16 sm:pr-3 border border-white/30 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-primary border border-orange-100 flex items-center justify-center shrink-0">
            <Bell size={22} className="animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest select-none">
              Trung tâm thông tin
            </p>
            <h1 className="text-lg sm:text-xl font-display font-black text-slate-800 tracking-tight leading-none">
              Thông báo của <span className="text-primary italic">bạn</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {NOTIFICATIONS.map((notif) => (
          <motion.div
            key={notif.id}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "p-6 rounded-[2.5rem] premium-shadow border flex gap-5 transition-all relative overflow-hidden",
              notif.read ? "bg-white border-slate-50" : "bg-white border-primary/20 ring-4 ring-primary/5"
            )}
          >
            {!notif.read && <div className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full" />}
            
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
              notif.type === 'critical' ? "bg-red-50 text-red-500" :
              notif.type === 'success' ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
            )}>
              <notif.icon size={28} />
            </div>

            <div className="flex-1 space-y-1">
              <h4 className="font-display font-black text-slate-800 text-xl leading-tight">{notif.title}</h4>
              <p className="text-base text-slate-500 font-medium leading-relaxed">{notif.desc}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">{notif.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center space-y-4">
         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200">
            <Zap size={32} />
         </div>
         <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Không còn thông báo cũ hơn</p>
      </div>
    </div>
  );
};

export default Notifications;
