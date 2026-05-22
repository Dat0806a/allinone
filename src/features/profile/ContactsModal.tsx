import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldAlert, Plus, Edit2, Trash2, Phone, Mail, MapPin, Sparkles, Check, AlertCircle } from "lucide-react";
import { PremiumInput, PremiumButton, cn } from "../../components/premium/UI";
import { supabase } from "../../lib/supabase";
import { useScrollLock } from "../../hooks/useScrollLock";

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: any[];
  userId: string;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

const RELATION_BADGES: Record<string, { bg: string; text: string }> = {
  "Cha": { bg: "bg-blue-50 text-blue-600 border-blue-100", text: "Cha" },
  "Mẹ": { bg: "bg-pink-50 text-pink-600 border-pink-100", text: "Mẹ" },
  "Vợ/Chồng": { bg: "bg-purple-50 text-purple-600 border-purple-100", text: "Vợ/Chồng" },
  "Con": { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", text: "Con" },
  "Bạn bè": { bg: "bg-amber-50 text-amber-600 border-amber-100", text: "Bạn bè" },
  "Khác": { bg: "bg-slate-50 text-slate-600 border-slate-100", text: "Khác" }
};

export const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  onClose,
  contacts,
  userId,
  onShowToast,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Vợ/Chồng");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Quick safety confirmations
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setRelationship("Vợ/Chồng");
    setPhone("");
    setEmail("");
    setAddress("");
    setEditingContact(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (contact: any) => {
    setEditingContact(contact);
    setName(contact.name || "");
    setRelationship(contact.relationship || "Cha");
    setPhone(contact.phone || "");
    setEmail(contact.email || "");
    setAddress(contact.address || "");
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('emergency_contacts').delete().eq('id', id);
      onShowToast("Đã xóa liên hệ khẩn cấp!", "success");
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error(err);
      onShowToast("Không thể xóa lúc này!", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast("Họ tên liên hệ là bắt buộc!", "error");
      return;
    }
    
    // Simple Vietnamese phone validate
    const phoneRegex = /^(0|84)\d{9,10}$/;
    if (!phone.replace(/\s/g, "").match(phoneRegex)) {
      onShowToast("Số điện thoại liên hệ phải hợp lệ!", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingContact) {
        // Edit flow
        await supabase.from('emergency_contacts').update({
          name: name.trim(),
          relationship,
          phone_number: phone.trim(),
        }).eq('id', editingContact.id);
        onShowToast("Cập nhật thông tin gia đình thành công!", "success");
      } else {
        // Add flow
        await supabase.from('emergency_contacts').insert({
          user_id: userId,
          name: name.trim(),
          relationship,
          phone_number: phone.trim(),
        });
        onShowToast("Thêm liên hệ khẩn cấp mới thành công!", "success");
      }
      resetForm();
    } catch (err: any) {
      console.error(err);
      onShowToast("Thao tác thất bại. Vui lòng thử lại", "error");
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
        className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 relative z-10 flex flex-col max-h-[85vh] my-auto overflow-hidden text-left"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-800 leading-none">Bảo mật & Người thân</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Danh bạ khẩn cấp khi gặp sự cố SOS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content & Form Panel */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-4 custom-scrollbar">
          
          <AnimatePresence mode="wait">
            {isFormOpen ? (
              /* FORM ENTRY TRAY */
              <motion.div
                key="form-entry"
                initial={{ opacity: 0, scale: 0.98, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                className="bg-slate-50/70 border border-slate-100 p-5 rounded-3xl space-y-4"
              >
                <h4 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
                  {editingContact ? "Cập nhật liên hệ người thân" : "Thêm mới liên hệ người thân"}
                </h4>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <PremiumInput
                    label="Tên người thân / Khẩn cấp *"
                    placeholder="Nhập tên người thân..."
                    value={name}
                    onChange={(e: any) => setName(e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-500 ml-1">Mối quan hệ *</label>
                      <select
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-3 transition-all outline-none text-sm font-semibold focus:border-primary/40 text-slate-700"
                      >
                        {Object.keys(RELATION_BADGES).map((rel) => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                    </div>

                    <PremiumInput
                      label="Số điện thoại *"
                      placeholder="0912xxxxxx"
                      value={phone}
                      onChange={(e: any) => setPhone(e.target.value)}
                    />
                  </div>

                  <PremiumInput
                    type="email"
                    label="Địa chỉ Email"
                    placeholder="mail@example.com"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                  />

                  <PremiumInput
                    label="Địa chỉ nơi ở"
                    placeholder="Hà Nội, Việt Nam"
                    value={address}
                    onChange={(e: any) => setAddress(e.target.value)}
                  />

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-3 text-xs font-bold bg-white text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      Hủy và Quay lại
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
              /* CONTACTS LIST */
              <motion.div
                key="contacts-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Danh sách liên hệ ({contacts.length})</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-1.5 py-2 px-3.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors cursor-pointer justify-center text-xs font-black uppercase tracking-wider shadow-md shadow-rose-100"
                  >
                    <Plus size={14} className="stroke-[3]" /> Thêm người thân
                  </motion.button>
                </div>

                {contacts.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-6 space-y-3">
                    <ShieldAlert size={44} className="mx-auto text-rose-300 stroke-[1.5]" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">Chưa thiết lập danh bạ thân cận</p>
                      <p className="text-xs text-slate-400 mt-1">Cần thêm tối thiểu 1 người thân thương để trợ giúp bật chuông SOS hoặc liên lạc y tế khẩn cấp, bảo vệ bạn mọi lúc!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-white hover:bg-slate-50 border border-slate-100 p-4.5 rounded-[2rem] transition-all flex flex-col gap-3 relative overflow-hidden group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-800 tracking-tight">{contact.name}</span>
                            <span className={cn(
                              "text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full border uppercase leading-none select-none",
                              RELATION_BADGES[contact.relationship as keyof typeof RELATION_BADGES]?.bg || "bg-slate-50 text-slate-600 border-slate-100"
                            )}>
                              {contact.relationship}
                            </span>
                          </div>
                          
                          <div className="flex gap-1.5 opacity-85 hover:opacity-100">
                            <button
                              onClick={() => handleEditClick(contact)}
                              className="w-7 h-7 bg-slate-50 rounded-full hover:bg-primary/10 hover:text-primary text-slate-400 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(contact.id)}
                              className="w-7 h-7 bg-slate-50 rounded-full hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Contact entries */}
                        <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-emerald-500 shrink-0" />
                            <span className="font-bold text-slate-700">{contact.phone}</span>
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={13} className="text-sky-500 shrink-0" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                          {contact.address && (
                            <div className="flex items-center gap-2">
                              <MapPin size={13} className="text-amber-500 shrink-0" />
                              <span className="truncate">{contact.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Slide Confirm Delete Overlay */}
                        <AnimatePresence>
                          {confirmDeleteId === contact.id && (
                            <motion.div
                              initial={{ x: "100%" }}
                              animate={{ x: 0 }}
                              exit={{ x: "100%" }}
                              className="absolute inset-0 bg-slate-900/90 text-white p-4 flex items-center justify-between z-10 rounded-[1.8rem] transition-all"
                            >
                              <div className="flex items-center gap-2 font-sans">
                                <AlertCircle size={18} className="text-rose-400 shrink-0" />
                                <div className="text-left leading-tight">
                                  <p className="text-xs font-black">Xác nhận xóa liên hệ này?</p>
                                  <p className="text-[10px] text-slate-400">Bạn sẽ không thể khôi phục lại.</p>
                                </div>
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold cursor-pointer"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => handleDelete(contact.id)}
                                  className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 rounded-xl text-xs font-black cursor-pointer"
                                >
                                  Xóa bỏ
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Informative Footer banner */}
        {!isFormOpen && (
          <div className="pt-4 border-t border-slate-50 bg-slate-50/50 rounded-2xl p-4.5 flex gap-2 w-full text-[10px] text-slate-500 font-semibold leading-relaxed shrink-0">
            <Sparkles size={14} className="text-rose-500 shrink-0 mt-0.5 animate-pulse" />
            <span>Liên hệ khẩn cấp giúp hệ thống tự gửi SMS cảnh báo kèm tọa độ GPS định vị của bạn ngay khi bạn kích hoạt nút trạng thái khẩn cấp SOS trên góc màn hình! Phản ứng nhanh cứu mạng trong từng giây!</span>
          </div>
        )}
      </motion.div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.getElementById("app-modal-portal") || document.body)
    : null;
};
