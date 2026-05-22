import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Bell,
  Shield,
  Wallet,
  Book,
  LogOut,
  ChevronRight,
  Edit3,
  Settings,
  Trash2,
  Edit2,
  MessageSquare,
  Sparkles,
  Phone,
  Calendar,
  Lock,
} from "lucide-react";
import { PremiumCard, PremiumButton, cn } from "../components/premium/UI";
import { supabase } from "../lib/supabase";
import { useAppStore, useUserStore } from "../store/useStore";

// Import modular subcomponents
import { EditProfileModal } from "./profile/EditProfileModal";
import { ContactsModal } from "./profile/ContactsModal";
import { SubscriptionModal } from "./profile/SubscriptionModal";
import { MedicalHistoryModal } from "./profile/MedicalHistoryModal";
import { NotificationsModal } from "./profile/NotificationsModal";

interface UserProfileData {
  displayName: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  address: string;
  bio: string;
  bloodType: string;
  weight: number;
  height: number;
  photoURL: string;
  subscription: {
    planId: string;
    status: string;
    expiresAt: string;
  };
  notifications: {
    medicationReminder: boolean;
    appointmentReminder: boolean;
    aiNotification: boolean;
    systemNotification: boolean;
    reminderTime: string;
    sound: string;
    vibrate: boolean;
  };
}

