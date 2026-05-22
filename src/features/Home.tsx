import React from 'react';
import { motion } from 'motion/react';
import { Search, Bell, Activity, ArrowRight, Star } from 'lucide-react';

const CATEGORIES = [
  { name: 'Xương khớp', color: 'bg-blue-100 text-blue-600' },
  { name: 'Tim mạch', color: 'bg-red-100 text-red-600' },
  { name: 'Dinh dưỡng', color: 'bg-green-100 text-green-600' },
  { name: 'Mắt', color: 'bg-amber-100 text-amber-600' },
];

const ARTICLES = [
  {
    id: 1,
    title: '5 Bài tập nhẹ nhàng giúp giãn cơ mỗi sáng',
    category: 'Vận động',
    author: 'BS. Nguyễn Văn An',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
    readTime: '5 phút'
  },
  {
    id: 2,
    title: 'Chế độ ăn phù hợp cho người cao huyết áp',
    category: 'Dinh dưỡng',
    author: 'Chuyên gia Lê Thu',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
    readTime: '7 phút'
  }
];

const Home: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl text-slate-500 font-medium">Chào buổi sáng,</h2>
          <h1 className="text-4xl font-display font-black text-slate-900 leading-none tracking-tight">Chào bạn 👋</h1>
        </div>
        <button className="relative p-2 bg-white rounded-2xl shadow-sm text-gray-400">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={24} />
        <input 
          type="text" 
          placeholder="Tìm bài báo, bác sĩ, thuốc..." 
          className="w-full bg-white border-none rounded-[2rem] py-5 pl-14 pr-6 text-xl font-medium focus:ring-8 focus:ring-primary/5 outline-none transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] placeholder:text-slate-300"
        />
      </div>

      {/* Health Stats Dashboard */}
      <div className="bg-gradient-to-br from-primary to-[#FFAB40] rounded-[2.5rem] p-8 text-white shadow-[0_20px_50px_rgba(255,138,0,0.2)]">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <Activity size={24} />
            <span className="font-display font-black text-sm uppercase tracking-[0.2em] opacity-80">Tình trạng hôm nay</span>
          </div>
          <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">14 Tháng 5, 2026</span>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-[2rem] p-6 backdrop-blur-md border border-white/10">
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Nhịp tim</p>
            <p className="text-4xl font-display font-black leading-none">72 <span className="text-sm font-medium opacity-60 ml-1">bpm</span></p>
          </div>
          <div className="bg-white/10 rounded-[2rem] p-6 backdrop-blur-md border border-white/10">
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Huyết áp</p>
            <p className="text-4xl font-display font-black leading-none">120/80</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-display font-black text-slate-800 tracking-tight">Chuyên đề sức khỏe</h3>
          <button className="text-primary font-black text-sm uppercase tracking-widest flex items-center gap-1">Tất cả <ArrowRight size={16} /></button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button key={cat.name} className={`${cat.color} px-6 py-4 rounded-[1.8rem] font-bold whitespace-nowrap active:scale-95 transition-transform text-lg shadow-sm border border-black/5`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Articles */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-display font-black text-slate-800 tracking-tight">Bài báo nổi bật</h3>
        </div>
        <div className="space-y-6">
          {ARTICLES.map((article) => (
            <motion.div 
              whileTap={{ scale: 0.98 }}
              key={article.id} 
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 group cursor-pointer"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-black text-slate-900 border border-white flex items-center gap-2 shadow-lg">
                   <Star size={14} className="text-primary fill-primary" /> {article.category}
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-display font-extrabold text-slate-800 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
                    <div>
                      <p className="text-base font-bold text-slate-800">{article.author}</p>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{article.readTime} đọc</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Doctors */}
      <div className="bg-orange-50/50 rounded-[2.5rem] p-8 border border-orange-100 shadow-sm">
         <h3 className="text-2xl font-display font-black text-orange-950 mb-3 tracking-tight">Bác sĩ tư vấn 24/7</h3>
         <p className="text-lg text-orange-900/80 mb-6 font-medium leading-relaxed">Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn qua cuộc gọi video hoặc chat AI thông minh.</p>
         <button className="w-full bg-white text-primary py-5 rounded-3xl font-display font-black text-xl border-2 border-orange-100 shadow-xl shadow-orange-500/5 active:scale-95 transition-all uppercase tracking-widest">
           Gọi bác sĩ ngay
         </button>
      </div>
    </div>
  );
};

export default Home;
