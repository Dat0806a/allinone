import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollLock } from '../hooks/useScrollLock';
import { 
  Coffee, 
  Apple, 
  Trash2, 
  Edit3, 
  Plus, 
  Sparkles, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Flame, 
  Check, 
  Info, 
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { useNutritionStore, MealItem, DayLog } from '../store/useNutritionStore';
import { useAppStore, useUserStore } from '../store/useStore';
import { PremiumCard, PremiumButton, SectionHeader, cn } from '../components/premium/UI';

// Session configuration for translation and visual icons
const SESSION_CONFIG = {
  breakfast: {
    label: "Bữa sáng",
    time: "06:00 - 09:00",
    icon: Coffee,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50/60 border-amber-100",
    textColor: "text-amber-700",
    iconColor: "text-amber-500"
  },
  lunch: {
    label: "Bữa trưa",
    time: "11:30 - 13:30",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615 3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615M3.75 9.349l.068-.006c.03-.002.06-.004.09-.006a1.5 1.5 0 0 0 1.251-1.251c.002-.03.004-.06.006-.09V3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v4.242c0 .285.03.568.089.847a1.5 1.5 0 0 0 1.251 1.251c.03.002.06.004.09.006L9.75 9.35l.068-.006c.03-.002.06-.004.09-.006a1.5 1.5 0 0 0 1.251-1.251c.002-.03.004-.06.006-.09V3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v4.242c0 .285.03.568.089.847a1.5 1.5 0 0 0 1.251 1.251c.03.002.06.004.09.006l.069.005V21M18 9.35l.068-.006c.03-.002.06-.004.09-.006a1.5 1.5 0 0 0 1.251-1.251c.002-.03.004-.06.006-.09V6H18V3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v4.242c0 .285.03.568.089.847a1.5 1.5 0 0 0 1.251 1.251c.03.002.06.004.09.006l.069.005" />
      </svg>
    ),
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50/60 border-emerald-100",
    textColor: "text-emerald-700",
    iconColor: "text-emerald-500"
  },
  snack: {
    label: "Bữa chiều / Phụ",
    time: "15:00 - 16:30",
    icon: Apple,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-rose-50/60 border-rose-100",
    textColor: "text-rose-700",
    iconColor: "text-rose-500"
  },
  dinner: {
    label: "Bữa tối",
    time: "18:00 - 20:30",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
      </svg>
    ),
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-indigo-50/60 border-indigo-100",
    textColor: "text-indigo-700",
    iconColor: "text-indigo-500"
  }
};

