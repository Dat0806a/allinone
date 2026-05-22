import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Wallet, CheckCircle, ShieldCheck, Key, ShieldAlert, Sparkles, RefreshCcw, Landmark, QrCode } from "lucide-react";
import { PremiumButton, cn } from "../../components/premium/UI";
import { supabase } from "../../lib/supabase";
import { useScrollLock } from "../../hooks/useScrollLock";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    planId: string;
    status: string;
    expiresAt: string;
  };
  userId: string;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  badge: string;
  color: string;
  textColor: string;
  glow: string;
  benefits: string[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Cơ bản (Free)",
    price: "0đ",
    period: "/tháng",
    badge: "Sức khỏe cơ bản",
    color: "bg-slate-50 border-slate-200 hover:border-slate-300",
    textColor: "text-slate-800",
    glow: "shadow-sm",
    benefits: [
      "Hỏi đáp AI y tế cơ bản (20 lượt/ngày)",
      "Lịch nhắc uống thuốc thông minh",
      "Sổ ghi chép thông số sức khỏe thủ công",
      "Bài viết cẩm nang khuyên dùng hằng ngày"
    ]
  },
  {
    id: "standard",
    name: "Standard AI Plus",
    price: "99.000đ",
    period: "/tháng",
    badge: "Phổ biến",
    color: "bg-sky-50 border-sky-200/60 hover:border-sky-300",
    textColor: "text-sky-900",
    glow: "shadow-sky-100 shadow-md",
    benefits: [
      "Hỏi đáp AI thông minh (Không giới hạn)",
      "Trợ lý AI phân tích kết quả xét nghiệm",
      "Bác sĩ ảo tư vấn triệu chứng tức thì 24/7",
      "Nhắc uống thuốc cuộc gọi/SMS khi quá giờ"
    ]
  },
  {
    id: "premium",
    name: "Premium Guardian",
    price: "199.000đ",
    period: "/tháng",
    badge: "Khuyên nghị",
    color: "bg-gradient-to-br from-orange-50 to-amber-50/50 border-orange-200 hover:border-primary/40",
    textColor: "text-orange-950",
    glow: "shadow-orange-100 shadow-lg border-2",
    benefits: [
      "Toàn bộ tính năng gói Standard AI Plus",
      "Bác sĩ chuyên khoa riêng biệt hỗ trợ 24/7",
      "Liên kết SOS tự động gọi & định vị người thân",
      "Đọc kết quả scan cận lâm sàng chuyên sâu d3"
    ]
  }
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  userId,
  onShowToast,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<"momo" | "card" | "qr" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useScrollLock(isOpen);

  const currentPlanId = subscription?.planId || "free";
  const currentPlan = PLANS.find((p) => p.id === currentPlanId) || PLANS[0];

  const handleOpenCheckout = (plan: Plan) => {
    if (plan.id === currentPlanId) {
      onShowToast("Bạn đang sử dụng gói dịch vụ này rồi!", "info");
      return;
    }
    setSelectedPlan(plan);
    setCheckoutMethod("momo"); // default
  };

  const handleCancelCheckout = () => {
    setSelectedPlan(null);
    setCheckoutMethod(null);
  };

  const handleConfirmSimulatePayment = async () => {
    if (!selectedPlan) return;
    try {
      setIsProcessing(true);
      // Simulate payment check delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await supabase.from('profiles').update({
        subscription_tier: selectedPlan.id,
      }).eq('id', userId);

      onShowToast(`Nâng cấp thành công gói ${selectedPlan.name}!`, "success");
      handleCancelCheckout();
    } catch (err: any) {
      console.error(err);
      onShowToast("Thanh toán giả lập thất bại. Hãy thử lại!", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 relative z-10 flex flex-col max-h-[85vh] my-auto overflow-hidden text-left"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-800 leading-none">Gói dịch vụ AI</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Quản lý quyền lợi & đăng ký gói</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-5 custom-scrollbar">
          <AnimatePresence mode="wait">
            {!selectedPlan ? (
              /* PLANS VIEW */
              <motion.div
                key="plans-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Current Active Plan Badge */}
                <div className="bg-slate-900 text-white rounded-3xl p-5 relative overflow-hidden shrink-0 shadow-lg">
                  <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/12 opacity-10">
                    <Wallet size={160} />
                  </div>
                  <div className="relative z-10 space-y-1 text-left">
                    <span className="text-[9px] bg-primary font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Đang hoạt động</span>
                    <h4 className="text-lg font-black font-display tracking-tight mt-1">{currentPlan.name}</h4>
                    <p className="text-[11px] text-slate-300">
                      Sử dụng đầy đủ đặc quyền ưu đãi. Hết hạn vào: <span className="font-bold text-white">31/12/2026</span>
                    </p>
                  </div>
                </div>

                {/* Grid list of plans */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Các gói dịch vụ tiêu chuẩn</span>
                  
                  {PLANS.map((plan) => {
                    const isCurrent = plan.id === currentPlanId;
                    return (
                      <div
                        key={plan.id}
                        className={cn(
                          "bg-white border rounded-[2rem] p-5.5 relative transition-all duration-300",
                          plan.color,
                          plan.glow,
                          isCurrent ? "ring-2 ring-primary border-transparent" : ""
                        )}
                      >
                        {/* Plan Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] bg-white/80 border border-slate-100 text-slate-500 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                              {plan.badge}
                            </span>
                            <h5 className={cn("text-base font-black font-display tracking-tight mt-1", plan.textColor)}>
                              {plan.name}
                            </h5>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-800">{plan.price}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{plan.period}</span>
                          </div>
                        </div>

                        {/* Benefits list */}
                        <ul className="mt-4 space-y-1.5 border-t border-slate-100/50 pt-3">
                          {plan.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex gap-2 text-xs text-slate-600 font-medium">
                              <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Upgrade Button */}
                        <div className="mt-4 pt-1">
                          {isCurrent ? (
                            <div className="w-full py-3 bg-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider text-center rounded-2xl flex items-center justify-center gap-1.5 select-none font-sans">
                              <ShieldCheck size={14} /> Gói của bạn hiện tại
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleOpenCheckout(plan)}
                              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest text-center rounded-2xl cursor-pointer shadow-md transition-all font-sans"
                            >
                              Chọn đăng ký gói này
                            </motion.button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* PREMIUM CHECKOUT MOCK */
              <motion.div
                key="checkout-view"
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 15 }}
                className="bg-slate-50/70 border border-slate-100 p-5 rounded-[2rem] space-y-4 text-left"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight">Chi tiết Hóa đơn & Đăng ký Gói</h4>
                  <button
                    onClick={handleCancelCheckout}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                  >
                    Quay lại
                  </button>
                </div>

                <div className="space-y-2.5 bg-white p-4.5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-black uppercase tracking-wider">
                    <span>Gói đã chọn</span>
                    <span>Thành giá</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-dashed border-slate-100 pb-2.5">
                    <span className="font-extrabold text-sm text-slate-800">{selectedPlan.name}</span>
                    <span className="font-black text-lg text-primary">{selectedPlan.price}<span className="text-[10px] text-slate-400 font-bold">/tháng</span></span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Đặc quyền được kích hoạt ngay lập tức trong tài khoản của bạn sau khi xác nhận thanh toán giả lập.</p>
                </div>

                {/* Payment method selector */}
                <div className="space-y-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Phương thức thanh toán liên kết</span>

                  <div className="grid grid-cols-3 gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCheckoutMethod("momo")}
                      className={cn(
                        "p-4 border-2 rounded-2xl bg-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                        checkoutMethod === "momo" ? "border-primary/50 bg-orange-50/10 shadow-sm" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-500 font-black text-xs flex items-center justify-center shrink-0">MoMo</div>
                      <span className="text-[10px] font-bold text-slate-700">Ví MoMo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckoutMethod("card")}
                      className={cn(
                        "p-4 border-2 rounded-2xl bg-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                        checkoutMethod === "card" ? "border-primary/50 bg-orange-50/10 shadow-sm" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <Landmark className="text-sky-500 shrink-0" size={24} />
                      <span className="text-[10px] font-bold text-slate-700">ATM / Visa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckoutMethod("qr")}
                      className={cn(
                        "p-4 border-2 rounded-2xl bg-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                        checkoutMethod === "qr" ? "border-primary/50 bg-orange-50/10 shadow-sm" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <QrCode className="text-emerald-500 shrink-0" size={24} />
                      <span className="text-[10px] font-bold text-slate-700">Quét Mã QR</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <PremiumButton
                    type="button"
                    isLoading={isProcessing}
                    onClick={handleConfirmSimulatePayment}
                    className="w-full text-xs font-black uppercase tracking-widest py-3.5"
                  >
                    Xác nhận Thanh toán giả lập
                  </PremiumButton>
                  <p className="text-center text-[10px] text-slate-400 font-bold mt-2.5">
                    Hệ thống tích hợp cổng thanh toán giả lập thông minh 2026
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Informative Footer banner */}
        {!selectedPlan && (
          <div className="pt-4 border-t border-slate-50 bg-slate-50/50 rounded-2xl p-4.5 flex gap-2 w-full text-[10px] text-slate-500 font-semibold leading-relaxed shrink-0">
            <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
            <span>Nguồn quỹ nâng cấp được sử dụng để duy trì huấn luyện máy chủ LLM y tế AI Guardian tốt hơn mỗi ngày. Bạn có thể tự do nâng cấp/hạ cấp mọi gói dịch vụ hoàn toàn miễn phí tại đây.</span>
          </div>
        )}
      </motion.div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.getElementById("app-modal-portal") || document.body)
    : null;
};
