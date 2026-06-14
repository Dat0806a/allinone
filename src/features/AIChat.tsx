import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles, Mic, Paperclip, ChevronLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import { PremiumInput, cn } from '../components/premium/UI';
import { useAppStore, useUserStore } from '../store/useStore';

const AIChat: React.FC = () => {
  const { pendingSearchQuery, setPendingSearchQuery } = useAppStore();
  const { user } = useUserStore();
  const userName = user?.user_metadata?.full_name?.split(' ').pop() || 'bạn';

  const INITIAL_MESSAGES = [
    { id: 1, role: 'assistant', content: `Chào bạn ${userName}, tôi là trợ lý AI sức khỏe của bạn. Hôm nay bạn thấy trong người thế nào ạ?` },
  ];

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = useAppStore.getState().pendingSearchQuery;
    if (query) {
      useAppStore.getState().setPendingSearchQuery(null);
      sendMessage(query);
    }
  }, [pendingSearchQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Prepare history for Gemini
      const history = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });

      if (!res.ok) throw new Error('API request failed');
      
      const data = await res.json();
      
      setIsTyping(false);
      const aiMsg = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: data.text || "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn."
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      setIsTyping(false);
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Xin lỗi bạn ${userName}, hệ thống đang gặp chút trục trặc. Bạn vui lòng thử lại sau nhé.`
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col pt-6 px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-xl text-white relative">
          <Bot size={32} />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full"
          />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
            AI Assistant <Sparkles size={18} className="text-primary" />
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sẵn sàng hỗ trợ 24/7</p>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar space-y-6 px-1 pb-10"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex group",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] p-5 rounded-[2rem] shadow-sm",
              msg.role === 'user' 
                ? "bg-primary text-white rounded-br-none premium-shadow" 
                : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
            )}>
              <div className="text-lg leading-relaxed font-medium">
                <Markdown
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0 break-words whitespace-pre-wrap">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 last:mb-0 space-y-1.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 last:mb-0 space-y-1.5">{children}</ol>,
                    li: ({ children }) => <li className="break-words">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mt-3 mb-2 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mt-2 mb-1 first:mt-0">{children}</h3>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-slate-300 pl-4 italic my-2">{children}</blockquote>,
                  }}
                >
                  {msg.content}
                </Markdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  className="w-2 h-2 bg-primary/40 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="pt-2 pb-28 relative">
        <div className="bg-white rounded-[2.5rem] p-1.5 flex items-center gap-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary transition-colors ml-2">
            <Paperclip size={22} className="rotate-45" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi trợ lý bất cứ điều gì..."
            className="flex-1 bg-transparent py-4 text-base placeholder:text-slate-400 font-medium outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-12 h-12 bg-slate-300 text-white rounded-[1.5rem] flex items-center justify-center disabled:opacity-50 transition-all shrink-0 mr-1"
          >
            <Send size={20} className="fill-white" />
          </motion.button>
        </div>
        

      </div>
    </div>
  );
};

export default AIChat;
