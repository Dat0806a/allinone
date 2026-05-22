import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Book, Search, Calendar, Landmark, Plus, ArrowUpDown, ChevronDown, Check, Sparkles, UserCheck, Stethoscope, FileText, ClipboardList } from "lucide-react";
import { PremiumInput, PremiumButton, cn } from "../../components/premium/UI";
import { supabase } from "../../lib/supabase";
import { useScrollLock } from "../../hooks/useScrollLock";

interface MedicalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalHistory: any[];
  userId: string;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const MedicalHistoryModal: React.FC<MedicalHistoryModalProps> = ({
  isOpen,
  onClose,
  medicalHistory,
  userId,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form states
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [result, setResult] = useState("");
  const [prescriptionText, setPrescriptionText] = useState(""); // Comma separated values
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter history
  const filteredHistory = medicalHistory.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.hospital || "").toLowerCase().includes(q) ||
      (item.doctor || "").toLowerCase().includes(q) ||
      (item.diagnosis || "").toLowerCase().includes(q) ||
      (item.result || "").toLowerCase().includes(q)
    );
  });

  // Sort history
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const d1 = new Date(a.date).getTime();
    const d2 = new Date(b.date).getTime();
    return sortOrder === "desc" ? d2 - d1 : d1 - d2;
  });

  const handleSeedMock = async () => {
    try {
      setIsSubmitting(true);
      const demoRecords = [
        {
          user_id: userId,
          hospital: "Bệnh viện Chợ Rẫy",
          doctor: "PGS. TS. Nguyễn Văn A",
          date: "2026-03-15",
          diagnosis: "Đau dạ dày cấp tính (K29)",
          result: "Niêm mạc dạ dày phù nề xung huyết nhẹ, không loét sẹo.",
          prescription: [
            "Nexium 40mg - 1 viên/ngày (trước khi ăn 30 phút - sáng)",
            "Gaviscon - 2 gói/ngày (uống sau ăn 1 tiếng)"
          ],
          notes: "Ăn đồ ăn mềm lỏng, kiêng rượu bia, đồ chua cay, tránh căng thẳng căng tức."
        },
        {
          user_id: userId,
          hospital: "Bệnh viện Đại học Y Dược TP.HCM",
          doctor: "ThS. BS. Trần Thị B",
          date: "2025-11-20",
          diagnosis: "Cảm cúm mùa / Viêm họng cấp",
          result: "Họng sạch, thân nhiệt ổn định 36.8 độ C, phổi thông khí rõ.",
          prescription: [
            "Telfast 120mg - 1 viên/ngày (tối)",
            "Hapacol 650mg - Uống 1 viên khi sốt trên 38.5 độ C"
          ],
          notes: "Uống nhiều nước ấm, nghỉ ngơi tĩnh tâm từ 2-3 ngày."
        }
      ];

      for (const record of demoRecords) {
        await supabase.from('medical_history').insert(record);
      }
      onShowToast("Đã tải dữ liệu lịch sử khám mẫu thành công!", "success");
    } catch (err) {
      console.error(err);
      onShowToast("Tải mẫu thất bại!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital.trim() || !doctor.trim() || !date || !diagnosis.trim()) {
      onShowToast("Vui lòng điền đủ các mục bắt buộc (*)", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const prescription = prescriptionText
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      await supabase.from('medical_history').insert({
        user_id: userId,
        hospital: hospital.trim(),
        doctor: doctor.trim(),
        date,
        diagnosis: diagnosis.trim(),
        result: result.trim(),
        prescription,
        notes: notes.trim()
      });

      onShowToast("Đã lưu hồ sơ khám y khoa mới thành công!", "success");
      
      // Reset form
      setHospital("");
      setDoctor("");
      setDate("");
      setDiagnosis("");
      setResult("");
      setPrescriptionText("");
      setNotes("");
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      onShowToast("Không thể thêm hồ sơ lúc này!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
        className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 relative z-10 flex flex-col max-h-[85vh] my-auto overflow-hidden text-left"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Book size={20} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-800 leading-none">Lịch sử khám bệnh</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Lịch sử khám & đơn thuốc cũ của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Clinical Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-4 custom-scrollbar">
          
          <AnimatePresence mode="wait">
            {isFormOpen ? (
              /* FORM SUBMIT RECORD TRAY */
              <motion.div
                key="form-entry"
                initial={{ opacity: 0, scale: 0.98, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                className="bg-slate-50/70 border border-slate-100 p-5 rounded-3xl space-y-4"
              >
                <h4 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
                  Thêm hồ sơ bệnh án mới
                </h4>

                <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
                  <PremiumInput
                    label="Tên Bệnh viện / Phòng khám *"
                    placeholder="Bệnh viện Bạch Mai, Tâm Anh VN..."
                    value={hospital}
                    onChange={(e: any) => setHospital(e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <PremiumInput
                      label="Bác sĩ chẩn trị *"
                      placeholder="BS. Nguyễn Văn A"
                      value={doctor}
                      onChange={(e: any) => setDoctor(e.target.value)}
                    />

                    <PremiumInput
                      type="date"
                      label="Ngày thăm khám *"
                      value={date}
                      onChange={(e: any) => setDate(e.target.value)}
                    />
                  </div>

                  <PremiumInput
                    label="Kết luận chẩn đoán (ICD) *"
                    placeholder="Viêm dạ dày, Tăng huyết áp..."
                    value={diagnosis}
                    onChange={(e: any) => setDiagnosis(e.target.value)}
                  />

                  <PremiumInput
                    label="Nội dung kết quả xét nghiệm"
                    placeholder="Chỉ số máu sinh hóa bình thường..."
                    value={result}
                    onChange={(e: any) => setResult(e.target.value)}
                  />

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-500 ml-1">Đơn thuốc chỉ định (Mỗi loại 1 dòng)</label>
                    <textarea
                      rows={2}
                      placeholder="Ví dụ:&#10;Amlodipin 5mg - 1 viên/ngày&#10;Nexium 40mg - 1 viên/ngày"
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-3 transition-all outline-none font-semibold focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-slate-700 text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-500 ml-1">Lời dặn bác sĩ / Ghi chú</label>
                    <textarea
                      rows={2}
                      placeholder="Ăn nhạt uống nhiều nước ấm..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-3 transition-all outline-none font-semibold focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-slate-700 text-xs resize-none"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1 py-3 text-xs font-bold bg-white text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      Hủy, Quay lại
                    </button>
                    <PremiumButton
                      type="submit"
                      isLoading={isSubmitting}
                      className="flex-1 text-xs font-black uppercase tracking-wider py-3"
                    >
                      Xác nhận Lưu
                    </PremiumButton>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* TIMELINE LIST VIEW WITH FILTERS */
              <motion.div
                key="timeline-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Search Bar / Filters */}
                <div className="flex gap-2.5 shrink-0">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="Tìm bệnh viện, bác sĩ, bệnh trạng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-3 pl-10 pr-4 transition-all outline-none text-xs font-semibold focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-slate-700"
                    />
                  </div>

                  <button
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200/50 cursor-pointer"
                    title={sortOrder === "desc" ? "Mới nhất trước" : "Cũ nhất trước"}
                  >
                    <ArrowUpDown size={16} />
                  </button>

                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="h-10 px-3 flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    <Plus size={14} className="stroke-[3]" /> Thêm hồ sơ
                  </button>
                </div>

                {sortedHistory.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-6 space-y-4">
                    <ClipboardList size={44} className="mx-auto text-slate-300 stroke-[1.2]" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">Chưa có hồ sơ khám bệnh nào</p>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        Theo dõi lịch sử khám định kỳ giúp bác sĩ AI tối ưu hóa khả năng can thiệp dự phòng tai biến.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSeedMock}
                      className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-700 shadow-sm cursor-pointer transition-colors"
                    >
                      {isSubmitting ? "Đang tải dữ liệu..." : "Tự động tải 2 hồ sơ mẫu"}
                    </button>
                  </div>
                ) : (
                  /* Expanded accordion timeline list */
                  <div className="space-y-3 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {sortedHistory.map((item) => {
                      const isExpanded = expandedId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "relative bg-white border rounded-2xl p-4 ml-12 transition-all cursor-pointer",
                            isExpanded ? "border-primary/20 shadow-md ring-4 ring-primary/5" : "border-slate-100 hover:bg-slate-50/50"
                          )}
                          onClick={() => toggleExpand(item.id)}
                        >
                          {/* Timeline dot */}
                          <div className={cn(
                            "absolute -left-[30px] top-4.5 w-[14px] h-[14px] rounded-full border-2 border-white shadow-sm transition-all z-10",
                            isExpanded ? "bg-primary scale-110" : "bg-slate-300"
                          )} />

                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                                <Calendar size={11} /> {new Date(item.date).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
                              </div>
                              <h5 className="font-extrabold text-sm text-slate-800 tracking-tight mt-1 leading-snug">
                                {item.diagnosis}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{item.hospital}</p>
                            </div>
                            
                            <ChevronDown size={14} className={cn("text-slate-400 transition-transform mt-0.5", isExpanded ? "rotate-180" : "")} />
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-3 pt-3 border-t border-slate-100 space-y-3 text-xs"
                                onClick={(e) => e.stopPropagation()} // block parent toggle
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-500 uppercase text-[9px] tracking-wider">
                                    <Stethoscope size={12} className="text-primary" /> Bác sĩ phụ trách
                                  </div>
                                  <p className="font-extrabold text-slate-800 pl-4">{item.doctor}</p>
                                </div>

                                {item.result && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-500 uppercase text-[9px] tracking-wider">
                                      <FileText size={12} className="text-secondary" /> Kết quả kiểm tra
                                    </div>
                                    <p className="text-slate-600 font-medium leading-relaxed pl-4">{item.result}</p>
                                  </div>
                                )}

                                {item.prescription && item.prescription.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-500 uppercase text-[9px] tracking-wider">
                                      <ClipboardList size={12} className="text-emerald-500" /> Toa thuốc chỉ định
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pl-4">
                                      {item.prescription.map((pill: string, pIdx: number) => (
                                        <div key={pIdx} className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-lg text-[10px]">
                                          💊 {pill}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {item.notes && (
                                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50 mt-2">
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Lời dặn bổ sung:</p>
                                    <p className="text-slate-500 font-semibold leading-relaxed mt-1">{item.notes}</p>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Informative Footer banner */}
        {!isFormOpen && (
          <div className="pt-4 border-t border-slate-50 bg-slate-50/50 rounded-2xl p-4.5 flex gap-2 w-full text-[10px] text-slate-500 font-semibold leading-relaxed shrink-0">
            <Sparkles size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>Mọi báo cáo bệnh án bạn đưa lên sẽ được đồng bộ phân loại chi tiết bằng AI để hỗ trợ tự cảnh báo tương tác thuốc bất lợi khi bạn yêu cầu bốc thuốc mới! Hoàn toàn riêng tư và bảo mật tối cao.</span>
          </div>
        )}
      </motion.div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.getElementById("app-modal-portal") || document.body)
    : null;
};
