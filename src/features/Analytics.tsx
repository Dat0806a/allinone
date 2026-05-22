import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Heart, Zap, Calendar, ArrowUpRight, ArrowDownRight, Info, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PremiumCard, SectionHeader, cn } from '../components/premium/UI';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/useStore';

const Analytics: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newLog, setNewLog] = useState({ heart: '', systolic: '', diastolic: '', date: new Date().toISOString().split('T')[0] });
    const user = useUserStore(state => state.user);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        if (!user) return;
        const { data: logs, error } = await supabase
            .from('health_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: true })
            .limit(7);
        
        if (!error && logs) {
            setData(logs.map(log => ({
                day: new Date(log.date).toLocaleDateString('vi-VN'), // Hiển thị ngày/tháng thay vì thứ
                heart: log.heart_rate,
                bp: log.systolic_bp
            })));
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!user) {
            alert("Bạn cần đăng nhập để lưu dữ liệu.");
            return;
        }

        const h = parseInt(newLog.heart);
        const s = parseInt(newLog.systolic);
        const d = parseInt(newLog.diastolic);
        
        if (isNaN(h) || isNaN(s) || isNaN(d) || !newLog.date) {
            alert("Vui lòng nhập đầy đủ các số liệu và ngày!");
            return;
        }

        // Simple SpO2 estimate
        const spo2 = Math.max(90, 98 - (Math.max(0, s - 130) / 10 + Math.max(0, h - 90) / 5));

        const { data: savedData, error } = await supabase.from('health_logs').upsert([{
            user_id: user.id,
            date: newLog.date,
            heart_rate: h,
            systolic_bp: s,
            diastolic_bp: d,
            spo2_estimate: Math.round(spo2)
        }], { onConflict: 'user_id,date' });

        if (error) {
            console.error("Supabase insert error:", error);
            alert("Lỗi khi lưu dữ liệu: " + error.message);
        } else {
            setNewLog({ heart: '', systolic: '', diastolic: '', date: new Date().toISOString().split('T')[0] });
            fetchData(); // Refresh data immediately
        }
    };

    const getAIAnalysis = (log: any) => {
        const { heart, bp } = log;
        const recommendations: string[] = [];
        const warnings: string[] = [];

        if (heart > 90) {
            warnings.push("Tránh vận động mạnh ngay lúc này.");
            warnings.push("Hạn chế caffeine hoặc chất kích thích.");
            recommendations.push("Nghỉ ngơi yên tĩnh 15-20 phút.");
            recommendations.push("Hít thở sâu để ổn định nhịp tim.");
        } else if (heart < 60) {
            warnings.push("Tránh thay đổi tư thế đột ngột.");
            recommendations.push("Hoạt động nhẹ nhàng nếu cảm thấy khỏe.");
        } else {
            recommendations.push("Duy trì chế độ sinh hoạt hiện tại, bạn đang làm rất tốt.");
        }

        if (bp > 140) {
            warnings.push("Hạn chế thức ăn nhiều muối.");
            warnings.push("Tránh căng thẳng, lo âu.");
            recommendations.push("Theo dõi lại chỉ số sau 1 giờ.");
            recommendations.push("Nghỉ ngơi ở nơi thoáng mát.");
        }

        return {
            status: (warnings.length > 0) ? 'warning' : 'good',
            title: (warnings.length > 0) ? "Cần lưu ý sức khỏe" : "Chỉ số ổn định",
            recommendations,
            warnings
        };
    };

    return (
        <div className="space-y-10">
            {/* Input Form */}
            <PremiumCard className="p-6">
                <h3 className="text-lg font-bold mb-4">Nhập chỉ số hôm nay</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ngày</label>
                        <input type="date" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} className="w-full p-3 border rounded-xl border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nhịp tim (BPM)</label>
                        <input type="number" placeholder="e.g. 72" value={newLog.heart} onChange={e => setNewLog({...newLog, heart: e.target.value})} className="w-full p-3 border rounded-xl border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tâm thu (mmHg)</label>
                        <input type="number" placeholder="e.g. 120" value={newLog.systolic} onChange={e => setNewLog({...newLog, systolic: e.target.value})} className="w-full p-3 border rounded-xl border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tâm trương (mmHg)</label>
                        <input type="number" placeholder="e.g. 80" value={newLog.diastolic} onChange={e => setNewLog({...newLog, diastolic: e.target.value})} className="w-full p-3 border rounded-xl border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                </div>
                <button onClick={handleSave} className="mt-6 w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">Lưu thông tin</button>
            </PremiumCard>

            {/* Hero Stats */}
            {data.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    <StatCard 
                        icon={Heart} 
                        label="Nhịp tim" 
                        value={Math.round(data.reduce((acc, curr) => acc + curr.heart, 0) / data.length)} 
                        unit="BPM" 
                        trend="" 
                        color="text-red-500" 
                        bg="bg-red-50 text-red-500" 
                    />
                    <StatCard 
                        icon={Activity} 
                        label="Huyết áp" 
                        value={Math.round(data.reduce((acc, curr) => acc + curr.bp, 0) / data.length)} 
                        unit="mmHg" 
                        trend="" 
                        color="text-blue-500" 
                        bg="bg-blue-50 text-blue-500" 
                    />
                </div>
            )}

            {/* Main Chart */}
            {data.length > 0 && (
                <PremiumCard className="p-0 overflow-hidden border-none shadow-xl">
                    <div className="p-8 pb-0">
                        <h3 className="font-display font-bold text-xl">Dữ liệu tuần qua</h3>
                    </div>
                    <div className="h-64 mt-4 px-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#FF8A00" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip labelFormatter={(value) => `Ngày: ${value}`} />
                                <XAxis dataKey="day" hide />
                                <Area type="monotone" dataKey="heart" stroke="#FF8A00" strokeWidth={4} fill="url(#colorHeart)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </PremiumCard>
            )}

            {/* AI Insights */}
            {data.length > 0 && (() => {
                const latestLog = data[data.length - 1];
                const analysis = getAIAnalysis(latestLog);
                return (
                    <div className="space-y-6">
                        <SectionHeader title="Phân tích từ AI" />
                        <PremiumCard className={cn(
                            "p-6 border transition-all",
                            analysis.status === 'good' ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"
                        )}>
                             <h4 className="font-bold text-slate-800 mb-4">{analysis.title}</h4>

                             {analysis.recommendations.length > 0 && (
                                 <div className="mb-4">
                                     <p className="font-bold text-sm text-slate-700 mb-2">🟢 Lời khuyên:</p>
                                     <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                         {analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                     </ul>
                                 </div>
                             )}

                             {analysis.warnings.length > 0 && (
                                 <div>
                                     <p className="font-bold text-sm text-amber-800 mb-2">🟡 Điều cần tránh:</p>
                                     <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                         {analysis.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                                     </ul>
                                 </div>
                             )}
                        </PremiumCard>
                    </div>
                );
            })()}
        </div>
    );
};


const StatCard = ({ icon: Icon, label, value, unit, trend, up, bg, color }: any) => (
  <PremiumCard className="p-6">
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", bg)}>
      <Icon size={20} />
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-display font-bold text-slate-800">{value}</span>
      <span className="text-xs italic text-slate-400">{unit}</span>
    </div>
    <div className={cn(
      "flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider",
      up ? "text-green-500" : "text-red-500"
    )}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {trend} tuần này
    </div>
  </PremiumCard>
);

const InsightItem = ({ type, title, desc }: any) => (
  <div className={cn(
    "p-6 rounded-[2rem] border transition-all",
    type === 'good' ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"
  )}>
    <div className="flex items-center gap-3 mb-2">
      <div className={cn("w-2 h-2 rounded-full", type === 'good' ? "bg-green-500" : "bg-amber-500")} />
      <h4 className="font-bold text-slate-800 tracking-tight">{title}</h4>
    </div>
    <p className="text-sm text-slate-600 leading-relaxed font-medium">{desc}</p>
  </div>
);

export default Analytics;
