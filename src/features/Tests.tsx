import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useUserStore } from '../store/useStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Use a storage key for local bookings
const STORAGE_KEY_BOOKINGS = 'health_bookings';
import { SectionHeader, PremiumCard, cn, PremiumButton } from '../components/premium/UI';
import { 
  Activity, 
  Clock, 
  FileText, 
  ChevronRight, 
  X, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  FileHeart, 
  ShieldAlert, 
  Info,
  ChevronDown
} from 'lucide-react';

// Static test packages that users can inspect and book directly
const PACKAGES = [
  {
    id: "blood",
    name: "Xét nghiệm máu tổng quát",
    description: "Khảo sát công thức máu sơ bộ giúp đánh giá tình trạng thiếu máu, chức năng đông máu và các cơ quan.",
    price: "350.000đ",
    duration: "Lấy kết quả sau 2-4h",
    color: "from-red-50 to-orange-50 border-orange-100 text-orange-600",
    iconColor: "bg-orange-100 text-orange-600"
  },
  {
    id: "diabetes",
    name: "Xét nghiệm tiểu đường (HbA1c)",
    description: "Đo lường trung bình lượng đường huyết trong 3 tháng gần nhất để tầm soát hoặc theo dõi đái tháo đường.",
    price: "220.000đ",
    duration: "Lấy kết quả sau 2h",
    color: "from-blue-50 to-indigo-50 border-indigo-100 text-indigo-600",
    iconColor: "bg-indigo-100 text-indigo-600"
  },
  {
    id: "liver_kidney",
    name: "Chức năng Gan & Thận",
    description: "Kiểm tra chi tiết chỉ số men gan AST/ALT, Creatinine & Ure trong máu phát hiện tổn thương độc tố.",
    price: "280.000đ",
    duration: "Lấy kết quả sau 3h",
    color: "from-teal-50 to-emerald-50 border-emerald-100 text-emerald-600",
    iconColor: "bg-emerald-100 text-emerald-600"
  },
  {
    id: "gout_lipid",
    name: "Tầm soát Gút & Mỡ máu",
    description: "Sàng lọc định lượng Acid Uric, Triglyceride, Cholesterol dự phòng xơ vữa cùng bệnh viêm khớp gút.",
    price: "290.000đ",
    duration: "Lấy kết quả sau 3h",
    color: "from-amber-50 to-yellow-50 border-amber-100 text-amber-600",
    iconColor: "bg-amber-100 text-amber-600"
  },
  {
    id: "geriatric",
    name: "Tổng quát dưỡng lão tại nhà",
    description: "Bộ xét nghiệm sinh hóa cốt lõi tối ưu cho cơ thể người cao tuổi, tầm soát ung thư sớm, vi chất.",
    price: "850.000đ",
    duration: "Lấy kết quả sau 4-6h",
    color: "from-purple-50 to-pink-50 border-pink-100 text-pink-600",
    iconColor: "bg-pink-100 text-pink-600"
  }
];

// Offline historical data for aesthetics
const OFFLINE_TESTS = [
  {
    id: "HIST_1",
    fullName: "Nguyễn Văn A",
    testType: "Xét nghiệm máu tổng quát",
    testDate: "2026-05-12",
    testTime: "08:30",
    status: "completed",
    notes: "Lấy mẫu thuận lợi."
  },
  {
    id: "HIST_2",
    fullName: "Nguyễn Văn A",
    testType: "Khám sức khỏe tổng quát dưỡng lão",
    testDate: "2026-05-19",
    testTime: "07:15",
    status: "confirmed",
    notes: "Khách cần nhịn đói từ tối hôm trước."
  }
];

interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  testDate: string;
  testTime: string;
  testType: string;
  notes: string;
}

