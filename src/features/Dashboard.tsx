import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, Activity, Heart, Thermometer, Zap, ArrowRight, Star, HeartPulse, Pill, Stethoscope, Users, Edit3, X, BookOpen, Clock, Sparkles } from 'lucide-react';
import { PremiumCard, SectionHeader, cn, PremiumInput } from '../components/premium/UI';
import { useScrollLock } from '../hooks/useScrollLock';
import { useAppStore, useUserStore } from '../store/useStore';

const HEALTH_CHART = [72, 75, 71, 78, 74, 72, 73];

interface ArticleContent {
  heading: string;
  text: string;
}

interface Article {
  id: number;
  title: string;
  category: string;
  image: string;
  time: string;
  summary: string;
  content: ArticleContent[];
}

const ARTICLES: Article[] = [
  {
    id: 1,
    title: "5 Bí quyết sống vui khỏe cho người cao tuổi",
    category: "Lối sống",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600",
    time: "5 phút đọc",
    summary: "Duy trì lối sống lành mạnh, tinh thần lạc quan và tập luyện điều độ hàng ngày giúp kéo dài tuổi thọ và giữ trọn niềm vui tuổi xế chiều.",
    content: [
      {
        heading: "1. Vận động nhẹ nhàng 30 phút mỗi ngày",
        text: "Các bài tập như đi bộ nhanh, tập dưỡng sinh hay yoga nhẹ nhàng cải thiện đáng kể hệ tuần hoàn, giúp xương khớp dẻo dai và củng cố hệ tim mạch khỏe mạnh."
      },
      {
        heading: "2. Chế độ ăn uống cân đối, thanh đạm",
        text: "Nên ưu tiên thực phẩm có nguồn gốc từ thực vật, nhiều chất xơ như rau xanh, hoa quả tươi. Giảm tối đa mỡ động vật và hạn chế lượng muối để bảo vệ thành mạch huyết áp."
      },
      {
        heading: "3. Uống đủ nước đều đặn đúng cách",
        text: "Mặc dù người lớn tuổi thường ít cảm nhận được cảm giác khát, việc bù đắp 1.5 - 2 lít nước mỗi ngày bằng cách uống từng ngụm rải đều là vô cùng quan trọng."
      },
      {
        heading: "4. Thường xuyên rèn luyện trí não thông minh",
        text: "Đọc sách báo, giải ô chữ, chơi cờ hoặc học thêm bất kỳ kỹ năng mới nào sẽ tạo kích thích tích cực lên các tế bào thần kinh, phòng ngừa hiệu quả chứng thuyên giảm trí nhớ."
      },
      {
        heading: "5. Khám định kỳ định hạn & giữ tinh thần lạc quan",
        text: "Đồng hành cùng đội ngũ bác sĩ bằng lịch khám định kỳ mỗi 6 tháng. Thường xuyên tâm sự, sinh hoạt câu lạc bộ cùng bạn bè để nuôi dưỡng tâm hồn vui vẻ, yêu đời."
      }
    ]
  },
  {
    id: 2,
    title: "Chăm sóc khớp gối mùa lạnh theo lời khuyên bác sĩ",
    category: "Y khoa",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
    time: "8 phút đọc",
    summary: "Thời tiết lạnh khiến dịch bôi trơn ổ khớp co đặc lại và giảm tuần hoàn ngoại vi. Dưới đây là chiến lược bảo vệ khớp gối chuyên nghiệp từ chuyên khoa y tế.",
    content: [
      {
        heading: "1. Giữ ấm toàn diện vùng khớp gối",
        text: "Mặc quần dày, đeo băng thun đầu gối hoặc dùng túi chườm ấm mỗi tối. Giữ ấm giúp thúc đẩy giãn cơ, làm loãng dịch khớp tắc nghẽn giúp vận động trơn tru."
      },
      {
        heading: "2. Chườm nhiệt giảm đau nhức nhanh chóng",
        text: "Khi xuất hiện cơn đau ê buốt, sử dụng khăn ấm hoặc đệm nhiệt đặt lên gối trong 15-20 phút. Hạn chế sử dụng dầu nóng bừa bãi tránh tình trạng viêm khớp nặng thêm."
      },
      {
        heading: "3. Tập khởi động khớp nhẹ nhàng tại chỗ",
        text: "Mỗi buổi sáng trước khi ra khỏi giường, bạn nên xoay nhẹ cổ chân, co duỗi khớp gối từ từ để làm nóng khớp, không nên đứng dậy bước đi đột ngột đột xuất."
      },
      {
        heading: "4. Dinh dưỡng bổ trợ tái tạo sụn khớp",
        text: "Bổ sung thường xuyên acid béo Omega-3 (có trong cá hồi, cá mòi, hạt lanh), súp lơ xanh cùng các vitamin khoáng chất thiết yếu hỗ trợ bôi trơn dịch tự nhiên."
      }
    ]
  },
  {
    id: 3,
    title: "Thực đơn dinh dưỡng vàng cho người huyết áp cao",
    category: "Dinh dưỡng",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600",
    time: "6 phút đọc",
    summary: "Ăn gì và kiêng gì luôn là bài toán khó của người bệnh cao huyết áp. Áp dụng chế độ DASH dưới đây giúp hạ chỉ số đo đơn giản và an toàn nhất.",
    content: [
      {
        heading: "1. Nguyên tắc hạn chế muối tối đa",
        text: "Không dùng quá 5 gram muối mỗi ngày. Tránh xa các thực phẩm đóng hộp, dưa muối chua, mỳ ăn liền và nước sốt nhiều gia vị đậm."
      },
      {
        heading: "2. Tăng cường Kali tự nhiên đẩy lùi Natri",
        text: "Kali hỗ trợ thận đào thải Natri dư thừa qua bài tiết, làm thư giãn các thành mạch huyết quản. Ăn nhiều chuối, cam, bưởi, khoai lang và bông cải xanh."
      },
      {
        heading: "3. Chọn nguồn chất béo lành mạnh hòa tan tốt",
        text: "Sử dụng dầu ô liu, dầu đậu nành, dầu hướng dương thay thế mỡ động vật. Nên ưu tiên ăn cá sông hoặc thịt gà trắng bỏ da thay vì các loại thịt đỏ dai mỡ."
      }
    ]
  }
];

