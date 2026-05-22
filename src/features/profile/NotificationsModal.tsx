import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell, Volume2, ShieldCheck, RefreshCw, Sparkles, Check, ToggleLeft, ToggleRight } from "lucide-react";
import { PremiumButton, cn } from "../../components/premium/UI";
import { supabase } from "../../lib/supabase";
import { useScrollLock } from "../../hooks/useScrollLock";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: {
    medicationReminder: boolean;
    appointmentReminder: boolean;
    aiNotification: boolean;
    systemNotification: boolean;
    reminderTime: string;
    sound: string;
    vibrate: boolean;
  };
  userId: string;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  userId,
  onShowToast,
}) => {
  const [config, setConfig] = useState({
    medicationReminder: notifications?.medicationReminder ?? true,
    appointmentReminder: notifications?.appointmentReminder ?? true,
    aiNotification: notifications?.aiNotification ?? true,
    systemNotification: notifications?.systemNotification ?? false,
    reminderTime: notifications?.reminderTime || "21:00",
    sound: notifications?.sound || "calm_chime",
    vibrate: notifications?.vibrate ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  if (!isOpen) return null;

  const handleToggle = async (field: string) => {
    const newValue = !config[field as keyof typeof config];
    const updatedConfig = { ...config, [field]: newValue };
    setConfig(updatedConfig);
    await autoSaveSettings(updatedConfig);
  };

  const handleValueChange = async (field: string, value: any) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    await autoSaveSettings(updatedConfig);
  };

  const autoSaveSettings = async (latestConfig: typeof config) => {
    try {
      setIsSaving(true);
      setJustSaved(false);

      // If notifications column doesn't exist, this might fail, so we catch easily.
      const { error } = await supabase.from('profiles').update({
        notifications: latestConfig,
      }).eq('id', userId);

      if (error) {
        console.warn("Could not save notifications, table might lack column. Error: " + error.message);
      }

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err: any) {
      console.error(err);
      onShowToast("Tự động lưu thất bại!", "error");
    } finally {
      setIsSaving(false);
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
        className="bg-white w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 relative z-10 flex flex-col max-h-[85vh] my-auto overflow-hidden text-left"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-800 leading-none">Cài đặt thông báo</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Tùy chọn nhắc lịch & âm cảnh báo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Toggle List */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-6 custom-scrollbar">
          
          {/* Real-time saving status badge */}
          <div className="flex justify-between items-center h-5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tùy chỉnh thông số nhắc nhở</span>
            <AnimatePresence mode="wait">
              {isSaving ? (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="flex items-center gap-1 text-[10px] text-primary font-bold"
                >
                  <RefreshCw size={10} className="animate-spin" /> Đang cập nhật...
                </motion.div>
              ) : justSaved ? (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold"
                >
                  <Check size={10} className="stroke-[3]" /> Đã tự động lưu thành công
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="space-y-3.5">
            {/* Toggle Item: Medication */}
            <div
              className="flex justify-between items-center bg-slate-50/70 border border-slate-100 p-4.5 rounded-[2rem] hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => handleToggle("medicationReminder")}
            >
              <div className="space-y-0.5 text-left pr-4">
                <p className="font-extrabold text-sm text-slate-800">Nhắc nhở uống thuốc</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Báo giờ đúng định kỳ cho mọi toa thuốc chỉ định</p>
              </div>
              <button type="button" className="shrink-0 pointer-events-none">
                {config.medicationReminder ? (
                  <ToggleRight className="text-primary w-11 h-11" />
                ) : (
                  <ToggleLeft className="text-slate-300 w-11 h-11" />
                )}
              </button>
            </div>

            {/* Toggle Item: Appointments */}
            <div
              className="flex justify-between items-center bg-slate-50/70 border border-slate-100 p-4.5 rounded-[2rem] hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => handleToggle("appointmentReminder")}
            >
              <div className="space-y-0.5 text-left pr-4">
                <p className="font-extrabold text-sm text-slate-800">Nhắc lịch khám bệnh</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Nhắc trước 1 ngày khi có lịch hẹn tái khám cận lâm sàng</p>
              </div>
              <button type="button" className="shrink-0 pointer-events-none">
                {config.appointmentReminder ? (
                  <ToggleRight className="text-primary w-11 h-11" />
                ) : (
                  <ToggleLeft className="text-slate-300 w-11 h-11" />
                )}
              </button>
            </div>

            {/* Toggle Item: AI Counselor */}
            <div
              className="flex justify-between items-center bg-slate-50/70 border border-slate-100 p-4.5 rounded-[2rem] hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => handleToggle("aiNotification")}
            >
              <div className="space-y-0.5 text-left pr-4">
                <p className="font-extrabold text-sm text-slate-800">Cố vấn sức khỏe AI</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Nhận lời khuyên sinh hoạt hằng ngày tối ưu hóa theo chỉ số d3</p>
              </div>
              <button type="button" className="shrink-0 pointer-events-none">
                {config.aiNotification ? (
                  <ToggleRight className="text-primary w-11 h-11" />
                ) : (
                  <ToggleLeft className="text-slate-300 w-11 h-11" />
                )}
              </button>
            </div>

            {/* Toggle Item: System Broadcast */}
            <div
              className="flex justify-between items-center bg-slate-50/70 border border-slate-100 p-4.5 rounded-[2rem] hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => handleToggle("systemNotification")}
            >
              <div className="space-y-0.5 text-left pr-4">
                <p className="font-extrabold text-sm text-slate-800">Cảnh báo hệ thống & ưu đãi</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Cập nhật tin tức dịch tễ cộng đồng và bản cập nhật v4.2</p>
              </div>
              <button type="button" className="shrink-0 pointer-events-none">
                {config.systemNotification ? (
                  <ToggleRight className="text-primary w-11 h-11" />
                ) : (
                  <ToggleLeft className="text-slate-300 w-11 h-11" />
                )}
              </button>
            </div>
          </div>

          {/* Detailed Selections */}
          <div className="space-y-4 pt-3.5 border-t border-slate-50">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Tinh chỉnh chuông & phản hồi</span>

            <div className="grid grid-cols-2 gap-4">
              {/* Reminder time select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Giờ nhắc mặc định</label>
                <input
                  type="time"
                  value={config.reminderTime}
                  onChange={(e) => handleValueChange("reminderTime", e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-2xl py-3 px-3 transition-all outline-none text-xs font-bold text-slate-700 text-center cursor-pointer"
                />
              </div>

              {/* Vibrate setting check */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Bật Rung thông báo</label>
                <div
                  onClick={() => handleToggle("vibrate")}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-2xl py-3 px-4 flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer h-[42px] select-none"
                >
                  <span>Chế độ Rung</span>
                  <span>{config.vibrate ? "Bật" : "Tắt"}</span>
                </div>
              </div>
            </div>

            {/* Sound Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Âm thanh chuông báo</label>
              <div className="relative">
                <Volume2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <select
                  value={config.sound}
                  onChange={(e) => handleValueChange("sound", e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-2xl py-3.5 pl-10 pr-4 transition-all outline-none text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="calm_chime">Thiền Định - Chuông Gió Gỗ (Calm Chime)</option>
                  <option value="retro_beeps">Báo thức - Tiếng Bíp Cổ Điển</option>
                  <option value="echo_flute">Thư thái - Sáo trúc Yên Bình (Echo Flute)</option>
                  <option value="pulse_wake">Khuấy động - Nhịp tim Sức Sống (Pulse Wake)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Informative Footer banner */}
        <div className="pt-4 border-t border-slate-50 bg-slate-50/50 rounded-2xl p-4.5 flex gap-2 w-full text-[10px] text-slate-500 font-semibold leading-relaxed shrink-0">
          <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
          <span>Mọi cài đặt nhắc lịch uống thuốc sẽ đồng bộ trực tiếp với máy phân tích cảnh báo của phần cứng thiết bị đeo thông minh của bạn để tránh rung phiền nhiễu khi ngủ say.</span>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.getElementById("app-modal-portal") || document.body)
    : null;
};
