
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Analytics } from "@vercel/analytics/react"
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { AboutModal } from './components/AboutModal';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { InstallPrompt } from './components/InstallPrompt';
import { Message, ChatSession, Attachment } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { saveChatsToLocalStorage, loadChatsFromLocalStorage } from './services/chatStorage';

type ViewState = 'landing' | 'chat';

const DHIKR_PHRASES = [
  "سبحان الله",
  "الحمدلله",
  "لا إله إلا الله",
  "الله أكبر",
  "لا حول ولا قوة إلا بالله",
  "اللهم صلِّ على محمد ﷺ"
];

const MAX_MESSAGES_24H = 20;
const MS_IN_24H = 24 * 60 * 60 * 1000;

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const pendingRequestRef = useRef<{ chatId: string; controller: AbortController } | null>(null);

  // Helper to get current message usage count
  const getMessageUsageCount = () => {
    const now = Date.now();
    const stored = localStorage.getItem('salaf_ai_msg_timestamps');
    const timestamps: number[] = stored ? JSON.parse(stored) : [];
    return timestamps.filter(t => now - t < MS_IN_24H).length;
  };

  // Initialize from Local Storage on Mount & Set up Usage Timer
  useEffect(() => {
    const loadedChats = loadChatsFromLocalStorage();
    if (loadedChats.length > 0) {
      setChats(loadedChats);
      setActiveChatId(loadedChats[0].id);
    }

    // Initial usage count
    setDailyMessageCount(getMessageUsageCount());

    // Update usage count periodically (e.g. to reflect expired timestamps)
    const interval = setInterval(() => {
      setDailyMessageCount(getMessageUsageCount());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Handle PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Fallback for iOS or unsupported browsers
      alert("لتثبيت التطبيق:\n\n1. اضغط على زر المشاركة (Share) في المتصفح.\n2. اختر 'إضافة إلى الشاشة الرئيسية' (Add to Home Screen).");
    }
  };

  // Cycle Dhikr phrases when loading
  useEffect(() => {
    let interval: number;
    if (loadingChatId) {
      interval = window.setInterval(() => {
        setDhikrIndex((prev) => (prev + 1) % DHIKR_PHRASES.length);
      }, 2500);
    } else {
      setDhikrIndex(0);
    }
    return () => clearInterval(interval);
  }, [loadingChatId]);

  // Compute current messages based on activeChatId
  const currentMessages = useMemo(() => {
    const activeChat = chats.find(c => c.id === activeChatId);
    return activeChat ? activeChat.messages : [];
  }, [chats, activeChatId]);

  // --- SCROLL LOGIC FIXED ---

  // 1. Only scroll smoothly when the USER sends a message.
  // We do NOT scroll when the AI replies, keeping the user's position fixed.
  useEffect(() => {
    if (view === 'chat' && currentMessages.length > 0) {
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (lastMessage.role === 'user') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [currentMessages, view]);

  // 2. Instant scroll to bottom ONLY when switching chats or entering the view
  useEffect(() => {
    if (view === 'chat') {
      // Small timeout to ensure layout is ready
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
    }
  }, [activeChatId, view]);

  // --------------------------

  // Rate Limiting Logic
  const checkRateLimit = (): { allowed: boolean; timeRemaining?: number } => {
    const now = Date.now();
    const stored = localStorage.getItem('salaf_ai_msg_timestamps');
    const timestamps: number[] = stored ? JSON.parse(stored) : [];

    // Filter timestamps older than 24h
    const recent = timestamps.filter(t => now - t < MS_IN_24H);

    // Update storage if needed
    if (recent.length !== timestamps.length) {
      localStorage.setItem('salaf_ai_msg_timestamps', JSON.stringify(recent));
    }

    if (recent.length >= MAX_MESSAGES_24H) {
      const oldest = Math.min(...recent);
      const resetTime = oldest + MS_IN_24H;
      return { allowed: false, timeRemaining: resetTime - now };
    }

    return { allowed: true };
  };

  const recordMessageUsage = () => {
    const now = Date.now();
    const stored = localStorage.getItem('salaf_ai_msg_timestamps');
    let timestamps: number[] = stored ? JSON.parse(stored) : [];

    // Filter first to ensure clean state
    timestamps = timestamps.filter(t => now - t < MS_IN_24H);

    timestamps.push(now);
    localStorage.setItem('salaf_ai_msg_timestamps', JSON.stringify(timestamps));
  };



  const cancelPendingRequest = (chatId?: string) => {
    const pending = pendingRequestRef.current;
    if (!pending) return;

    if (!chatId || pending.chatId === chatId) {
      pending.controller.abort();
      pendingRequestRef.current = null;
      setLoadingChatId((prev) => (!chatId || prev === chatId ? null : prev));
    }
  };

  useEffect(() => {
    return () => cancelPendingRequest();
  }, []);

  const enterApp = () => {
    setView('chat');
    if (chats.length === 0) {
      createNewChat(true);
    } else if (!activeChatId) {
      setActiveChatId(chats[0].id);
    }
  };

  const createNewChat = (force: boolean = false) => {
    if (!force) {
      const currentChat = chats.find(c => c.id === activeChatId);
      if (currentChat && currentChat.messages.length === 0) {
        setIsSidebarOpen(false);
        return;
      }
    }

    if (activeChatId) {
      cancelPendingRequest(activeChatId);
    }

    const newChatId = Date.now().toString();
    const newChat: ChatSession = {
      id: newChatId,
      title: 'محادثة جديدة',
      messages: [],
      createdAt: Date.now(),
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setActiveChatId(newChatId);
    saveChatsToLocalStorage(updatedChats);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    if (!activeChatId || loadingChatId) return;

    // Check Rate Limit
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      // Update display count to ensure it reflects max
      setDailyMessageCount(getMessageUsageCount());

      const remainingMs = rateLimit.timeRemaining || 0;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

      const limitMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: `عذراً، لقد استهلكت الحد اليومي من الرسائل (20 رسالة / 24 ساعة).\n\nيرجى الانتظار ${hours > 0 ? hours + ' ساعة و ' : ''}${minutes} دقيقة قبل إرسال رسالة جديدة.`,
        timestamp: new Date(),
        isError: true
      };

      setChats(prevChats => prevChats.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, limitMessage] }
          : chat
      ));
      return;
    }

    // Prepare User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      attachment: attachment,
      timestamp: new Date(),
    };

    const updatedChatsAfterUser = chats.map(chat => {
      if (chat.id === activeChatId) {
        const isFirstMessage = chat.messages.length === 0;
        let newTitle = chat.title;

        if (isFirstMessage) {
          if (text.trim().length > 0) {
            newTitle = text.length > 30 ? text.substring(0, 30) + '...' : text;
          } else if (attachment) {
            newTitle = `ملف: ${attachment.name}`;
          }
        }

        return {
          ...chat,
          title: newTitle,
          messages: [...chat.messages, userMessage]
        };
      }
      return chat;
    });

    setChats(updatedChatsAfterUser);
    saveChatsToLocalStorage(updatedChatsAfterUser);

    // Record usage immediately
    recordMessageUsage();
    setDailyMessageCount(getMessageUsageCount());

    const targetChatId = activeChatId;
    const controller = new AbortController();
    pendingRequestRef.current = { chatId: targetChatId, controller };
    setLoadingChatId(targetChatId);

    const currentChatHistory = updatedChatsAfterUser.find(c => c.id === targetChatId)?.messages || [];

    try {
      const minDelayPromise = new Promise<void>((resolve) => setTimeout(resolve, 1500));
      const apiPromise = sendMessageToGemini(currentChatHistory, text, attachment, controller.signal);
      const [responseText] = await Promise.all([apiPromise, minDelayPromise]);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };

      setChats(prevChats => {
        const finalChats = prevChats.map(chat => {
          if (chat.id === targetChatId) {
            return {
              ...chat,
              messages: [...chat.messages, botMessage]
            };
          }
          return chat;
        });
        saveChatsToLocalStorage(finalChats);
        return finalChats;
      });

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.error("Error in chat flow:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'عذراً، حدث خطأ أثناء الاتصال بالخدمة. يرجى المحاولة مرة أخرى.',
        timestamp: new Date(),
        isError: true,
      };

      setChats(prevChats => {
        const errorChats = prevChats.map(chat => {
          if (chat.id === targetChatId) {
            return {
              ...chat,
              messages: [...chat.messages, errorMessage]
            };
          }
          return chat;
        });
        saveChatsToLocalStorage(errorChats);
        return errorChats;
      });

    } finally {
      if (pendingRequestRef.current?.controller === controller) {
        pendingRequestRef.current = null;
        setLoadingChatId(null);
      }
    }
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setIsSidebarOpen(false);
    setView('chat');
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    if (e) e.stopPropagation();

    const confirmDelete = window.confirm('هل أنت متأكد من حذف هذه المحادثة؟');
    if (!confirmDelete) return;

    cancelPendingRequest(chatId);

    const remainingChats = chats.filter(c => c.id !== chatId);

    if (remainingChats.length === 0) {
      const newChatId = Date.now().toString();
      const newChat: ChatSession = {
        id: newChatId,
        title: 'محادثة جديدة',
        messages: [],
        createdAt: Date.now(),
      };
      setChats([newChat]);
      setActiveChatId(newChatId);
      saveChatsToLocalStorage([newChat]);
      return;
    }

    setChats(remainingChats);
    saveChatsToLocalStorage(remainingChats);

    if (activeChatId === chatId) {
      setActiveChatId(remainingChats[0].id);
    }
  };

  return (
    <>
      <Analytics />
      <InstallPrompt onInstall={handleInstallClick} />
      {view === 'landing' ? (
        <LandingPage onStartChat={enterApp} onInstallClick={handleInstallClick} />
      ) : (
        <div className="flex h-screen bg-transparent overflow-hidden">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNewChat={() => createNewChat(false)}
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            messageCount={dailyMessageCount}
            maxMessages={MAX_MESSAGES_24H}
          />

          <div className="flex-1 flex flex-col h-full relative w-full transition-all duration-300">
            <Header
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onHomeClick={() => setView('landing')}
            />

            <main className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
              <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                {currentMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-end select-none px-4 animate-in fade-in duration-500 pb-2">
                    <img
                      src="https://i.postimg.cc/RhRmHpj2/1000000424.png"
                      alt="Salaf AI"
                      width="240"
                      height="240"
                      className="w-48 md:w-60 h-auto mb-6 drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-auto"
                    />
                    <h1 className="text-3xl md:text-4xl text-[#D4AF37] font-bold mb-3 text-center">Salaf AI - باحث السلف</h1>
                    <h2 className="text-lg md:text-xl text-[#E0E0E0] font-medium mb-4 text-center">دليلك الموثوق للمعرفة الإسلامية الأصيلة</h2>
                    <p className="text-gray-300 text-center max-w-2xl leading-relaxed font-light mb-8 text-sm md:text-base">
                      Salaf AI هو ذكاء اصطناعي مصمم للإجابة على أسئلتك في الفقه والعقيدة والسيرة وفق منهج السلف الصالح، مستمداً من القرآن والسنة الصحيحة.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                      {["ما هو منهج السلف؟", "شرح معنى التوحيد", "حكم تارك الصلاة"].map((q) => (
                        <button
                          key={q}
                          onClick={() => setInputText(q)}
                          className="px-4 py-3 bg-[#1E1E1E]/60 border border-[#333] hover:border-[#D4AF37]/50 rounded-xl text-[#E0E0E0] text-sm transition-all duration-300 hover:bg-[#D4AF37]/10 hover:shadow-lg hover:shadow-[#D4AF37]/5 active:scale-95"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pb-8">
                    {currentMessages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} />
                    ))}
                  </div>
                )}

                {loadingChatId === activeChatId && (
                  <div className="flex w-full mb-6 justify-end">
                    <div className="bg-[#1E1E1E]/80 backdrop-blur border border-[#D4AF37]/30 rounded-2xl rounded-bl-none px-8 py-3 shadow-[0_0_20px_rgba(212,175,55,0.1)] animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 h-6">
                        <span className="text-[#D4AF37] font-bold text-sm tracking-wide transition-all duration-500 animate-pulse">
                          {DHIKR_PHRASES[dhikrIndex]}
                        </span>
                        <div className="flex space-x-1 space-x-reverse items-center">
                          <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </main>

            <ChatInput
              onSend={handleSendMessage}
              isLoading={loadingChatId !== null}
              input={inputText}
              setInput={setInputText}
            />
          </div>

          <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </div>
      )}
    </>
  );
};

export default App;