const Dashboard: React.FC = () => {
  const { setActiveTab, setPendingSearchQuery, setShouldOpenPostModal } = useAppStore();
  const { user } = useUserStore();
  const [searchMode, setSearchMode] = useState<'medicine' | 'disease'>('medicine');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isArticlesListOpen, setIsArticlesListOpen] = useState(false);
  const [articleSearchQuery, setArticleSearchQuery] = useState('');

  // Scroll lock when any health article portal is active
  useScrollLock(!!selectedArticle || isArticlesListOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setPendingSearchQuery(searchQuery);
    setActiveTab('chat');
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Thứ hai, 18 tháng 5</p>
          <h1 className="text-3xl font-display font-black text-slate-800">
            Chào bạn, <span className="text-primary italic">{user?.user_metadata?.full_name?.split(' ').pop() || 'bạn'}</span> 👋
          </h1>
          
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab('community');
                setShouldOpenPostModal(true);
              }}
              className="mt-3 flex items-center gap-2 bg-primary/10 text-primary font-bold text-sm px-5 py-2.5 rounded-2xl border-2 border-primary/10 hover:bg-primary/20 transition-all"
            >
              <Edit3 size={16} />
              Đăng bài chia sẻ
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('notifications')}
              className="mt-3 w-12 h-12 shrink-0 bg-white rounded-2xl flex items-center justify-center text-[#FF8A00] shadow-xl shadow-orange-500/20 border-2 border-orange-100 transition-all"
            >
              <Bell size={24} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative group px-1">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <div className="absolute left-5 text-slate-400 group-focus-within:text-primary transition-colors z-10">
            <Search size={22} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchMode === 'medicine' ? "Tra cứu thuốc..." : "Tra cứu bệnh..."} 
            className="w-full bg-white border-2 border-slate-50 rounded-[2rem] py-5 pl-14 pr-24 text-xl font-medium outline-none transition-all premium-shadow focus:border-primary/20 focus:ring-8 focus:ring-primary/5 placeholder:text-slate-300"
          />
          <div className="absolute right-3 flex gap-1.5">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchMode('medicine')}
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border",
                searchMode === 'medicine' 
                  ? "bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-200" 
                  : "bg-orange-50 text-primary border-orange-100/50 hover:bg-orange-100"
              )}
            >
              <Pill size={18} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchMode('disease')}
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border",
                searchMode === 'disease' 
                  ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-200" 
                  : "bg-blue-50 text-blue-500 border-blue-100/50 hover:bg-blue-100"
              )}
            >
              <Stethoscope size={18} />
            </motion.button>
          </div>
        </form>
      </div>

      {/* Main Stats Card */}
      <PremiumCard className="bg-gradient-to-br from-[#FF8A00] to-orange-500 text-white relative overflow-hidden group border-none shadow-[0_20px_50px_rgba(255,138,0,0.3)]">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
                <HeartPulse className="text-white" size={24} />
              </div>
              <span className="font-display font-black text-xs tracking-widest uppercase opacity-80">Tổng quan sức khỏe</span>
            </div>
            <span className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-white/20">Tuyệt vời</span>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-1">
              <p className="text-xs font-black text-white/70 uppercase tracking-widest flex items-center gap-2">
                <Heart size={10} className="text-white" /> Nhịp tim
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-black">72</span>
                <span className="text-xs opacity-50 font-black uppercase tracking-widest">BPM</span>
              </div>
              {/* Mini Chart SVG */}
              <div className="h-8 flex items-end gap-1 pt-2">
                {HEALTH_CHART.map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(h/80)*100}%` }}
                    className="flex-1 bg-white/40 rounded-t-sm"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-white/70 uppercase tracking-widest flex items-center gap-2">
                <Activity size={10} className="text-white" /> Huyết áp
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-black">120/80</span>
              </div>
              <p className="text-xs text-white font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-lg mt-2 font-display">Ổn định</p>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Thermometer size={16} className="text-white" />
              <div className="text-sm font-bold">36.6°C</div>
            </div>
            <div className="flex items-center gap-3">
              <Zap size={16} className="text-white" />
              <div className="text-sm font-bold">98% Oxy</div>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Services Grid */}
      <div>
        <SectionHeader title="Dịch vụ nhanh" />
        <div className="grid grid-cols-2 gap-4">
          <ServiceItem onClick={() => setActiveTab('chat')} icon={Star} label="AI Khám bệnh" sub="Chat 24/7" color="bg-orange-500" />
          <ServiceItem onClick={() => setActiveTab('tests')} icon={Activity} label="Xét nghiệm" sub="Tại nhà" color="bg-blue-500" />
          <ServiceItem onClick={() => setActiveTab('nutrition')} icon={Heart} label="Thực đơn" sub="Dinh dưỡng" color="bg-red-500" />
          <ServiceItem onClick={() => setActiveTab('medicines')} icon={Zap} label="Nhắc thuốc" sub="Đúng giờ" color="bg-purple-500" />
          <ServiceItem onClick={() => setActiveTab('community')} icon={Users} label="Cộng đồng" sub="Chia sẻ" color="bg-green-500" />
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-6">
        <SectionHeader 
          title="Thông tin hữu ích" 
          action={
            <button 
              onClick={() => setIsArticlesListOpen(true)}
              className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
            >
              Tất cả <ArrowRight size={16} />
            </button>
          } 
        />
        {ARTICLES.map((article) => (
          <motion.div 
            whileTap={{ scale: 0.98 }}
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="flex gap-4 p-4 glass rounded-[2.5rem] premium-shadow group cursor-pointer"
          >
            <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden flex-shrink-0">
              <img src={article.image} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <span className="text-xs font-black text-primary uppercase tracking-widest">{article.category}</span>
              <h4 className="text-xl font-display font-extrabold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{article.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ARTICLES PORTALS */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* MODAL 1: ARTICLES DIRECTORY */}
          <AnimatePresence>
            {isArticlesListOpen && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsArticlesListOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Content Box */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 15 }}
                  className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 relative z-10 flex flex-col max-h-[85vh] my-auto overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-lg text-slate-800 leading-none">
                          Cẩm nang sống khỏe
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider select-none">
                          Bác sĩ kiểm duyệt kiến thức
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsArticlesListOpen(false)}
                      className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* On-the-fly Articles Search Bar */}
                  <div className="my-4 relative shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Tìm kiếm bài viết sống khỏe..."
                      value={articleSearchQuery}
                      onChange={(e) => setArticleSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 focus:bg-white text-sm font-semibold text-slate-700 placeholder:text-slate-400 rounded-2xl py-3.5 pl-12 pr-4 outline-none border-2 border-slate-100 focus:border-primary/20 transition-all"
                    />
                    {articleSearchQuery && (
                      <button 
                        onClick={() => setArticleSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  {/* Scrollable list content */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                    {ARTICLES.filter(article => 
                      article.title.toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
                      article.category.toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
                      article.summary.toLowerCase().includes(articleSearchQuery.toLowerCase())
                    ).length > 0 ? (
                      ARTICLES.filter(article => 
                        article.title.toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
                        article.category.toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
                        article.summary.toLowerCase().includes(articleSearchQuery.toLowerCase())
                      ).map((article) => (
                        <motion.div 
                          key={article.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedArticle(article)}
                          className="flex gap-4 p-3 hover:bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all duration-300 cursor-pointer"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                            <img src={article.image} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{article.category}</span>
                            <h4 className="text-sm font-extrabold text-slate-800 leading-tight mt-0.5 mb-1 truncate">
                              {article.title}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-1 leading-snug">
                              {article.summary}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 font-bold">
                              <Clock size={10} />
                              <span>{article.time}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400 space-y-2">
                        <BookOpen size={40} className="mx-auto stroke-[1.5] opacity-50" />
                        <p className="text-sm font-bold">Không tìm thấy bài viết nào phù hợp</p>
                        <p className="text-xs">Vui lòng thử tra cứu bằng từ khóa khác.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* MODAL 2: DETAILED ARTICLE READER */}
          <AnimatePresence>
            {selectedArticle && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedArticle(null)}
                  className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
                />

                {/* Content Box */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 15 }}
                  className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] my-auto relative z-10"
                >
                  {/* Cover Image Header */}
                  <div className="relative h-48 w-full shrink-0">
                    <img src={selectedArticle.image} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Close action overlay */}
                    <button 
                      onClick={() => setSelectedArticle(null)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                    
                    {/* Floating category badge & read estimation */}
                    <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-white">
                      <span className="text-xs bg-primary text-white font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        {selectedArticle.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white/90">
                        <Clock size={12} className="stroke-[2.5]" />
                        <span>{selectedArticle.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Article content body */}
                  <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    {/* Main Title */}
                    <h3 className="font-display font-black text-xl md:text-2xl text-slate-800 tracking-tight leading-snug">
                      {selectedArticle.title}
                    </h3>

                    {/* Summary Block quote */}
                    <div className="p-4 bg-orange-50/50 border-l-4 border-primary rounded-r-2xl">
                      <p className="text-xs text-slate-600 font-bold leading-relaxed">
                        {selectedArticle.summary}
                      </p>
                    </div>

                    {/* Rich Subsections list */}
                    <div className="space-y-5">
                      {selectedArticle.content.map((sec, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <h4 className="font-display font-black text-sm text-slate-800 tracking-tight flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                            {sec.heading}
                          </h4>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed pl-3.5">
                            {sec.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Medical disclosure disclaimer badge */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start text-[11px] text-slate-500 font-bold leading-relaxed">
                      <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>Thông tin này nhằm mục đích hướng dẫn chăm sóc nâng cao sức khoẻ hàng ngày. Vui lòng tham khảo ý kiến bác sĩ điều dưỡng chuyên khoa của bạn trước khi đưa ra bất kỳ thay đổi nào liên quan đến phác đồ y khoa hoặc thói quen dùng thuốc.</span>
                    </div>
                  </div>

                  {/* Reader Bottom CTA button bar */}
                  <div className="p-6 border-t border-slate-50 shrink-0 bg-slate-50/50">
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="w-full py-4 text-xs tracking-wider bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-center rounded-2xl cursor-pointer transition-colors"
                    >
                      Tôi đã hiểu & Xác nhận
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.getElementById('app-modal-portal') || document.body
      )}
    </div>
  );
};

const ServiceItem = ({ icon: Icon, label, sub, color, onClick }: any) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="flex flex-col items-start p-6 glass rounded-[2rem] text-left premium-shadow hover:bg-slate-50 transition-colors"
  >
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg", color)}>
      <Icon size={24} />
    </div>
    <h3 className="font-display font-black text-slate-800 text-xl leading-tight">{label}</h3>
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{sub}</p>
  </motion.button>
);

export default Dashboard;
