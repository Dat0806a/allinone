import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Pill,
  Clock,
  CheckCircle2,
  Info,
  Trash2,
  Bell,
  Calendar,
} from "lucide-react";
import { useMedicationContext } from "../contexts/MedicationContext";
import { useScrollLock } from "../hooks/useScrollLock";

const Medicines: React.FC = () => {
  const {
    medicines,
    addMedication,
    removeMedication,
    isTaken,
    markTaken,
    requestNotificationPermission,
  } = useMedicationContext();
  const [showAdd, setShowAdd] = useState(false);
  
  // Lock scroll when Add Medication panel is open
  useScrollLock(showAdd);

  const [newName, setNewName] = useState("");
  const [newDose, setNewDose] = useState("");
  const [newTimes, setNewTimes] = useState<string[]>([]);
  const getLocalDateString = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [newStartDate, setNewStartDate] = useState(getLocalDateString);
  const [newEndDate, setNewEndDate] = useState("");
  const [newDays, setNewDays] = useState<string[]>(["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"]);
  const [newNote, setNewNote] = useState("");

  const [selectedDate, setSelectedDate] = useState(getLocalDateString);

  // Generate 7 days centered around selectedDate
  const today = new Date();
  const baseDate = new Date(selectedDate);
  const datesWrapper = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - 3 + i);
    return d;
  });

  const getDayName = (d: Date) => {
    if (d.toDateString() === today.toDateString()) return "Hôm nay";
    const days = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
    return days[d.getDay()];
  };

  // Flatten medicines by time to show in timeline
  const timelineItems = medicines
    .filter((med) => {
      // Basic validation
      if (!med.name || !med.times || med.times.length === 0) return false;

      const selDate = selectedDate;
      const mStart = med.startDate;
      const mEnd = med.endDate;

      // Date range check (YYYY-MM-DD comparison)
      // Normalize to 10 chars to avoid ISO string mismatch (e.g. "2026-05-21" < "2026-05-21T00:00:00Z")
      const normalizedSel = selDate.substring(0, 10);
      const normalizedStart = mStart ? mStart.substring(0, 10) : "";
      const normalizedEnd = mEnd ? mEnd.substring(0, 10) : "";

      if (normalizedStart && normalizedSel < normalizedStart) return false;
      if (normalizedEnd && normalizedSel > normalizedEnd) return false;

      // Day of week check
      if (med.days && med.days.length > 0) {
        // Parse date carefully to avoid TZ shifts
        const parts = normalizedSel.split('-').map(Number);
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const dayNames = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
        const currentDay = dayNames[dateObj.getDay()];
        if (!med.days.includes(currentDay)) return false;
      }
      
      return true;
    })
    .flatMap((med) => {
      return med.times.map((t) => ({
        ...med,
        time: t,
        isDone: isTaken(med.id, t, selectedDate),
      }));
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const completedCount = timelineItems.filter((item) => item.isDone).length;
  const progressPercent =
    timelineItems.length > 0
      ? (completedCount / timelineItems.length) * 100
      : 0;
  const pendingCount = timelineItems.length - completedCount;

  const handleSave = async () => {
    if (!newName || newTimes.length === 0) return;
    
    const medData = {
      name: newName,
      dose: newDose || "1 liều",
      times: [...newTimes], // Clone to be safe
      days: [...newDays],
      startDate: newStartDate,
      endDate: newEndDate || undefined,
      note: newNote || "Uống theo chỉ định",
      icon: "💊",
      color: "bg-orange-50",
    };

    // Optimistically close modal
    setShowAdd(false);
    
    try {
      await addMedication(medData);
    } catch (err) {
      console.error("Failed to add medication:", err);
    }

    // Reset fields
    setNewName("");
    setNewDose("");
    setNewTimes([]);
    setNewDays(["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"]);
    setNewStartDate(getLocalDateString());
    setNewEndDate("");
    setNewNote("");
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">
            Lịch uống thuốc
          </h1>
          <p className="text-[#FF8A00] font-bold tracking-tighter text-base uppercase mt-1">
            {pendingCount > 0
              ? `Còn ${pendingCount} liều chưa uống`
              : "Đã hoàn thành"}
          </p>
        </div>
        <div className="flex gap-2 mr-20 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={requestNotificationPermission}
            className="w-14 h-14 bg-white text-[#FF8A00] flex items-center justify-center rounded-2xl shadow-sm border-2 border-orange-100 transition-transform"
          >
            <Bell size={28} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="w-14 h-14 bg-gradient-to-br from-[#FF8A00] to-orange-500 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-orange-500/30 transition-transform"
          >
            <Plus size={28} strokeWidth={3} />
          </motion.button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 py-2">
        {datesWrapper.map((dayObj, i) => {
          const dayName = getDayName(dayObj);
          const dateStr = getLocalDateString(dayObj);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center min-w-[70px] p-4 rounded-3xl transition-all ${
                isSelected
                  ? "bg-[#FF8A00] text-white shadow-xl shadow-orange-500/20 scale-105"
                  : "bg-white text-gray-400 border border-gray-100 shadow-sm hover:bg-orange-50"
              }`}
            >
              <span className="text-[10px] uppercase font-black opacity-70 mb-1 tracking-widest">
                {dayName === "Hôm nay" ? "Ngày" : dayName}
              </span>
              <span className="text-xl font-display font-black">
                {dayObj.getDate()}
              </span>
              {isSelected && (
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-2" />
              )}
            </button>
          );
        })}

        {/* Custom Date Picker */}
        <div className="relative flex flex-col items-center min-w-[70px] p-4 rounded-3xl transition-all bg-white text-gray-400 border border-gray-100 shadow-sm hover:bg-orange-50 overflow-hidden cursor-pointer">
          <span className="text-[10px] uppercase font-black opacity-70 mb-1 tracking-widest text-center pointer-events-none">
            Khác
          </span>
          <span className="text-xl h-[28px] flex items-center justify-center">
            <Calendar size={24} className="text-gray-400 pointer-events-none" strokeWidth={2.5} />
          </span>
          <input
            type="date"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:p-0"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
              }
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6 before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-1 before:bg-orange-100 before:rounded-full">
        <AnimatePresence>
          {timelineItems.length === 0 && (
            <p className="text-center text-gray-400 font-bold py-10">
              Chưa có lịch uống thuốc nào.
            </p>
          )}
          {timelineItems.map((med, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              key={`${med.id}-${med.time}-${index}`}
              className="flex gap-6 items-start group"
            >
              <div
                className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm transition-all ${
                  med.isDone
                    ? "bg-green-500 text-white scale-90"
                    : "bg-white text-gray-400 border-orange-100"
                }`}
              >
                {med.isDone ? (
                  <CheckCircle2 size={32} />
                ) : (
                  <span className="text-xl">{med.icon}</span>
                )}
              </div>

              <div
                className={`flex-1 p-6 rounded-[32px] border-2 transition-all shadow-sm relative overflow-hidden ${
                  med.isDone
                    ? "bg-gray-50 border-gray-100 opacity-70"
                    : `bg-white border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.03)]`
                }`}
              >
                {/* Delete button absolutely positioned */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedication(med.id);
                  }}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex justify-between items-start mb-4 pr-10">
                  <div>
                    <h3
                      className={`text-2xl font-black tracking-tight ${med.isDone ? "text-gray-500" : "text-gray-900"}`}
                    >
                      {med.name}
                    </h3>
                    <p
                      className={`text-sm font-black uppercase tracking-widest mt-1 ${med.isDone ? "text-gray-400" : "text-orange-500"}`}
                    >
                      {med.dose}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-[12px] text-xs font-black uppercase tracking-widest text-[#FF8A00] border border-orange-100">
                    <Clock size={14} /> {med.time}
                  </div>
                  {!med.isDone && med.note && (
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-[12px] text-xs font-black uppercase tracking-widest text-gray-500">
                      <Info size={14} /> <span>{med.note}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => markTaken(med.id, med.time, selectedDate)}
                    className={`flex-1 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-colors ${
                      med.isDone
                        ? "bg-gray-200 text-gray-500"
                        : "bg-gradient-to-tr from-[#FF8A00] to-orange-500 text-white shadow-lg shadow-orange-500/30"
                    }`}
                  >
                    {med.isDone ? "Bỏ đánh dấu" : "Đã uống xong"}
                    {!med.isDone && <CheckCircle2 size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-[#FF8A00] to-orange-500 rounded-[32px] p-8 shadow-xl shadow-orange-500/20 relative overflow-hidden flex items-center justify-between text-white">
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <h4 className="text-xl font-black tracking-tight">
            Tiến độ uống thuốc
          </h4>
          <p className="text-white/70 font-bold text-sm">
            {Math.round(progressPercent)}% Hoàn thành ({completedCount}/
            {timelineItems.length})
          </p>
        </div>
        <div className="relative w-20 h-20 z-10">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-white/20"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={213}
              strokeDashoffset={213 - 213 * (progressPercent / 100)}
              className="text-white transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-black text-white text-lg">
            {completedCount}/{timelineItems.length}
          </div>
        </div>
      </div>

      {/* Add Medication Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showAdd && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md flex items-end justify-center p-4 pointer-events-auto"
                onClick={() => setShowAdd(false)}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-white rounded-t-[40px] rounded-b-[24px] p-8 pb-10 shadow-2xl relative max-w-[480px] max-h-[85vh] overflow-y-auto no-scrollbar flex flex-col"
                >
                  <div className="w-12 h-1.5 shrink-0 bg-gray-200 rounded-full mx-auto mb-6" />

                  <h2 className="text-3xl font-display font-black tracking-tight text-gray-900 mb-8">
                    Thêm thuốc mới
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#FF8A00] ml-4 absolute -top-2 left-2 bg-white px-2">
                        Tên thuốc
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ví dụ: Panadol..."
                        className="w-full bg-transparent border-2 border-gray-200 rounded-[20px] px-6 py-5 text-xl font-bold text-gray-900 focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 absolute -top-2 left-2 bg-white px-2">
                        Liều lượng
                      </label>
                      <input
                        type="text"
                        value={newDose}
                        onChange={(e) => setNewDose(e.target.value)}
                        placeholder="1 viên"
                        className="w-full bg-transparent border-2 border-gray-200 rounded-[20px] px-6 py-5 text-lg font-bold text-gray-900 focus:border-[#FF8A00] outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-4 p-5 rounded-[24px] border-2 border-gray-100 bg-gray-50/50">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Thời gian uống
                      </label>
                      <div className="flex flex-row gap-2 md:gap-3 items-center">
                        <div className="flex-1 space-y-1.5 focus-within:text-[#FF8A00] text-gray-500 min-w-0">
                          <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-1 transition-colors block truncate">
                            Bắt đầu
                          </label>
                          <input
                            type="date"
                            value={newStartDate}
                            onChange={(e) => setNewStartDate(e.target.value)}
                            className="w-full bg-white border-2 border-gray-200 rounded-[16px] pl-2 pr-0.5 md:px-3 py-3 text-[11px] md:text-sm font-bold text-gray-900 focus:border-[#FF8A00] outline-none transition-all shadow-sm"
                          />
                        </div>
                        <div className="flex-1 space-y-1.5 focus-within:text-[#FF8A00] text-gray-500 min-w-0">
                          <label
                            className="text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-1 transition-colors block truncate"
                            title="Kết thúc (Tuỳ chọn)"
                          >
                            Kết thúc (Tuỳ chọn)
                          </label>
                          <input
                            type="date"
                            value={newEndDate}
                            min={newStartDate}
                            onChange={(e) => setNewEndDate(e.target.value)}
                            className="w-full bg-white border-2 border-gray-200 rounded-[16px] pl-2 pr-0.5 md:px-3 py-3 text-[11px] md:text-sm font-bold text-gray-900 focus:border-[#FF8A00] outline-none transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-5 rounded-[24px] border-2 border-gray-100 bg-gray-50/50">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Giờ uống trong ngày
                      </label>

                      {/* Quick Selection */}
                      <div className="grid grid-cols-4 gap-2">
                        {["08:00", "12:00", "18:00", "20:00"].map((t) => (
                          <button
                            key={t}
                            onClick={() =>
                              setNewTimes((prev) =>
                                prev.includes(t)
                                  ? prev.filter((x) => x !== t)
                                  : [...prev, t],
                              )
                            }
                            className={`py-3 rounded-[16px] text-sm font-bold border-2 transition-all ${
                              newTimes.includes(t)
                                ? "bg-[#FF8A00] border-[#FF8A00] text-white shadow-lg shadow-orange-500/20"
                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-2 py-2">
                        <div className="h-[1px] flex-1 bg-gray-200"></div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                          Hoặc thêm giờ khác
                        </span>
                        <div className="h-[1px] flex-1 bg-gray-200"></div>
                      </div>

                      {/* Custom Time Input */}
                      <div className="relative">
                        <input
                          type="time"
                          onChange={(e) => {
                            if (
                              e.target.value &&
                              !newTimes.includes(e.target.value)
                            ) {
                              setNewTimes([...newTimes, e.target.value]);
                              e.target.value = ""; // Reset after selecting
                            }
                          }}
                          className="w-full bg-white border-2 border-dashed border-gray-200 text-center rounded-[20px] px-6 py-4 text-lg font-bold text-gray-400 focus:border-[#FF8A00] focus:text-[#FF8A00] outline-none transition-all appearance-none cursor-pointer hover:bg-orange-50/50"
                        />
                      </div>

                      {/* Selected Times Tags */}
                      <AnimatePresence>
                        {newTimes.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-wrap gap-2 pt-2"
                          >
                            {newTimes.sort().map((t) => (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                key={t}
                                className="bg-white text-[#FF8A00] px-4 py-2 rounded-xl text-sm font-black border-2 border-orange-100 flex items-center gap-2 shadow-sm"
                              >
                                {t}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewTimes(
                                      newTimes.filter((x) => x !== t),
                                    );
                                  }}
                                  className="text-orange-300 hover:text-red-500 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                                >
                                  ×
                                </button>
                              </motion.span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={!newName || newTimes.length === 0}
                      className={`w-full py-5 rounded-[20px] text-lg font-black tracking-widest uppercase mt-6 transition-all ${
                        !newName || newTimes.length === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-[#FF8A00] text-white shadow-lg shadow-orange-500/30 active:scale-95"
                      }`}
                    >
                      {!newName
                        ? "Nhập tên thuốc"
                        : newTimes.length === 0
                          ? "Chọn giờ uống"
                          : "Lưu thông tin"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.getElementById('app-modal-portal') || document.body,
        )}
    </div>
  );
};

export default Medicines;