const Profile: React.FC = () => {
  const { setActiveTab } = useAppStore();
  const { user } = useUserStore();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User document state
  const [userDoc, setUserDoc] = useState<UserProfileData>({
    displayName: user?.user_metadata?.full_name || user?.displayName || "Người dùng",
    email: user?.email || "",
    phone: "",
    birthday: "1980-01-01",
    gender: "Nam",
    address: "Hà Nội, Việt Nam",
    bio: "Trân quý cuộc sống mỗi ngày",
    bloodType: "O+",
    weight: 70,
    height: 175,
    photoURL: user?.user_metadata?.avatar_url || user?.photoURL || "",
    subscription: {
      planId: "free",
      status: "active",
      expiresAt: "2026-12-31",
    },
    notifications: {
      medicationReminder: true,
      appointmentReminder: true,
      aiNotification: true,
      systemNotification: false,
      reminderTime: "21:00",
      sound: "calm_chime",
      vibrate: true,
    },
  });

  // Modal active states
  const [activeModal, setActiveModal] = useState<
    "edit_profile" | "contacts" | "subscription" | "medical" | "notifications" | null
  >(null);

  // Self-contained Toast indicator state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Listen / populate the user document
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setUserDoc((prev) => ({
          ...prev,
          displayName: data.full_name || prev.displayName,
          bloodType: data.blood_type || prev.bloodType,
          photoURL: data.avatar_url || prev.photoURL,
          subscription: { ...prev.subscription, planId: data.subscription_tier || 'free' },
        }));
      }
      setIsLoading(false);
    };

    fetchProfile();

    const subscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, fetchProfile)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [user]);

  // 2. Realtime listener for User's community posts
  useEffect(() => {
    if (!user) return;
    
    const fetchPosts = async () => {
      const { data } = await supabase.from('community_posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setPosts(data);
    };

    fetchPosts();

    const subscription = supabase
      .channel('posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts', filter: `user_id=eq.${user.id}` }, fetchPosts)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [user]);

  // 3. Realtime listener for User's Emergency contacts
  useEffect(() => {
    if (!user) return;
    
    const fetchContacts = async () => {
      const { data } = await supabase.from('emergency_contacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setContacts(data);
    };

    fetchContacts();

    const subscription = supabase
      .channel('contacts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_contacts', filter: `user_id=eq.${user.id}` }, fetchContacts)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [user]);

  // 4. Realtime listener for Medical History
  useEffect(() => {
    if (!user) return;
    
    const fetchMedicalHistory = async () => {
      const { data } = await supabase.from('medical_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setMedicalHistory(data);
    };

    fetchMedicalHistory();

    const subscription = supabase
      .channel('medical_history_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_history', filter: `user_id=eq.${user.id}` }, fetchMedicalHistory)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [user]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Clear store as a precaution, though App.tsx should handle it via listener
      useUserStore.getState().setUser(null);
    } catch (error: any) {
      console.error("Logout error:", error.message);
      showToast("Lỗi khi đăng xuất!", "error");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await supabase.from('community_posts').delete().eq('id', postId);
      showToast("Xóa bài viết thành công!", "success");
    } catch (error) {
      console.error("Lỗi khi xóa bài:", error);
      showToast("Không thể xóa bài!", "error");
    }
  };

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center font-sans font-bold text-slate-400">
        Bạn chưa đăng nhập tài khoản.
      </div>
    );
  }

  // Find human designation for subscription
  const displayPlanName =
    userDoc.subscription?.planId === "premium"
      ? "Premium Guardian"
      : userDoc.subscription?.planId === "standard"
      ? "Standard AI Plus"
      : "Miễn phí (Free)";

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Toast Alert Widget */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={cn(
              "fixed top-4 left-1/2 -translate-x-1/2 z-[11000] px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black tracking-wide bg-slate-900 border text-white uppercase",
              toast.type === "success"
                ? "border-emerald-500/20 bg-gradient-to-r from-emerald-500 to-teal-500"
                : toast.type === "error"
                ? "border-rose-500/20 bg-gradient-to-r from-rose-500 to-red-600"
                : "border-sky-500/20 bg-gradient-to-r from-sky-500 to-blue-600"
            )}
          >
            <Sparkles size={14} className="stroke-[3] animate-pulse" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none">
          Hồ sơ của <span className="text-primary italic font-serif">bạn</span>
        </h1>
        <PremiumButton
          variant="ghost"
          onClick={() => setActiveTab("settings")}
          className="w-12 h-12 p-0 rounded-2xl mr-20 shrink-0 flex items-center justify-center border border-slate-100 bg-white shadow-sm"
        >
          <Settings size={22} className="text-slate-600 hover:rotate-45 transition-transform duration-300" />
        </PremiumButton>
      </div>

      {/* Main Profile Card Section */}
      <div className="relative pt-12">
        <PremiumCard className="relative z-10 pt-16 flex flex-col items-center border border-slate-100 card-gradient_elegant overflow-visible">
          
          {/* Circular Headcut-Defeated Avatar Component */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="relative group select-none">
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-tr from-primary via-orange-400 to-amber-300 border-8 border-white premium-shadow overflow-hidden flex items-center justify-center text-white text-4xl font-black font-display shrink-0 relative">
                {userDoc.photoURL ? (
                  <img
                    src={userDoc.photoURL}
                    alt="Avatar người dùng"
                    className="w-full h-full object-cover object-center pointer-events-none rounded-[1.6rem]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  userDoc.displayName.charAt(0).toUpperCase() || "T"
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveModal("edit_profile")}
                className="absolute bottom-0.5 -right-0.5 w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center border-4 border-white shadow-md hover:bg-primary-dark transition-colors cursor-pointer z-20"
                title="Thay đổi thông tin & Avatar"
              >
                <Edit3 size={14} className="stroke-[2.5]" />
              </motion.button>
            </div>
          </div>

          {/* Persona Descriptions */}
          <div className="text-center space-y-1 mt-3">
            <h2 className="text-2xl font-display font-black text-slate-800 leading-tight">
              {userDoc.displayName}
            </h2>
            
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border leading-tight select-none",
                userDoc.subscription?.planId === "premium" 
                  ? "bg-orange-50 text-orange-600 border-orange-100 font-extrabold"
                  : userDoc.subscription?.planId === "standard"
                  ? "bg-sky-50 text-sky-600 border-sky-100"
                  : "bg-slate-50 text-slate-500 border-slate-100"
              )}>
                🏆 {displayPlanName}
              </span>
            </div>

            {userDoc.bio && (
              <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto pt-2 line-clamp-2 italic">
                "{userDoc.bio}"
              </p>
            )}
          </div>

          {/* Core Healthcare Quantities Grid */}
          <div className="grid grid-cols-3 w-full gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="text-center space-y-1">
              <p className="text-xl font-display font-black text-primary leading-none">{posts.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Bài viết
              </p>
            </div>
            
            <div className="text-center space-y-1 border-x border-slate-100">
              <p className="text-xl font-display font-black text-slate-800 leading-none">{userDoc.bloodType || "N/A"}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Nhóm máu
              </p>
            </div>

            <div className="text-center space-y-1">
              <p className="text-xl font-display font-black text-slate-800 leading-none">
                {userDoc.weight ? `${userDoc.weight}kg` : "N/A"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cân nặng
              </p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Interactive System Utilities Portal */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-extrabold text-slate-800 px-1 tracking-tight leading-none">
          Tiện ích sức khỏe chuyên sâu
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <MenuLink
            icon={Shield}
            label="Bảo mật & Người thân"
            sub="Quản lý danh bạ khẩn cấp SOS"
            badgeCount={contacts.length > 0 ? `${contacts.length} người` : undefined}
            onClick={() => setActiveModal("contacts")}
          />
          <MenuLink
            icon={Wallet}
            label="Gói dịch vụ AI"
            sub={displayPlanName}
            onClick={() => setActiveModal("subscription")}
          />
          <MenuLink
            icon={Book}
            label="Lịch sử khám bệnh"
            sub="Xem lại hồ sơ y khoa & đơn thuốc"
            badgeCount={medicalHistory.length > 0 ? `${medicalHistory.length} ca` : undefined}
            onClick={() => setActiveModal("medical")}
          />
          <MenuLink
            icon={Bell}
            label="Cài đặt thông báo"
            sub="Tùy chỉnh lịch dùng thuốc 2026"
            onClick={() => setActiveModal("notifications")}
          />
        </div>
      </div>

      {/* User's Posts Feed */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-extrabold text-slate-800 px-1 tracking-tight leading-none">
          Bài đăng của tôi ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-[2rem] p-6 text-slate-400 space-y-1">
            <p className="text-sm font-bold text-slate-500">Bạn chưa đăng tải tâm sự nào</p>
            <p className="text-[10px] text-slate-400">Hãy ghé thăm Cộng đồng để bắt đầu thảo luận, sẻ chia nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 relative text-left"
                >
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString(
                            "vi-VN"
                          )
                        : "Hôm nay"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 rounded-full cursor-pointer"
                        title="Xóa bài viết"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {post.content && (
                    <p className="text-slate-700 text-sm mb-3.5 whitespace-pre-wrap font-medium leading-relaxed">
                      {post.content}
                    </p>
                  )}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="ảnh bài đăng"
                      className="w-full h-36 object-cover rounded-2xl mb-3.5"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                    <span className="flex items-center gap-1 select-none">
                      <MessageSquare size={14} className="text-slate-400" /> {post.comments_count || 0} bình luận
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Logout Action */}
      <PremiumButton
        variant="danger"
        onClick={handleLogout}
        className="w-full rounded-[2rem] py-5 font-bold uppercase tracking-widest text-xs flex items-center gap-2.5 shadow-md hover:shadow-lg transition-transform h-14 cursor-pointer"
      >
        <LogOut size={16} className="stroke-[2.5]" /> Đăng xuất ứng dụng
      </PremiumButton>

      <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none pt-4">
        Health Guardian AI v4.2.0 • Build 2026
      </p>

      {/* MODAL MOUNT CONTROLS */}
      <AnimatePresence>
        {activeModal === "edit_profile" && (
          <EditProfileModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            userDoc={userDoc}
            userId={user.id}
            onShowToast={showToast}
          />
        )}

        {activeModal === "contacts" && (
          <ContactsModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            contacts={contacts}
            userId={user.id}
            onShowToast={showToast}
          />
        )}

        {activeModal === "subscription" && (
          <SubscriptionModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            subscription={userDoc.subscription}
            userId={user.id}
            onShowToast={showToast}
          />
        )}

        {activeModal === "medical" && (
          <MedicalHistoryModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            medicalHistory={medicalHistory}
            userId={user.id}
            onShowToast={showToast}
          />
        )}

        {activeModal === "notifications" && (
          <NotificationsModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            notifications={userDoc.notifications}
            userId={user.id}
            onShowToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuLink = ({ icon: Icon, label, sub, badgeCount, onClick }: any) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full glass p-4 px-5 rounded-[2.2rem] flex items-center justify-between premium-shadow border border-white/60 group cursor-pointer"
  >
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
        <Icon size={20} className="stroke-[1.8]" />
      </div>
      <div className="text-left min-w-0 pr-2">
        <p className="font-extrabold text-slate-800 tracking-tight leading-snug">{label}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
          {sub}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-1 text-slate-300 group-hover:text-primary transition-colors shrink-0 leading-none">
      {badgeCount && (
        <span className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold px-2.5 py-1 rounded-full select-none leading-none mr-1 h-[18px] flex items-center justify-center">
          {badgeCount}
        </span>
      )}
      <ChevronRight size={18} />
    </div>
  </motion.button>
);

export default Profile;
