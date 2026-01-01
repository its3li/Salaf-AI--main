
import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (e: React.MouseEvent, id: string) => void;
  messageCount: number;
  maxMessages: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onNewChat, 
  chats, 
  activeChatId, 
  onSelectChat,
  onDeleteChat,
  messageCount,
  maxMessages
}) => {
  
  const toArabicNumerals = (n: number) => {
    return n.toString().replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:static top-0 right-0 h-full z-50
          w-[280px] md:w-1/4 min-w-[250px] md:max-w-[320px]
          /* Glassmorphism Background */
          bg-[#121212]/85 backdrop-blur-md
          /* Faint golden separator on the left (facing content) */
          border-l border-[#D4AF37]/20
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          flex flex-col shadow-2xl md:shadow-none
        `}
      >
        <div className="flex flex-col h-full p-4">
            {/* Mobile Header inside Sidebar */}
             <div className="flex justify-between items-center md:hidden mb-6 pb-4 border-b border-[#333]">
                <div className="flex items-center gap-2">
                    <span className="text-[#D4AF37] font-bold text-lg">القائمة</span>
                </div>
                <button onClick={onClose} className="text-[#E0E0E0] hover:text-[#D4AF37] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
             </div>

            {/* New Chat Button */}
            <button 
              onClick={() => {
                  onNewChat();
              }}
              className="w-full py-3 px-4 mb-8 rounded-xl border border-[#D4AF37]/50 text-[#E0E0E0] hover:bg-[#D4AF37] hover:text-[#121212] transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_10px_rgba(212,175,55,0.1)] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] bg-[#1E1E1E]/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span className="font-semibold">محادثة جديدة</span>
            </button>

            <h3 className="text-[#777] text-xs font-bold uppercase tracking-wider mb-4 px-2">المحادثات السابقة</h3>
            
            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-2 -mx-2 px-2 custom-scrollbar">
              {chats.length === 0 ? (
                <div className="text-center text-[#555] text-sm py-4">لا توجد محادثات سابقة</div>
              ) : (
                chats.map((chat) => (
                  <div 
                    key={chat.id}
                    data-chat-id={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectChat(chat.id);
                      }
                    }}
                    className={`relative w-full text-right px-4 py-3 rounded-xl transition-all duration-200 text-sm truncate group flex items-center justify-between cursor-pointer select-none border border-transparent
                      ${activeChatId === chat.id 
                        ? 'bg-[#D4AF37] text-[#121212] font-bold shadow-lg shadow-[#D4AF37]/20 transform scale-[1.02]' 
                        : 'text-[#E0E0E0] hover:text-[#D4AF37] hover:bg-[#ffffff]/5 hover:border-[#ffffff]/5'
                      }
                    `}
                  >
                    <span className="truncate flex-1 ml-2">{chat.title}</span>
                    
                    {/* Delete Icon */}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteChat(e, chat.id);
                      }}
                      className={`relative z-20 p-2 rounded-full transition-all duration-200 flex items-center justify-center shrink-0
                        ${activeChatId === chat.id 
                          ? 'hover:bg-black/20 text-[#121212] opacity-100' 
                          : 'hover:bg-[#ffffff]/10 text-red-400 opacity-0 group-hover:opacity-100'
                        }
                      `}
                      title="حذف المحادثة"
                      aria-label="Delete chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {/* Footer Area */}
            <div className="mt-4 pt-4 border-t border-[#D4AF37]/10 text-center">
               <div className="mb-3 px-4">
                  <div className="flex justify-between text-xs text-[#777] mb-1 font-mono">
                    <span className="font-sans">الحد اليومي</span>
                    <span className={messageCount >= maxMessages ? "text-red-400" : "text-[#D4AF37]"}>{messageCount}/{maxMessages}</span>
                  </div>
                  <div className="w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${messageCount >= maxMessages ? 'bg-red-500' : 'bg-[#D4AF37]'}`} 
                      style={{ width: `${Math.min((messageCount / maxMessages) * 100, 100)}%` }}
                    ></div>
                  </div>
               </div>
               <p className="text-[#555] text-xs">© 2025 Salaf AI</p>
            </div>
        </div>
      </aside>
    </>
  );
};
