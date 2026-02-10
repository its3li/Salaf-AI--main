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
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed md:static top-0 right-0 h-full z-50
          w-[300px] md:w-[30%] min-w-[260px] md:max-w-[340px]
          border-l border-white/10 bg-[#0B0D12]/85 backdrop-blur-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.45)]
        `}
      >
        <div className="flex flex-col h-full p-4 md:p-5">
          <div className="flex justify-between items-center md:hidden mb-5 pb-4 border-b border-white/10">
            <span className="text-[#F2D16B] font-bold text-lg">المحادثات</span>
            <button onClick={onClose} className="text-[#E0E0E0] hover:text-[#F2D16B] transition-colors p-1 rounded-lg hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <button
            onClick={onNewChat}
            className="w-full py-3 px-4 mb-5 rounded-2xl border border-[#D4AF37]/50 text-[#F5F5F5] bg-gradient-to-b from-[#D4AF37]/20 to-[#D4AF37]/5 hover:from-[#D4AF37] hover:to-[#C59A2D] hover:text-[#121212] transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-[0_8px_24px_rgba(212,175,55,0.25)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>محادثة جديدة</span>
          </button>

          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-xs text-white/50">السجل</p>
            <p className="text-xs text-white/40">{chats.length} محادثة</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {chats.length === 0 ? (
              <div className="text-center text-white/40 text-sm py-8 border border-dashed border-white/10 rounded-2xl">لا توجد محادثات بعد</div>
            ) : (
              chats.map(chat => {
                const isActive = activeChatId === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`group relative cursor-pointer rounded-xl px-3 py-3 border transition-all duration-300 flex items-center gap-2
                      ${
                        isActive
                          ? 'border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#F4E8BE] shadow-[0_6px_20px_rgba(212,175,55,0.18)]'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 text-[#D9DCE3]'
                      }
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span className="truncate flex-1 text-sm font-medium">{chat.title}</span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteChat(e, chat.id);
                      }}
                      className={`p-1.5 rounded-lg transition-all duration-200 shrink-0 ${
                        isActive
                          ? 'text-[#1F1A0D] bg-[#D4AF37]/80 hover:bg-[#D4AF37]'
                          : 'text-red-300 hover:text-red-200 hover:bg-red-500/20 opacity-0 group-hover:opacity-100'
                      }`}
                      title="حذف المحادثة"
                      aria-label="Delete chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 mb-3">
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>الاستخدام اليومي</span>
                <span className={messageCount >= maxMessages ? 'text-red-400' : 'text-[#F2D16B]'}>{messageCount}/{maxMessages}</span>
              </div>
              <div className="w-full bg-[#1B1F29] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${messageCount >= maxMessages ? 'bg-red-500' : 'bg-gradient-to-r from-[#D4AF37] to-[#F3D97C]'}`}
                  style={{ width: `${Math.min((messageCount / maxMessages) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-white/30 text-xs text-center">© 2025 Salaf AI</p>
          </div>
        </div>
      </aside>
    </>
  );
};
