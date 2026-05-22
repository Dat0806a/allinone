import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUserStore, useAppStore } from "../store/useStore";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Image as ImageIcon,
  Send,
  X,
  Trash2,
} from "lucide-react";
import { cn } from "../components/premium/UI";

interface Post {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: any;
}

export default function Community() {
  const { user } = useUserStore();
  const { shouldOpenPostModal, setShouldOpenPostModal } = useAppStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Post Creation
  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shouldOpenPostModal) {
      setIsCreating(true);
      setShouldOpenPostModal(false);
    }
  }, [shouldOpenPostModal, setShouldOpenPostModal]);

  console.log("Community component rendering, loading:", loading);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error("Error fetching posts:", error);
      }
      if (data) {
        const formattedPosts = data.map((p: any) => ({
          ...p,
          author_name: p.author_name || 'Người dùng',
          author_avatar: p.author_avatar || ''
        }));
        setPosts(formattedPosts);
      }
    } catch (e) {
      console.error("Fetch posts exception:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 10000)
      );

      try {
        const fetchPromise = supabase.from('community_posts').select('*').order('created_at', { ascending: false });
        const response: any = await Promise.race([fetchPromise, timeoutPromise]);
        const { data, error } = response;

        if (error) throw error;

        if (mounted && data) {
          const formattedPosts = data.map((p: any) => ({
            ...p,
            author_name: p.author_name || 'Người dùng',
            author_avatar: p.author_avatar || ''
          }));
          setPosts(formattedPosts);
        }
      } catch (e: any) {
        console.error("Load exception:", e);
        // Show error message on UI would be better, for now just logging
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    const subscription = supabase
      .channel('public_posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => {
        if (mounted) {
          loadData();
        }
      })
      .subscribe();

    return () => { 
      mounted = false;
      supabase.removeChannel(subscription); 
    };
  }, []);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      console.warn("Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!newContent.trim() && !imageFile) return;
    if (!user) {
      console.warn("Vui lòng đăng nhập để đăng bài");
      return;
    }

    try {
      // In a real app we'd upload the image first if it's large.
      // Here we assume imageFile is a base64 string or null.
      await supabase.from('community_posts').insert({
        user_id: user.id,
        content: newContent,
        author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Người dùng",
        author_avatar: user.user_metadata?.avatar_url || "",
      });

      setNewContent("");
      setImageFile(null);
      setIsCreating(false);
      await fetchPosts();
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
    }
  };

  const handleDeletePost = async (postId: string, postUserId: string) => {
    if (!user || user.id !== postUserId) return;

    try {
      await supabase.from('community_posts').delete().eq('id', postId);
    } catch (error) {
      console.error("Lỗi khi xóa bài:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Vừa xong";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60)
      return `${diffMins === 0 ? "Vừa xong" : diffMins + " phút trước"}`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col pt-12">
      <div className="px-6 pr-16 py-4 bg-white sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Cộng đồng
          </h1>
          <div className="h-6 w-px bg-slate-200"></div>
          <button
            onClick={() => setIsCreating(true)}
            className="text-primary flex items-center gap-1.5 font-bold text-sm hover:text-primary/80 transition-colors"
          >
            <Send size={16} />
            Đăng bài
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {loading ? (
          <div className="p-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-3xl animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="w-32 h-3 bg-slate-200 rounded-full" />
                    <div className="w-20 h-2 bg-slate-200 rounded-full" />
                  </div>
                </div>
                <div className="w-full h-4 bg-slate-200 rounded-full mb-2" />
                <div className="w-2/3 h-4 bg-slate-200 rounded-full mb-4" />
                <div className="w-full h-40 bg-slate-200 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {post.author_avatar ? (
                        <img
                          src={post.author_avatar}
                          alt={post.author_name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {post.author_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">
                          {post.author_name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {formatTime(post.created_at)}
                        </p>
                      </div>
                    </div>

                    {user?.id === post.user_id && (
                      <button
                        onClick={() => handleDeletePost(post.id, post.user_id)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {post.content && (
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}

                  {post.image_url && (
                    <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                      <img
                        src={post.image_url}
                        alt="Post attachment"
                        className="w-full h-auto object-cover max-h-[300px]"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold">
                      <Heart size={18} />
                      <span>{post.likes_count}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold">
                      <MessageCircle size={18} />
                      <span>{post.comments_count}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {posts.length === 0 && (
              <div className="text-center py-20 text-slate-400 font-medium">
                Chưa có bài viết nào.
                <br />
                Hãy là người đầu tiên đăng bài!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {isCreating && (
            <div className="fixed inset-0 z-[2000] flex justify-center pt-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCreating(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-[90%] max-w-md max-h-[80vh] bg-white rounded-[2rem] p-6 shadow-2xl relative flex flex-col"
              >
              <div className="flex flex-col mb-4">
                <button
                  onClick={() => setIsCreating(false)}
                  className="w-8 h-8 bg-slate-100 text-slate-500 flex items-center justify-center rounded-full self-start mb-1 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
                <h2 className="text-xl font-black">Tạo bài viết</h2>
              </div>

              <div className="flex items-start gap-3 mb-4">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <textarea
                  autoFocus
                  placeholder="Bạn đang nghĩ gì về sức khỏe hôm nay?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-transparent resize-none outline-none text-slate-700 min-h-[100px] placeholder:text-slate-400 mt-2"
                />
              </div>

              {imageFile && (
                <div className="relative mb-4">
                  <img
                    src={imageFile}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-2xl"
                  />
                  <button
                    onClick={() => setImageFile(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md text-white flex items-center justify-center rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  ref={fileInputRef}
                  onChange={handleImagePick}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-xl"
                >
                  <ImageIcon size={18} />
                  Thêm ảnh
                </button>

                <button
                  onClick={handleCreatePost}
                  disabled={!newContent.trim() && !imageFile}
                  className="bg-primary text-white font-black px-6 py-2 rounded-xl shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
                >
                  Đăng bài
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