const Tests: React.FC = () => {
  const { user } = useUserStore();
  const userId = user?.id || 'anonymous';
  
  // Booking modal visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phone: '',
    email: '',
    testDate: '',
    testTime: '08:00',
    testType: 'blood',
    notes: ''
  });

  // Flow states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  // Dynamic booking history from API
  const [dynamicBookings, setDynamicBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Get current date string (YYYY-MM-DD) for minimum testDate picker
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Fetch real database bookings on mount
  const fetchBookings = async () => {
    if (!userId || userId === 'anonymous') {
      setIsLoadingBookings(false);
      return;
    }

    setIsLoadingBookings(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userId)
          .order('test_date', { ascending: false });
        
        if (!error && data) {
          const mapped = data.map((b: any) => ({
            id: b.id,
            fullName: b.full_name,
            phone: b.phone,
            email: b.email,
            testDate: b.test_date,
            testTime: b.test_time,
            testType: b.test_type,
            notes: b.notes,
            status: b.status
          }));
          setDynamicBookings(mapped);
          setIsLoadingBookings(false);
          return;
        } else if (error) {
          console.error("Supabase Medication Fetch Error:", error);
        }
      }
    } catch (e) {
      console.error("Fetch bookings failed:", e);
    }

    // Local fallback
    const stored = localStorage.getItem(`${STORAGE_KEY_BOOKINGS}_${userId}`);
    if (stored) {
      setDynamicBookings(JSON.parse(stored));
    }
    setIsLoadingBookings(false);
  };

  const saveBookingLocal = (booking: any) => {
    const key = `${STORAGE_KEY_BOOKINGS}_${userId}`;
    const stored = localStorage.getItem(key);
    const existing = stored ? JSON.parse(stored) : [];
    const updated = [booking, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));
    setDynamicBookings(updated);
  };

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  // Scroll lock when booking modal or ticket detail is active
  useScrollLock(isModalOpen || !!selectedBooking);

  // Quick fill and trigger modal on pack selection
  const handleSelectPackage = (packageId: string) => {
    setFormData(prev => ({
      ...prev,
      testType: packageId
    }));
    setSubmitError(null);
    setSuccessBooking(null);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open booking modal with default empty selection
  const handleOpenGeneralBooking = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      testDate: '',
      testTime: '08:00',
      testType: 'blood',
      notes: ''
    });
    setSubmitError(null);
    setSuccessBooking(null);
    setErrors({});
    setIsModalOpen(true);
  };

  // Local state validation before server round-trip
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên của bạn";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải dài tối thiểu từ 2 ký tự";
    }

    const phoneRegex = /^0\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng cung cấp số điện thoại liên hệ";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Định dạng sai: Số điện thoại Việt Nam bắt buộc gồm 10 chữ số (bắt đầu bằng 0)";
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Email chưa đúng định dạng chuẩn (ví dụ: bantin@doanhnghiep.com)";
      }
    }

    if (!formData.testDate) {
      newErrors.testDate = "Vui lòng lựa chọn ngày hẹn lấy mẫu";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(formData.testDate);
      if (isNaN(selected.getTime())) {
        newErrors.testDate = "Ngày được chọn không hợp lệ";
      } else if (selected < today) {
        newErrors.testDate = "Không được đặt lịch vào các mốc thời gian thuộc quá khứ";
      }
    }

    if (!formData.testTime) {
      newErrors.testTime = "Vui lòng ưu tiên lựa chọn giờ hẹn";
    } else {
      const [hours, minutes] = formData.testTime.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        newErrors.testTime = "Thời gian không hợp lệ";
      } else {
        const totalMinutes = hours * 60 + minutes;
        const openVal = 7 * 60; // 07:00
        const closeVal = 18 * 60; // 18:00
        if (totalMinutes < openVal || totalMinutes > closeVal) {
          newErrors.testTime = "Thời gian hẹn phải trong khung giờ hành chính (07:00 - 18:00)";
        }
      }
    }

    if (!formData.testType) {
      newErrors.testType = "Vui lòng chọn mô hình xét nghiệm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit appointment booking to the backend / API
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }

    if (!userId || userId === 'anonymous') {
      setSubmitError("Bạn cần đăng nhập để sử dụng tính năng này");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    console.log("Starting appointment booking submission for user:", userId);
    
    const payload = {
      user_id: userId,
      full_name: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      test_date: formData.testDate,
      test_time: formData.testTime,
      test_type: formData.testType,
      notes: formData.notes
    };

    // Helper for local success
    const completeLocally = () => {
      const localId = `LOCAL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const localBooking = {
        id: localId,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        testDate: formData.testDate,
        testTime: formData.testTime,
        testType: formData.testType,
        notes: formData.notes,
        status: 'pending'
      };
      saveBookingLocal(localBooking);
      setSuccessBooking(localBooking);
      setIsSubmitting(false);
    };

    try {
      if (isSupabaseConfigured) {
        // Attempt Supabase with a safety timeout
        const { data, error } = await Promise.race([
          supabase.from('bookings').insert([payload]).select().single(),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
        ]).catch(err => ({ error: err, data: null }));

        if (!error && data) {
          const mapped = {
            id: data.id,
            fullName: data.full_name,
            phone: data.phone,
            email: data.email,
            testDate: data.test_date,
            testTime: data.test_time,
            testType: data.test_type,
            notes: data.notes,
            status: data.status
          };
          setSuccessBooking(mapped);
          fetchBookings();
          setIsSubmitting(false);
          return;
        } else {
          console.warn("Supabase booking failed, falling back to local:", error);
        }
      }
    } catch (outerErr) {
      console.error("Booking error caught:", outerErr);
    }

    // Always fallback to local storage if API fails or isn't configured
    completeLocally();
  };

  // Merge the static high-fidelity UI historical elements with active user bookings from backend
  const allMergedBookings = [...dynamicBookings];
  
  // If we have no online bookings returned, show static demo history for polished look and feel
  const displayableBookings = allMergedBookings.length > 0 ? allMergedBookings : OFFLINE_TESTS;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-xl font-black text-[10px] uppercase tracking-widest leading-none shrink-0">
            Đã có kết quả
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-black text-[10px] uppercase tracking-widest leading-none shrink-0">
            Sắp tới
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-black text-[10px] uppercase tracking-widest leading-none shrink-0">
            Đã hủy
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl font-black text-[10px] uppercase tracking-widest leading-none shrink-0 animate-pulse">
            Chờ xác nhận
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="space-y-1">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest select-none">Giải pháp y tế gia đình</p>
        <h1 className="text-3xl font-display font-black text-slate-800">Đặt Lịch Xét Nghiệm</h1>
        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xl">
          Lấy mẫu an toàn tại nhà, nhận kết quả bảo mật trực tuyến qua ứng dụng.
        </p>
      </div>

      {/* Main Promo Card */}
      <PremiumCard className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8" />
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Activity size={24} />
            </div>
            <h3 className="font-display font-black text-xl">Dịch Vụ Xét Nghiệm Tại Nhà</h3>
          </div>
        </div>
        <p className="text-blue-100 mb-6 font-medium leading-relaxed relative z-10 max-w-xl">
          Đội ngũ y sĩ/điều dưỡng của chúng tôi sẽ di chuyển tới tận căn hộ của bạn để lấy mẫu thử một cách vô trùng, nhanh nhẹn, giảm tải thời gian chờ đợi tại bệnh viện lớn.
        </p>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleOpenGeneralBooking}
          className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 active:scale-95 transition-all text-sm z-10 relative"
          id="btn-book-now"
        >
          Đặt lịch lấy mẫu ngay <ChevronRight size={18} />
        </motion.button>
      </PremiumCard>

      {/* Warning/Guide segment for elder-friendly touch */}
      <div className="bg-amber-50/70 border border-amber-200/60 rounded-[2rem] p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-amber-900">🔔 Chỉ dẫn chuẩn bị lấy mẫu máu</h4>
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Để các chỉ số sinh hóa (mỡ máu, đường huyết, axit uric) đạt kết quả chính xác cao nhất, người bệnh cần <strong>nhịn đói hoàn toàn từ 8 đến 12 tiếng</strong> trước giờ hẹn rút máu. Chỉ nên uống một lượng nhỏ nước lọc tinh khiết khi thật sự cần thiết.
          </p>
        </div>
      </div>

      {/* Selectable Packages List */}
      <div className="space-y-4">
        <SectionHeader title="Chọn gói xét nghiệm phù hợp" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PACKAGES.map((pkg) => (
            <div 
              key={pkg.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 hover:border-orange-200/60 transition-all flex flex-col justify-between shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className={cn("text-xs font-black uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-xl border border-slate-100 text-slate-500", pkg.id === formData.testType && "bg-orange-50 border-orange-200 text-primary")}>
                    {pkg.price}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {pkg.duration}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-lg text-slate-800 leading-tight">
                    {pkg.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {pkg.description}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-black text-primary uppercase tracking-widest select-none">
                  Đặt dịch vụ tại nhà
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectPackage(pkg.id)}
                  className="px-4 py-2 bg-slate-50 hover:bg-orange-50 hover:text-primary text-slate-600 font-extrabold text-xs rounded-xl border border-slate-100 hover:border-orange-100 transition-colors cursor-pointer"
                >
                  Chọn gói
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lab History and active scheduled appointments */}
      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center px-1">
          <SectionHeader title="Lịch sử & Lịch hẹn" />
          <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
            {isLoadingBookings ? "Đang cập nhật..." : `${displayableBookings.length} hồ sơ`}
          </p>
        </div>

        <div className="space-y-3">
          {displayableBookings.map((test) => (
            <motion.div
              key={test.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedBooking(test)}
              className="p-5 bg-white rounded-[2rem] shadow-sm hover:shadow-md border border-slate-100 flex items-center gap-4 cursor-pointer transition-all"
            >
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                <FileText size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-black text-base text-slate-800 leading-tight truncate">
                  {test.testType}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="text-slate-800 font-extrabold">{test.fullName}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{test.testDate}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={11} />
                    <span>{test.testTime}</span>
                  </div>
                </div>
              </div>
              {getStatusBadge(test.status)}
            </motion.div>
          ))}
        </div>
      </div>

      {/* RENDER MODAL: Appointment Booking Form & Booking Details viewer inside Portals */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Modal Box */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 15 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 relative z-10 flex flex-col max-h-[85vh] my-auto"
                >
                  {/* Modal Header */}
                  <div className="p-6 pb-4 border-b border-slate-50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <FileHeart size={20} />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-lg text-slate-800 leading-none">
                          Đặt lịch xét nghiệm
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 select-none">
                          Hộ tống y sĩ hỗ trợ tận nhà
                        </p>
                      </div>
                    </div>
                    {!isSubmitting && (
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Modal Body with form */}
                  <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    {successBooking ? (
                      /* Booking SUCCESS SCREEN */
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6 px-2 space-y-5"
                      >
                        <div className="w-16 h-16 bg-green-50 border border-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                          <CheckCircle2 size={32} className="stroke-[2.5]" />
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-display font-black text-xl text-slate-800">
                            Đặt lịch thành công!
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">
                            Mã lịch hẹn: <span className="text-primary font-black">{successBooking.id}</span>
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 space-y-2.5 text-xs text-slate-700 font-extrabold max-w-sm mx-auto">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Người đặt:</span>
                            <span>{successBooking.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Gói xét nghiệm:</span>
                            <span>{successBooking.testType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Thời gian hẹn:</span>
                            <span>{successBooking.testTime} ngày {successBooking.testDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Số điện thoại:</span>
                            <span>{successBooking.phone}</span>
                          </div>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-500 font-medium">
                          Đội ngũ y tế sẽ chủ động liên hệ tới số điện thoại <strong>{successBooking.phone}</strong> trong vòng 15-30 phút tới để xác nhận và dặn dò thêm các bước chuẩn bị cần thiết.
                        </p>

                        <div className="pt-2">
                          <PremiumButton
                            onClick={() => setIsModalOpen(false)}
                            className="w-full py-4 text-xs tracking-wider font-black uppercase text-center"
                          >
                            Đồng ý & Đóng
                          </PremiumButton>
                        </div>
                      </motion.div>
                    ) : (
                      /* Standard FORM display */
                      <form onSubmit={handleBookAppointment} className="space-y-4">
                        {submitError && (
                          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2 text-rose-700">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span className="text-xs font-bold leading-normal">{submitError}</span>
                          </div>
                        )}

                        {/* Họ và tên */}
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1 select-none">
                            <User size={13} /> Họ và tên người bệnh <span className="text-rose-500 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            disabled={isSubmitting}
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className={cn(
                              "w-full bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white rounded-2xl p-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400",
                              errors.fullName && "border-rose-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 bg-rose-50/20"
                            )}
                            placeholder="Ví dụ: Nguyễn Văn Hải"
                          />
                          {errors.fullName && (
                            <p className="text-[11px] text-rose-500 font-bold pl-1">⚠️ {errors.fullName}</p>
                          )}
                        </div>

                        {/* Số điện thoại */}
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1 select-none">
                            <Phone size={13} /> Số điện thoại <span className="text-rose-500 font-black">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            disabled={isSubmitting}
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className={cn(
                              "w-full bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white rounded-2xl p-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400",
                              errors.phone && "border-rose-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 bg-rose-50/20"
                            )}
                            placeholder="Số điện thoại gồm 10 chữ số (ví dụ: 0912345678)"
                          />
                          {errors.phone && (
                            <p className="text-[11px] text-rose-500 font-bold pl-1">⚠️ {errors.phone}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1 select-none">
                            <Mail size={13} /> Địa chỉ Email (Nếu có)
                          </label>
                          <input
                            type="email"
                            disabled={isSubmitting}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className={cn(
                              "w-full bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white rounded-2xl p-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400",
                              errors.email && "border-rose-400 focus:border-rose-400"
                            )}
                            placeholder="Ví dụ: hotro@suckhoemayman.com"
                          />
                          {errors.email && (
                            <p className="text-[11px] text-rose-500 font-bold pl-1">⚠️ {errors.email}</p>
                          )}
                        </div>

                        {/* Chọn loại xét nghiệm */}
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1 select-none">
                            <Activity size={13} /> Loại gói xét nghiệm <span className="text-rose-500 font-black">*</span>
                          </label>
                          <div className="relative">
                            <select
                              disabled={isSubmitting}
                              value={formData.testType}
                              onChange={(e) => setFormData({...formData, testType: e.target.value})}
                              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white rounded-2xl p-4 text-sm font-semibold text-slate-800 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="blood">Xét nghiệm máu tổng quát (350.000đ)</option>
                              <option value="diabetes">Xét nghiệm tiểu đường HbA1c (220.000đ)</option>
                              <option value="liver_kidney">Xét nghiệm men gan & chức năng thận (280.000đ)</option>
                              <option value="gout_lipid">Tầm soát bệnh Gút & mỡ máu (290.000đ)</option>
                              <option value="geriatric">Khám sức khỏe tổng quát dưỡng lão tại nhà (850.000đ)</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none stroke-[2.5]" />
                          </div>
                        </div>

                        {/* Grid: Ngày xét nghiệm & Giờ xét nghiệm */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Ngày hẹn */}
                          <div className="space-y-1">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1 select-none">
                              <Calendar size={13} /> Ngày hẹn lấy mẫu <span className="text-rose-500 font-black">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              disabled={isSubmitting}
                              min={getTodayDateString()}
                              value={formData.testDate}
                              onChange={(e) => setFormData({...formData, testDate: e.target.value})}
                              className={cn(
                                "w-full bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white rounded-2xl p-4 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all cursor-pointer",
                                errors.testDate && "border-rose-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 bg-rose-50/20"
                              )}
                            />
                            {errors.testDate && (
                              <p className="text-[11px] text-rose-500 font-bold pl-1">⚠️ {errors.testDate}</p>
                            )}
                          </div>

                          {/* Khung giờ */}
                          <div className="space-y-1">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1 select-none">
                              <Clock size={13} /> Giờ lấy mẫu <span className="text-rose-500 font-black">*</span>
                            </label>
                            <div className="relative">
                              <select
                                disabled={isSubmitting}
                                value={formData.testTime}
                                onChange={(e) => setFormData({...formData, testTime: e.target.value})}
                                className={cn(
                                  "w-full bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white rounded-2xl p-4 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all appearance-none cursor-pointer",
                                  errors.testTime && "border-rose-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-55 bg-rose-50/20"
                                )}
                              >
                                <option value="07:00">07:00 Sáng</option>
                                <option value="07:30">07:30 Sáng</option>
                                <option value="08:00">08:00 Sáng</option>
                                <option value="08:30">08:30 Sáng</option>
                                <option value="09:00">09:00 Sáng</option>
                                <option value="09:30">09:30 Sáng</option>
                                <option value="10:00">10:00 Sáng</option>
                                <option value="10:30">10:30 Sáng</option>
                                <option value="11:00">11:00 Trưa</option>
                                <option value="14:00">14:00 Chiều</option>
                                <option value="14:30">14:30 Chiều</option>
                                <option value="15:00">15:00 Chiều</option>
                                <option value="15:30">15:30 Chiều</option>
                                <option value="16:00">16:00 Chiều</option>
                                <option value="16:30">16:30 Chiều</option>
                                <option value="17:00">17:00 Chiều</option>
                                <option value="17:30">17:30 Chiều</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none stroke-[2.5]" />
                            </div>
                            {errors.testTime && (
                              <p className="text-[11px] text-rose-500 font-bold pl-1">⚠️ {errors.testTime}</p>
                            )}
                          </div>
                        </div>

                        {/* Ghi chú thêm */}
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1 select-none">
                            Ghi chú / Lưu ý bệnh lý nền cho y tá
                          </label>
                          <textarea
                            disabled={isSubmitting}
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white rounded-2xl p-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 min-h-[70px] resize-none"
                            placeholder="Ví dụ: Người bệnh khó lẩy ven lấy máu, bị dị ứng găng tay cao su,..."
                          />
                        </div>

                        {/* Active working indicators */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex gap-2 items-center text-[11px] text-slate-500 font-bold leading-snug">
                          <ShieldAlert size={14} className="text-blue-500 shrink-0" />
                          <span>Chúng tôi chỉ phục vụ mẫu thử trong vùng phạm vi y khoa cho phép từ 07:00 đến 18:00 hàng ngày.</span>
                        </div>

                        {/* CTA Action Buttons */}
                        <div className="flex gap-3 pt-3">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-colors cursor-pointer text-center"
                          >
                            Huỷ bỏ
                          </button>
                          <PremiumButton
                            type="submit"
                            isLoading={isSubmitting}
                            className="flex-1 py-4 text-xs tracking-wider font-black uppercase shadow-lg shadow-primary/20"
                            id="btn-confirm-submit"
                          >
                            Đăng ký đặt lịch
                          </PremiumButton>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedBooking && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedBooking(null)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Content box */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 15 }}
                  className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl border border-slate-100 relative z-10 space-y-5 my-auto max-h-[85vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <h3 className="font-display font-black text-lg text-slate-800">
                      Hồ sơ lịch hẹn xét nghiệm
                    </h3>
                    <button 
                      onClick={() => setSelectedBooking(null)}
                      className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <FileText className="text-blue-500 shrink-0" size={20} />
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Gói chỉ định</p>
                        <p className="font-extrabold text-slate-800">{selectedBooking.testType}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase text-slate-400">Ngày lấy mẫu</p>
                        <p className="font-extrabold text-slate-800">{selectedBooking.testDate}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase text-slate-400">Khung giờ hẹn</p>
                        <p className="font-extrabold text-slate-800">{selectedBooking.testTime}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-extrabold">Họ tên người bệnh:</span>
                        <span className="font-black text-slate-800">{selectedBooking.fullName || "Nguyễn Văn A"}</span>
                      </div>
                      {selectedBooking.phone && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-extrabold">Số điện thoại liên lạc:</span>
                          <span className="font-black text-slate-800">{selectedBooking.phone}</span>
                        </div>
                      )}
                      {selectedBooking.email && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-extrabold">Địa chỉ thư điện tử:</span>
                          <span className="font-black text-slate-800 truncate max-w-[200px]">{selectedBooking.email}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-extrabold">Trạng thái đặt lịch:</span>
                        <div>{getStatusBadge(selectedBooking.status)}</div>
                      </div>
                    </div>

                    {selectedBooking.notes && (
                      <div className="space-y-1 pl-3 border-l-2 border-primary">
                        <p className="text-[10px] font-black uppercase text-slate-400">Ghi chú y tá:</p>
                        <p className="text-xs italic text-slate-600 font-bold leading-relaxed">{selectedBooking.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <PremiumButton
                      onClick={() => setSelectedBooking(null)}
                      className="w-full py-4 text-xs font-black uppercase"
                    >
                      Xác nhận hồ sơ
                    </PremiumButton>
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

export default Tests;