const Nutrition: React.FC = () => {
  const { user } = useUserStore();
  const userId = user?.id || 'anonymous';
  const { 
    logsByUser, 
    selectedDate, 
    targetCalories, 
    setSelectedDate, 
    setTargetCalories,
    addMealItem, 
    updateMealItem, 
    deleteMealItem 
  } = useNutritionStore();

  const logs = logsByUser[userId] || {};

  const { setActiveTab } = useAppStore();

  // Dialog State Management
  const [activeModal, setActiveModal] = useState<'add_ai' | 'add_manual' | 'edit_item' | 'set_target' | null>(null);
  const [activeSession, setActiveSession] = useState<'breakfast' | 'lunch' | 'snack' | 'dinner' | null>(null);
  
  // Manual & Edit Form states
  const [formName, setFormName] = useState('');
  const [formPortion, setFormPortion] = useState('');
  const [formCalories, setFormCalories] = useState('');
  const [formProtein, setFormProtein] = useState('');
  const [formCarbs, setFormCarbs] = useState('');
  const [formFat, setFormFat] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formQuantity, setFormQuantity] = useState('1');
  const [formUnit, setFormUnit] = useState('phần');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [isEstimatingCalories, setIsEstimatingCalories] = useState(false);
  const lastEstimatedQueryRef = React.useRef('');

  // AI assistant form states
  const [aiQuery, setAiQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiPreviewItems, setAiPreviewItems] = useState<any[] | null>(null);
  
  // Custom manual calendar toggle state
  const [showDatePickerInput, setShowDatePickerInput] = useState(false);

  // Input References for auto-focusing
  const aiInputRef = React.useRef<HTMLTextAreaElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (activeModal === 'add_ai') {
      setTimeout(() => {
        aiInputRef.current?.focus();
      }, 150);
    } else if (activeModal === 'add_manual') {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
    }
  }, [activeModal]);

  // Generate 7 days of horizontal calendar for slick mobile navigations
  const getWeekDays = () => {
    const days = [];
    const baseDate = new Date(selectedDate);
    
    // Create an offset range centered around selected Date
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateVal = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${dateVal}`;
      
      const weekdayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      days.push({
        dateString,
        dayNum: d.getDate(),
        dayLabel: weekdayNames[d.getDay()],
        isToday: dateString === "2026-05-20"
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Selected Day log info
  const dayLog: DayLog = logs[selectedDate] || { breakfast: [], lunch: [], snack: [], dinner: [] };

  // Advanced calculation of macronutrient values for entire selected day
  const calculateSession = (items: MealItem[]) => {
    return items.reduce(
      (acc, val) => {
        acc.calories += val.calories;
        acc.protein += val.protein;
        acc.carbs += val.carbs;
        acc.fat += val.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const totals = {
    breakfast: calculateSession(dayLog.breakfast),
    lunch: calculateSession(dayLog.lunch),
    snack: calculateSession(dayLog.snack),
    dinner: calculateSession(dayLog.dinner),
  };

  const totalCalories = totals.breakfast.calories + totals.lunch.calories + totals.snack.calories + totals.dinner.calories;
  const totalProtein = Number((totals.breakfast.protein + totals.lunch.protein + totals.snack.protein + totals.dinner.protein).toFixed(1));
  const totalCarbs = Number((totals.breakfast.carbs + totals.lunch.carbs + totals.snack.carbs + totals.dinner.carbs).toFixed(1));
  const totalFat = Number((totals.breakfast.fat + totals.lunch.fat + totals.snack.fat + totals.dinner.fat).toFixed(1));

  // Balanced reference target macros
  const targetProtein = Math.round((targetCalories * 0.25) / 4);
  const targetCarbs = Math.round((targetCalories * 0.50) / 4);
  const targetFat = Math.round((targetCalories * 0.25) / 9);

  // Clean form resets
  const resetFormFields = () => {
    setFormName('');
    setFormPortion('');
    setFormQuantity('1');
    setFormUnit('phần');
    setFormCalories('');
    setFormProtein('');
    setFormCarbs('');
    setFormFat('');
    setFormNotes('');
    setEditingItemId(null);
    setAiQuery('');
    setAnalysisError(null);
    setAiPreviewItems(null);
    setShowAdvancedStats(false);
  };

  // Scroll lock when any modal is opened
  useScrollLock(!!activeModal);

  // Auto-estimate calories and macros using server-side Gemini API when manual inputs change
  useEffect(() => {
    if (activeModal !== 'add_manual' && activeModal !== 'edit_item') {
      lastEstimatedQueryRef.current = '';
      return;
    }

    const name = formName.trim();
    const qty = formQuantity.trim();
    const unit = formUnit.trim();

    if (!name || !qty || !unit) {
      return;
    }

    const query = `${qty} ${unit} ${name}`.trim();

    // Avoid duplicating the API request if we already analyzed this exact string
    if (lastEstimatedQueryRef.current === query) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsEstimatingCalories(true);
      try {
        const res = await fetch('/api/nutrition/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.totalCalories !== undefined) {
              setFormCalories(String(data.totalCalories));
            }
            if (data.totalProtein !== undefined) {
              setFormProtein(String(data.totalProtein));
            }
            if (data.totalCarbs !== undefined) {
              setFormCarbs(String(data.totalCarbs));
            }
            if (data.totalFat !== undefined) {
              setFormFat(String(data.totalFat));
            }
            if (data.items?.[0]?.notes) {
              setFormNotes(data.items[0].notes);
            }
            lastEstimatedQueryRef.current = query;
          }
        }
      } catch (err) {
        console.error('Lỗi khi tự động ước lượng calo từ AI:', err);
      } finally {
        setIsEstimatingCalories(false);
      }
    }, 1000); // 1-second debounce to provide typing layout comfort

    return () => clearTimeout(timer);
  }, [formName, formQuantity, formUnit, activeModal]);

  // Open Add Manual Modal
  const handleOpenAddManual = (session: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    resetFormFields();
    setActiveSession(session);
    setActiveModal('add_manual');
    setFormQuantity('1');
    setFormUnit('phần');
  };

  // Open Add AI Modal
  const handleOpenAddAI = (session: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    resetFormFields();
    setActiveSession(session);
    setActiveModal('add_ai');
  };

  // Open Edit Modal
  const handleOpenEditItem = (
    session: 'breakfast' | 'lunch' | 'snack' | 'dinner',
    item: MealItem
  ) => {
    setActiveSession(session);
    setEditingItemId(item.id);
    setFormName(item.name);
    
    // Parse portion into quantity & unit safely
    const portionStr = item.portion.trim();
    const match = portionStr.match(/^([\d.,]+)\s*(.*)$/);
    let qty = '1';
    let uni = 'phần';
    if (match) {
      qty = match[1];
      uni = match[2] || 'phần';
      setFormQuantity(qty);
      setFormUnit(uni);
    } else {
      qty = '1';
      uni = portionStr || 'phần';
      setFormQuantity('1');
      setFormUnit(portionStr || 'phần');
    }

    lastEstimatedQueryRef.current = `${qty} ${uni} ${item.name.trim()}`.trim();

    setFormCalories(String(item.calories));
    setFormProtein(String(item.protein));
    setFormCarbs(String(item.carbs));
    setFormFat(String(item.fat));
    setFormNotes(item.notes || '');
    setActiveModal('edit_item');
  };

  // Save manual added food logs
  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !activeSession) return;

    const calorieVal = parseInt(formCalories) || 0;
    const proteinVal = parseFloat(formProtein) || 0;
    const carbsVal = parseFloat(formCarbs) || 0;
    const fatVal = parseFloat(formFat) || 0;

    const q = formQuantity.trim() || '1';
    const u = formUnit.trim() || 'phần';

    addMealItem(userId, selectedDate, activeSession, {
      name: formName,
      portion: `${q} ${u}`,
      calories: calorieVal,
      protein: proteinVal,
      carbs: carbsVal,
      fat: fatVal,
      notes: formNotes
    });

    setActiveModal(null);
    resetFormFields();
  };

  // Update existing food details
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemId || !activeSession || !formName) return;

    const calorieVal = parseInt(formCalories) || 0;
    const proteinVal = parseFloat(formProtein) || 0;
    const carbsVal = parseFloat(formCarbs) || 0;
    const fatVal = parseFloat(formFat) || 0;

    const q = formQuantity.trim() || '1';
    const u = formUnit.trim() || 'phần';

    updateMealItem(userId, selectedDate, activeSession, editingItemId, {
      name: formName,
      portion: `${q} ${u}`,
      calories: calorieVal,
      protein: proteinVal,
      carbs: carbsVal,
      fat: fatVal,
      notes: formNotes
    });

    setActiveModal(null);
    resetFormFields();
  };

  // Trigger server-side AI parsing agent
  const handleAnalyzeAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || !activeSession) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiPreviewItems(null);

    try {
      const res = await fetch('/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery.trim() })
      });

      if (!res.ok) {
        throw new Error('Không thể tải phân tích từ AI. Hãy thử lại.');
      }

      const data = await res.json();
      
      if (data && data.items && data.items.length > 0) {
        setAiPreviewItems(data.items);
      } else {
        throw new Error('AI không nhận dạng được món ăn. Hãy ghi chi tiết hơn.');
      }

    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Đã xảy ra lỗi kết nối AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAddAIResult = () => {
    if (!aiPreviewItems || !activeSession) return;

    aiPreviewItems.forEach((food: any) => {
      addMealItem(userId, selectedDate, activeSession, {
        name: food.name,
        portion: food.portion,
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
        notes: food.notes || ""
      });
    });

    setActiveModal(null);
    resetFormFields();
  };

  // Shift selectedDate by number of days
  const shiftSelectedDate = (daysCount: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + daysCount);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  // Trigger quick examples to ease senior or mobile user typing
  const setQuickExample = (text: string) => {
    setAiQuery(text);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header layout */}
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md rounded-2xl p-2 pr-16 sm:pr-2 mb-4 border border-white/30 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-200/60 cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0"
            title="Quay lại"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="space-y-1">
            <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5 select-none">
              <Sparkles size={11} className="animate-pulse" /> Trợ lý sức khỏe AI
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-black text-slate-800 tracking-tight leading-none">Dinh Dưỡng</h1>
              <button 
                onClick={() => {
                  setFormCalories(String(targetCalories));
                  setActiveModal('set_target');
                }}
                className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-primary transition-all border border-slate-200/60 hover:border-orange-200/60 cursor-pointer shadow-sm active:scale-95 shrink-0"
                title="Cài đặt mục tiêu dinh dưỡng"
              >
                <Settings size={11} className="text-slate-500 hover:text-primary shrink-0" />
                <span>Chỉ tiêu: {targetCalories} kcal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigator Slider & Visual Calendar picker */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-4">
        {/* Current Date & trigger buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => shiftSelectedDate(-1)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Ngày trước"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center gap-1.5 px-1">
              <Calendar size={16} className="text-primary" />
              <span className="font-display font-black text-sm sm:text-base text-slate-800 select-none">
                {selectedDate === "2026-05-20" ? "Hôm nay, " : ""}
                {(() => {
                  const parts = selectedDate.split("-");
                  return `${parts[2]}/${parts[1]}/${parts[0]}`;
                })()}
              </span>
            </div>

            <button 
              onClick={() => shiftSelectedDate(1)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Ngày sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={() => setShowDatePickerInput(!showDatePickerInput)}
            className={cn(
              "px-3 py-1.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all border cursor-pointer",
              showDatePickerInput 
                ? "bg-slate-100 text-slate-700 border-transparent shadow-inner" 
                : "bg-orange-50 text-primary border-orange-100 hover:bg-orange-100/80"
            )}
          >
            Lịch Chọn
          </button>
        </div>

        {/* Date picking calendar field */}
        {showDatePickerInput && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 shadow-inner"
          >
            <span className="text-xs font-bold text-slate-600 pl-1 select-none">Tìm nhanh theo ngày:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setShowDatePickerInput(false);
                }
              }}
              className="bg-white border-2 border-slate-200/85 outline-none rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:border-primary transition-colors cursor-pointer"
            />
          </motion.div>
        )}

        {/* Horizontal Slide calendar picker */}
        <div className="grid grid-cols-7 gap-1 pt-3.5 border-t border-slate-100 select-none">
          {weekDays.map((day) => {
            const isSelected = day.dateString === selectedDate;
            return (
              <button
                key={day.dateString}
                onClick={() => setSelectedDate(day.dateString)}
                className={cn(
                  "flex flex-col items-center py-2 rounded-xl transition-all relative overflow-hidden cursor-pointer",
                  isSelected 
                    ? "bg-primary text-white scale-102 shadow-md shadow-primary/20" 
                    : "hover:bg-slate-50/80 text-slate-600"
                )}
              >
                <span className={cn(
                  "text-[9px] font-black tracking-wider uppercase mb-1",
                  isSelected ? "text-orange-100/90" : "text-slate-400"
                )}>
                  {day.dayLabel}
                </span>
                <span className="text-base font-display font-black leading-none">
                  {day.dayNum}
                </span>
                
                {/* Visual marker of actual today */}
                {day.isToday && (
                  <div className={cn(
                    "w-1 h-1 rounded-full mt-1.5",
                    isSelected ? "bg-orange-150" : "bg-primary"
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Calories Calculation and Macromolecules Summary Board */}
      <PremiumCard className="relative overflow-hidden border-orange-100/65 shadow-sm p-5 sm:p-6" hover={false}>
        {/* Background gradient layout decoration */}
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full -mr-6 -mt-6 pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-center">
          {/* Main calorie progress reading */}
          <div className="md:col-span-2 space-y-1 content-center md:border-r border-slate-100/80 md:pr-4">
            <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase select-none">Năng lượng nạp vào</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-4xl min-[360px]:text-5xl font-display font-black text-slate-900 tracking-tight leading-none">
                {totalCalories}
              </span>
              <span className="text-slate-400 text-sm sm:text-base font-bold">/ {targetCalories} kcal</span>
            </div>

            {/* Calories balance math info */}
            <div className="text-xs font-bold text-slate-500 pt-1.5 flex items-center gap-1.5 select-none-all">
              <Flame size={14} className="text-primary shrink-0" />
              {totalCalories <= targetCalories ? (
                <span className="text-[11px] sm:text-xs">Còn lại <strong className="text-slate-700 font-extrabold">{targetCalories - totalCalories} kcal</strong></span>
              ) : (
                <span className="text-red-500 font-bold text-[11px] sm:text-xs">Vượt mục tiêu {totalCalories - targetCalories} kcal!</span>
              )}
            </div>
            
            {/* Horizontal progress bar */}
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3.5 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                  "h-full rounded-full transition-all progress-glow",
                  totalCalories > targetCalories ? "bg-red-500" : "bg-primary"
                )}
              />
            </div>
          </div>

          {/* Macronutrients distribution bars */}
          <div className="md:col-span-3 grid grid-cols-3 gap-2 sm:gap-3">
            {/* Protein Card */}
            <div className="bg-slate-50 rounded-2xl p-2.5 min-[375px]:p-3 sm:p-4 border border-slate-100 space-y-2 flex flex-col justify-between min-w-0">
              <div className="flex justify-between items-center select-none">
                <span className="text-[9px] min-[360px]:text-[10px] font-black text-slate-500 uppercase tracking-wider block whitespace-nowrap truncate leading-0">Đạm (Prot)</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-base min-[360px]:text-xl font-display font-black text-orange-950 block truncate leading-tight">{totalProtein}g</span>
                <span className="text-[9px] min-[360px]:text-[10px] font-bold text-slate-400 block truncate">Mục tiêu: {targetProtein}g</span>
              </div>
              <div className="h-1 bg-slate-200/70 rounded-full overflow-hidden shrink-0 mt-0.5">
                <div 
                  className="h-full bg-orange-500 rounded-full" 
                  style={{ width: `${Math.min((totalProtein / targetProtein) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbohydrate Card */}
            <div className="bg-slate-50 rounded-2xl p-2.5 min-[375px]:p-3 sm:p-4 border border-slate-100 space-y-2 flex flex-col justify-between min-w-0">
              <div className="flex justify-between items-center select-none">
                <span className="text-[9px] min-[360px]:text-[10px] font-black text-slate-500 uppercase tracking-wider block whitespace-nowrap truncate leading-0">Đường (Carb)</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-base min-[360px]:text-xl font-display font-black text-amber-950 block truncate leading-tight">{totalCarbs}g</span>
                <span className="text-[9px] min-[360px]:text-[10px] font-bold text-slate-400 block truncate">Mục tiêu: {targetCarbs}g</span>
              </div>
              <div className="h-1 bg-slate-200/70 rounded-full overflow-hidden shrink-0 mt-0.5">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${Math.min((totalCarbs / targetCarbs) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fat Card */}
            <div className="bg-slate-50 rounded-2xl p-2.5 min-[375px]:p-3 sm:p-4 border border-slate-100 space-y-2 flex flex-col justify-between min-w-0">
              <div className="flex justify-between items-center select-none">
                <span className="text-[9px] min-[360px]:text-[10px] font-black text-slate-500 uppercase tracking-wider block whitespace-nowrap truncate leading-0">Béo (Fat)</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-base min-[360px]:text-xl font-display font-black text-rose-950 block truncate leading-tight">{totalFat}g</span>
                <span className="text-[9px] min-[360px]:text-[10px] font-bold text-slate-400 block truncate">Mục tiêu: {targetFat}g</span>
              </div>
              <div className="h-1 bg-slate-200/70 rounded-full overflow-hidden shrink-0 mt-0.5">
                <div 
                  className="h-full bg-rose-500 rounded-full" 
                  style={{ width: `${Math.min((totalFat / targetFat) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Main Meal Session Blocks */}
      <div>
        <SectionHeader title="Các bữa ăn trong ngày" />
        
        <div className="space-y-6 pt-1.5">
          {(Object.keys(SESSION_CONFIG) as Array<'breakfast' | 'lunch' | 'snack' | 'dinner'>).map((sessionKey) => {
            const config = SESSION_CONFIG[sessionKey];
            const sessionItems = dayLog[sessionKey] || [];
            const sessionTotals = calculateSession(sessionItems);
            const SessionIcon = config.icon;

            return (
              <div 
                key={sessionKey}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
              >
                {/* Header of session section */}
                <div className="p-4 sm:p-5 border-b border-slate-50 flex items-center justify-between gap-2 bg-gradient-to-r from-slate-50/40 via-white to-transparent">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("p-2 rounded-xl bg-gradient-to-br text-white shadow-sm shrink-0", config.color)}>
                      <SessionIcon />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-black text-[15px] sm:text-base text-slate-800 leading-tight truncate">
                        {config.label}
                      </h3>
                      <span className="text-[10px] font-medium text-slate-400 select-none block truncate mt-0.5">
                        {config.time}
                      </span>
                    </div>
                  </div>

                  {/* Kcal indicator & visual insertion buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right select-none pr-0.5">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tổng nạp</p>
                      <p className="font-display font-black text-slate-700 text-sm sm:text-base leading-none mt-0.5">{sessionTotals.calories} kcal</p>
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-slate-100 pl-2.5">
                      {/* AI Button first */}
                      <button 
                        onClick={() => handleOpenAddAI(sessionKey)}
                        className="p-2 rounded-xl text-primary bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer flex items-center justify-center shadow-sm"
                        title="Thêm nhanh bằng trợ lý AI"
                      >
                        <Sparkles size={15} />
                      </button>
                      
                      {/* Plus manual addition */}
                      <button 
                        onClick={() => handleOpenAddManual(sessionKey)}
                        className="p-2 rounded-xl text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border border-slate-100 shadow-sm"
                        title="Tự thêm món thủ công"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body lists containing food logs */}
                <div className="p-4 sm:p-5 space-y-3.5 bg-slate-50/30">
                  {sessionItems.length === 0 ? (
                    <div className="py-6 sm:py-8 text-center space-y-2 select-none">
                      <p className="text-xs sm:text-sm font-bold text-slate-400">Bữa này chưa có thực đơn lưu lại</p>
                      <button 
                        onClick={() => handleOpenAddAI(sessionKey)}
                        className="text-[11px] font-black text-primary hover:text-orange-600 hover:underline uppercase tracking-wider inline-flex items-center gap-1 leading-none bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-full cursor-pointer transition-colors shadow-sm"
                      >
                        <Sparkles size={11} className="animate-pulse" /> Thêm nhanh bằng AI
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessionItems.map((item) => (
                        <div 
                          key={item.id}
                          className="bg-white rounded-2xl p-4 border border-slate-100 flex justify-between items-center gap-3 hover:shadow-lg hover:border-slate-200 transition-all group"
                        >
                          {/* Left text description column */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                              <h4 className="font-display font-extrabold text-slate-800 text-sm sm:text-base leading-snug break-words truncate max-w-[140px] min-[375px]:max-w-[180px] sm:max-w-none" title={item.name}>
                                {item.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none">
                                {item.portion}
                              </span>
                            </div>
                            
                            {/* Macros labels for item */}
                            <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11px] text-slate-400 font-bold select-none">
                              <span>Đạm: <strong className="text-orange-600 font-black">{item.protein}g</strong></span>
                              <span className="text-slate-200">•</span>
                              <span>Carb: <strong className="text-amber-600 font-black">{item.carbs}g</strong></span>
                              <span className="text-slate-200">•</span>
                              <span>Béo: <strong className="text-rose-600 font-black">{item.fat}g</strong></span>
                            </div>

                            {/* Optional notes for estimating references */}
                            {item.notes && (
                              <p className="text-[10px] text-slate-500 bg-slate-50/80 rounded-lg px-2.5 py-1 inline-block mt-1 font-medium italic border-l-2 border-primary/45 leading-relaxed max-w-full break-words">
                                {item.notes}
                              </p>
                            )}
                          </div>

                          {/* Controls column to delete or update item card */}
                          <div className="flex items-center gap-2 shrink-0 select-none">
                            <span className="font-display font-black text-slate-800 text-sm sm:text-base text-right whitespace-nowrap pr-1">
                              {item.calories} <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">kcal</span>
                            </span>
                            
                            <div className="flex items-center gap-0.5 border-l border-slate-150 pl-2">
                              <button
                                onClick={() => handleOpenEditItem(sessionKey, item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-orange-50 transition-colors opacity-70 md:opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center"
                                title="Sửa món"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn chắc muốn xóa ${item.name}?`)) {
                                    deleteMealItem(userId, selectedDate, sessionKey, item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-70 md:opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center"
                                title="Xóa món"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DIALOG POPUPS & DRAWER INTERFACES */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeModal && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-hidden">
              
              {/* Modal Glass backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0"
                onClick={() => {
                  if (!isAnalyzing) setActiveModal(null);
                }}
              />

              {/* Modal Container */}
              <motion.div
                initial={{ scale: 0.93, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.93, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 26, stiffness: 360 }}
                className="bg-white w-full max-w-sm rounded-[2rem] p-6 relative border border-slate-100 shadow-2xl z-20 pointer-events-auto flex flex-col justify-between max-h-[85vh] overflow-y-auto custom-scrollbar my-auto"
              >
              
              {/* Close handle button */}
              <button 
                onClick={() => setActiveModal(null)}
                disabled={isAnalyzing}
                className="absolute right-5 top-5 p-1.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
              >
                <X size={18} />
              </button>

              {/* 1. Modal Set Target calories */}
              {activeModal === 'set_target' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-2xl bg-orange-100/70 text-primary">
                      <Settings size={20} />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-lg text-slate-800">Cài đặt mục tiêu Calo</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hương vị & Sinh dưỡng</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const val = parseInt(formCalories) || 2000;
                    setTargetCalories(val);
                    setActiveModal(null);
                  }} className="space-y-4 pt-1">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">Số Calo mục tiêu cả ngày (kcal):</label>
                      <input 
                        type="number"
                        required
                        value={formCalories}
                        onChange={(e) => setFormCalories(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200/80 focus:border-primary focus:bg-white rounded-xl py-3 px-4 text-lg font-display font-black text-slate-800 outline-none transition-all"
                        placeholder="Ví dụ: 2000"
                        min="1000"
                        max="8000"
                      />
                    </div>
                    
                    <div className="bg-orange-50/80 rounded-2xl p-4 border border-orange-100/50 text-xs text-slate-600 leading-relaxed text-left flex items-start gap-2">
                      <Info className="text-primary shrink-0 mt-0.5" size={15} />
                      <div>
                        Để bảo vệ sức khỏe, người lớn tuổi hoặc trung niên nên bổ sung từ 1600 - 2200 kcal/ngày tùy cơ địa trạng thái. Tỷ lệ dưỡng chất chuẩn vàng khuyến nghị là:
                        <ul className="list-disc pl-4 mt-1 space-y-0.5 font-bold text-slate-700">
                          <li>25% Đạm (tương đương ~125g)</li>
                          <li>50% Đường bột (tương đương ~250g)</li>
                          <li>25% Chất béo tốt (tương đương ~55g)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button 
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors text-sm cursor-pointer"
                      >
                        Hủy
                      </button>
                      <PremiumButton 
                        type="submit"
                        className="flex-1 py-3 text-sm"
                      >
                        Lưu thiết lập
                      </PremiumButton>
                    </div>
                  </form>
                </div>
              )}

              {/* 2. Modal Add AI intelligent analysis */}
              {activeModal === 'add_ai' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-orange-100/70 text-primary">
                      <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-lg text-slate-800">
                        Cấu trúc dinh dưỡng AI
                      </h4>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                        Bữa ăn: {activeSession && SESSION_CONFIG[activeSession]?.label}
                      </p>
                    </div>
                  </div>

                  {aiPreviewItems ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs font-bold text-slate-500 leading-normal bg-orange-50/50 border border-orange-100/50 rounded-xl p-3">
                        ✨ AI đã nhận diện và phân tích chi tiết lượng dinh dưỡng dưới đây. Bạn có muốn thêm những món này vào thực đơn không?
                      </p>

                      <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                        {aiPreviewItems.map((food, index) => (
                          <div 
                            key={index}
                            className="bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 transition-all"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-display font-extrabold text-sm text-slate-800 leading-tight">
                                {food.name}
                              </h5>
                              <span className="font-display font-black text-xs text-primary leading-none shrink-0 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                                {food.calories || 0} kcal
                              </span>
                            </div>
                            
                            <div className="text-[11px] text-slate-500 font-bold">
                              Khẩu phần: <strong className="text-slate-700 font-extrabold">{food.portion}</strong>
                            </div>
                            
                            {/* Nutrients badge layout */}
                            <div className="grid grid-cols-3 gap-1 bg-white/70 rounded-lg p-1.5 border border-slate-100 text-[10px] font-bold text-center">
                              <div>
                                <span className="text-slate-400 block pb-0.5">Đạm (Protein)</span>
                                <strong className="text-orange-600 text-xs font-extrabold block">{food.protein || 0}g</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block pb-0.5">Đường (Carb)</span>
                                <strong className="text-amber-600 text-xs font-extrabold block">{food.carbs || 0}g</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block pb-0.5">Béo (Fat)</span>
                                <strong className="text-rose-600 text-xs font-extrabold block">{food.fat || 0}g</strong>
                              </div>
                            </div>

                            {food.notes && (
                              <p className="text-[10px] text-slate-500 italic leading-snug bg-white/40 p-1.5 rounded-md border-l-2 border-orange-200 pl-2">
                                {food.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Summary Calculation of all previewed cards */}
                      {aiPreviewItems.length > 1 && (
                        <div className="bg-slate-100/60 rounded-xl p-3 flex justify-between items-center text-xs font-bold text-slate-700">
                          <span>Tổng cộng ({aiPreviewItems.length} món):</span>
                          <span className="font-display font-black text-slate-900">
                            {aiPreviewItems.reduce((acc, f) => acc + (f.calories || 0), 0)} kcal • {Number(aiPreviewItems.reduce((acc, f) => acc + (f.protein || 0), 0).toFixed(1))}g đạm
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-2">
                        <button 
                          type="button"
                          onClick={() => setAiPreviewItems(null)}
                          className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all text-sm cursor-pointer border border-slate-100 active:scale-95 text-center"
                        >
                          Hủy / Sửa lại
                        </button>
                        <PremiumButton 
                          onClick={handleConfirmAddAIResult}
                          className="flex-1 py-3 text-sm flex items-center justify-center gap-1.5 font-bold shadow-md shadow-primary/10"
                        >
                          <Check size={14} className="stroke-[3]" /> Thêm thực đơn
                        </PremiumButton>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleAnalyzeAI} className="space-y-4 pt-1">
                      <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-bold text-slate-500 flex justify-between">
                          <span>Nhập món bạn đã nạp (bằng lời nói/text):</span>
                        </label>
                        <textarea
                          ref={aiInputRef}
                          required
                          disabled={isAnalyzing}
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200/80 focus:border-primary focus:bg-white rounded-xl p-3 text-sm font-medium text-slate-800 outline-none min-h-[90px] placeholder:text-slate-400 placeholder:opacity-60 leading-relaxed transition-all resize-none"
                          placeholder="Ví dụ: '1 dĩa cơm sườn trứng ốp la và 1 ly trà đá' hoặc '1 chén cháo yến mạch và 1 hũ sữa chua'"
                        />
                      </div>

                      {/* Quick Suggestions template links */}
                      {!isAnalyzing && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5 select-none">Gợi ý nhanh:</p>
                          <div className="flex flex-col gap-1.5">
                            {[
                              "1 bát phở gà ta ít bánh nhiều giá luộc",
                              "1 ổ bánh mì xíu mại trứng ốp la",
                              "150g ức gà hấp xé phay với súp lơ xanh",
                              "1 ly sữa ngũ cốc hạt lanh nguyên chất"
                            ].map((exampleText, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setQuickExample(exampleText)}
                                className="text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-orange-50 hover:text-primary rounded-xl border border-slate-100 transition-colors text-slate-600 text-left truncate w-full cursor-pointer hover:border-orange-100"
                              >
                                "{exampleText}"
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Error status reporting */}
                      {analysisError && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 text-center">
                          ⚠️ {analysisError}
                        </div>
                      )}

                      {/* Dynamic Loader messages */}
                      {isAnalyzing ? (
                        <div className="py-6 flex flex-col items-center justify-center space-y-3 bg-orange-50/50 rounded-xl border border-orange-100/40 shadow-inner">
                          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                          <div className="text-center px-4">
                            <p className="text-xs font-black text-primary animate-pulse">AI đang bóc tách phân tích...</p>
                            <p className="text-[10px] font-medium text-slate-500 max-w-xs mt-1 leading-relaxed">
                              Đang phân tích cấu trúc Kcal, Carb, Protein và Chất béo theo chuẩn an toàn quốc gia. Vui lòng chờ!
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2.5 pt-2">
                          <button 
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors text-sm cursor-pointer"
                          >
                            Hủy
                          </button>
                          <PremiumButton 
                            type="submit"
                            className="flex-1 py-3 text-sm flex items-center justify-center gap-1.5"
                          >
                            <Sparkles size={14} /> Phân tích AI
                          </PremiumButton>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              )}

              {/* 3. Modal Add manually */}
              {activeModal === 'add_manual' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-orange-100/70 text-primary">
                      <PlusCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-lg text-slate-800">Thêm thủ công</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Bữa ăn: {activeSession && SESSION_CONFIG[activeSession]?.label}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveManual} className="space-y-4.5 pt-1">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 block">Tên món ăn hoặc thực phẩm *:</label>
                        <input 
                          ref={nameInputRef}
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 transition-all text-sm animate-none"
                          placeholder="Ví dụ: Phở bò chín, Sữa tươi không đường"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 block">Số lượng *:</label>
                        <input 
                          type="number"
                          required
                          step="any"
                          value={formQuantity}
                          onChange={(e) => setFormQuantity(e.target.value)}
                          className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 transition-all text-sm"
                          placeholder="Số lượng"
                          min="0.01"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 block">Đơn vị *:</label>
                        <input 
                          type="text"
                          required
                          value={formUnit}
                          onChange={(e) => setFormUnit(e.target.value)}
                          className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 transition-all text-sm"
                          placeholder="Ví dụ: bát, quả, hũ, g"
                        />
                      </div>

                      <div className="col-span-2 space-y-1 relative">
                        <div className="flex justify-between items-center pr-1">
                          <label className="text-[11px] font-bold text-slate-500 block">
                            Năng lượng (Calo - kcal) *:
                          </label>
                          {isEstimatingCalories ? (
                            <span className="text-[10px] text-primary font-bold animate-pulse flex items-center gap-0.5 select-none">
                              <Sparkles size={11} className="animate-spin" /> AI đang nạp tính...
                            </span>
                          ) : lastEstimatedQueryRef.current && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 select-none animate-fadeIn">
                              <Check size={11} /> AI tự động ước lượng
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input 
                            type="number"
                            required
                            value={formCalories}
                            onChange={(e) => {
                              setFormCalories(e.target.value);
                              lastEstimatedQueryRef.current = '';
                            }}
                            className={cn(
                              "w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 transition-all text-sm pr-10",
                              isEstimatingCalories && "border-primary/45 bg-orange-50/20"
                            )}
                            placeholder="Calo nạp"
                            min="0"
                          />
                          {isEstimatingCalories && (
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Advanced stats expander toggling action */}
                      <div className="col-span-2 pt-0.5 select-none">
                        <button
                          type="button"
                          onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                          className="text-[10px] font-black text-primary hover:text-orange-600 flex items-center gap-1 transition-colors uppercase tracking-wider focus:outline-none cursor-pointer"
                        >
                          {showAdvancedStats ? "Thu gọn chỉ số ▲" : "Chi tiết bổ sung (Đạm, Carb, Béo, Ghi chú) ▾"}
                        </button>
                      </div>

                      {showAdvancedStats && (
                        <div className="col-span-2 grid grid-cols-3 gap-2.5 pt-0.5 animate-fadeIn">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">Đạm (Prot-g):</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={formProtein}
                              onChange={(e) => setFormProtein(e.target.value)}
                              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-2.5 py-2 outline-none font-bold text-slate-700 text-xs transition-all"
                              placeholder="g"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">Carbs (g):</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={formCarbs}
                              onChange={(e) => setFormCarbs(e.target.value)}
                              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-2.5 py-2 outline-none font-bold text-slate-700 text-xs transition-all"
                              placeholder="g"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">Béo (Fat-g):</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={formFat}
                              onChange={(e) => setFormFat(e.target.value)}
                              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-2.5 py-2 outline-none font-bold text-slate-700 text-xs transition-all"
                              placeholder="g"
                            />
                          </div>

                          <div className="col-span-3 space-y-1 pt-0.5">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">Ghi chú dinh dưỡng thêm:</label>
                            <input 
                              type="text"
                              value={formNotes}
                              onChange={(e) => setFormNotes(e.target.value)}
                              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-3 py-2 outline-none font-bold text-slate-700 text-xs transition-all"
                              placeholder="Ví dụ: không cho đường bột, ít béo..."
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2.5 pt-3">
                      <button 
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors text-sm cursor-pointer"
                      >
                        Hủy
                      </button>
                      <PremiumButton 
                        type="submit"
                        className="flex-1 py-3 text-sm shadow-sm"
                      >
                        Thêm vào thực đơn
                      </PremiumButton>
                    </div>
                  </form>
                </div>
              )}

              {/* 4. Modal Edit custom Item */}
              {activeModal === 'edit_item' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-100/70 text-amber-700">
                      <Edit3 size={20} />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-lg text-slate-800">Cập nhật thực đơn</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block truncate max-w-[200px]">
                        Sửa: {formName}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveEdit} className="space-y-4.5 pt-1">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 block">Tên món ăn hoặc thành phần *:</label>
                        <input 
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 transition-all text-sm animate-none"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 block">Số lượng *:</label>
                        <input 
                          type="number"
                          required
                          step="any"
                          value={formQuantity}
                          onChange={(e) => setFormQuantity(e.target.value)}
                          className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 transition-all text-sm"
                          min="0.01"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 block">Đơn vị *:</label>
                        <input 
                          type="text"
                          required
                          value={formUnit}
                          onChange={(e) => setFormUnit(e.target.value)}
                          className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 transition-all text-sm"
                        />
                      </div>

                      <div className="col-span-2 space-y-1 relative">
                        <div className="flex justify-between items-center pr-1 select-none">
                          <label className="text-[11px] font-bold text-slate-500 block">
                            Năng lượng (Calo - kcal) *:
                          </label>
                          {isEstimatingCalories ? (
                            <span className="text-[10px] text-primary font-bold animate-pulse flex items-center gap-0.5">
                              <Sparkles size={11} className="animate-spin" /> AI đang tính...
                            </span>
                          ) : lastEstimatedQueryRef.current && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                              <Check size={11} /> AI tự động ước lượng
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input 
                            type="number"
                            required
                            value={formCalories}
                            onChange={(e) => {
                              setFormCalories(e.target.value);
                              lastEstimatedQueryRef.current = '';
                            }}
                            className={cn(
                              "w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 transition-all text-sm pr-10",
                              isEstimatingCalories && "border-primary/45 bg-orange-50/20"
                            )}
                            placeholder="Calo nạp"
                            min="0"
                          />
                          {isEstimatingCalories && (
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Advanced stats expander for modifications */}
                      <div className="col-span-2 pt-0.5 select-none">
                        <button
                          type="button"
                          onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                          className="text-[10px] font-black text-primary hover:text-orange-600 flex items-center gap-1 transition-colors uppercase tracking-wider focus:outline-none cursor-pointer"
                        >
                          {showAdvancedStats ? "Thu gọn chỉ số ▲" : "Chi tiết bổ sung (Đạm, Carb, Béo, Ghi chú) ▾"}
                        </button>
                      </div>

                      {showAdvancedStats && (
                        <div className="col-span-2 grid grid-cols-3 gap-2.5 pt-0.5 animate-fadeIn">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">Đạm (Prot-g):</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={formProtein}
                              onChange={(e) => setFormProtein(e.target.value)}
                              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-2.5 py-2 outline-none font-bold text-slate-700 text-xs transition-all"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">Carbs (g):</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={formCarbs}
                              onChange={(e) => setFormCarbs(e.target.value)}
                              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-2.5 py-2 outline-none font-bold text-slate-700 text-xs transition-all"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">Béo (Fat-g):</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={formFat}
                              onChange={(e) => setFormFat(e.target.value)}
                              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-2.5 py-2 outline-none font-bold text-slate-700 text-xs transition-all"
                            />
                          </div>

                          <div className="col-span-3 space-y-1 pt-0.5">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">Ghi chú dinh dưỡng thêm:</label>
                            <input 
                              type="text"
                              value={formNotes}
                              onChange={(e) => setFormNotes(e.target.value)}
                              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl px-3 py-2 outline-none font-bold text-slate-705 text-xs transition-all"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2.5 pt-3">
                      <button 
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors text-sm cursor-pointer"
                      >
                        Hủy
                      </button>
                      <PremiumButton 
                        type="submit"
                        className="flex-1 py-3 text-sm shadow-sm"
                      >
                        Lưu thay đổi
                      </PremiumButton>
                    </div>
                  </form>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.getElementById('app-modal-portal') || document.body
    )}
  </div>
  );
};

export default Nutrition;
