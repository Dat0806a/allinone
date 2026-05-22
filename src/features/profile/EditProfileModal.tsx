import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Mail, Phone, Calendar, MapPin, AlignLeft, Scale, Ruler, Sparkles, Check } from "lucide-react";
import { PremiumInput, PremiumButton, cn } from "../../components/premium/UI";
import { supabase } from "../../lib/supabase";
import { useScrollLock } from "../../hooks/useScrollLock";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDoc: any;
  userId: string;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", // Women Lifestyle
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", // Men Athletic
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", // Women Yoga
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200", // Men Mature
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200", // Women Cheerful
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200"  // Women Lifestyle Active
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userDoc,
  userId,
  onShowToast,
}) => {
  const [formData, setFormData] = useState({
    displayName: userDoc?.displayName || "",
    email: userDoc?.email || "",
    phone: userDoc?.phone || "",
    birthday: userDoc?.birthday || "",
    gender: userDoc?.gender || "Nam",
    address: userDoc?.address || "",
    bio: userDoc?.bio || "",
    bloodType: userDoc?.bloodType || "O+",
    weight: userDoc?.weight || 70,
    height: userDoc?.height || 175,
    photoURL: userDoc?.photoURL || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePresetSelect = (url: string) => {
    handleInputChange("photoURL", url);
    setShowPresets(false);
    onShowToast("Đã chọn ảnh đại diện mới!", "info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      onShowToast("Họ tên không được để trống!", "error");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email.trim())) {
      onShowToast("Định dạng Email không hợp lệ!", "error");
      return;
    }

    // Validate phone
    const phoneRegex = /^(0|84)\d{9,10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.trim().replace(/\s/g, ""))) {
      onShowToast("Số điện thoại không hợp lệ!", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updatePayload = {
        full_name: formData.displayName.trim(),
        avatar_url: formData.photoURL,
        blood_type: formData.bloodType,
        // Optional fields assuming they exist or we fallback if DB errors
        phone_number: formData.phone.trim(),
        date_of_birth: formData.birthday || null,
      };

      await supabase.from('profiles').update(updatePayload).eq('id', userId);

      onShowToast("Cập nhật thông tin cá nhân thành công!", "success");
      onClose();
    } catch (err: any) {
      console.error(err);
      onShowToast("Thao tác thất bại. Vui lòng thử lại!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useScrollLock(isOpen);

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
        className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 relative z-10 flex flex-col max-h-[90vh] my-auto overflow-hidden animate-none"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-800 leading-none">Chỉnh sửa hồ sơ</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Cập nhật thông tin y tế cơ bản</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 py-6 pr-1 custom-scrollbar">
          
          {/* Avatar Edit Section */}
          <div className="flex flex-col items-center gap-3 bg-slate-50 rounded-3xl p-5 border border-slate-100/50">
            <div className="relative">
              <div className="w-24 h-24 rounded-[1.8rem] bg-gradient-to-tr from-primary to-orange-400 text-white text-3xl font-black font-display overflow-hidden flex items-center justify-center border-4 border-white shadow-md">
                {formData.photoURL ? (
                  <img
                    src={formData.photoURL}
                    alt="Current Avatar"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  formData.displayName.charAt(0).toUpperCase() || "?"
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {showPresets ? "Đóng thư viện" : "Thay đổi ảnh đại diện"}
              </button>
            </div>

            {/* Presets Grid */}
            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full overflow-hidden"
                >
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase text-center mb-3 tracking-widest">
                    Chọn ảnh đại diện lành mạnh từ thư viện
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((url, i) => (
                      <motion.button
                        key={i}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetSelect(url)}
                        className={cn(
                          "w-10 h-10 rounded-xl overflow-hidden border-2 relative shrink-0 cursor-pointer",
                          formData.photoURL === url ? "border-primary shadow-md" : "border-transparent"
                        )}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" />
                        {formData.photoURL === url && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center text-white">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Manual URL Input */}
                  <div className="mt-4 pt-4 border-t border-slate-100 pb-1">
                    <PremiumInput
                      label="Hoặc dán URL ảnh tùy chọn của bạn:"
                      placeholder="https://example.com/your-image.jpg"
                      value={formData.photoURL}
                      onChange={(e: any) => handleInputChange("photoURL", e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <PremiumInput
              label="Họ tên của bạn *"
              icon={User}
              placeholder="Nhập họ và tên..."
              value={formData.displayName}
              onChange={(e: any) => handleInputChange("displayName", e.target.value)}
            />

            <PremiumInput
              label="Địa chỉ Email"
              icon={Mail}
              type="email"
              placeholder="Nhập địa chỉ email..."
              value={formData.email}
              onChange={(e: any) => handleInputChange("email", e.target.value)}
            />

            <PremiumInput
              label="Số điện thoại"
              icon={Phone}
              placeholder="Nhập số điện thoại liên hệ..."
              value={formData.phone}
              onChange={(e: any) => handleInputChange("phone", e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <PremiumInput
                label="Ngày sinh"
                icon={Calendar}
                type="date"
                value={formData.birthday}
                onChange={(e: any) => handleInputChange("birthday", e.target.value)}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500 ml-1">Giới tính</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-4 transition-all outline-none text-base font-semibold focus:bg-white focus:border-primary/40 text-slate-700"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <PremiumInput
              label="Địa chỉ cư trú"
              icon={MapPin}
              placeholder="Thành phố, Quận huyện..."
              value={formData.address}
              onChange={(e: any) => handleInputChange("address", e.target.value)}
            />

            {/* Health parameters */}
            <div className="grid grid-cols-3 gap-3 bg-orange-50/20 p-4 rounded-3xl border border-orange-100/30">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nhóm máu</label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => handleInputChange("bloodType", e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-xl py-2 px-2 transition-all outline-none text-xs font-bold text-slate-700 text-center"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Cân nặng (kg)</label>
                <input
                  type="number"
                  placeholder="70"
                  value={formData.weight || ""}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-xl py-2 px-2 transition-all outline-none text-xs font-bold text-slate-700 text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Chiều cao (cm)</label>
                <input
                  type="number"
                  placeholder="175"
                  value={formData.height || ""}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-xl py-2 px-2 transition-all outline-none text-xs font-bold text-slate-700 text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 ml-1">Tiểu sử sức khỏe / Lời tự sự</label>
              <textarea
                rows={3}
                placeholder="Nhập tiểu sử ngắn về bản thân..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 transition-all outline-none text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:border-primary/40 focus:ring-8 focus:ring-primary/5 text-slate-700 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer Area */}
        <div className="flex gap-3 pt-4 border-t border-slate-50 shrink-0">
          <button
            type="button"
            className="flex-1 py-4 text-xs font-bold tracking-wider text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer transition-all uppercase"
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <PremiumButton
            type="submit"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            className="flex-[1.5] text-xs font-black tracking-wider uppercase"
          >
            Lưu thay đổi
          </PremiumButton>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.getElementById("app-modal-portal") || document.body)
    : null;
};
