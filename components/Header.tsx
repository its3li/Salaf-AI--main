import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onHomeClick }) => {
  return (
    <header className="w-full sticky top-0 z-30 shrink-0 border-b border-white/10 bg-[#0A0B0F]/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
      <div className="w-full px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-[#E6E7EB] hover:text-[#F2D16B] transition-colors p-2 rounded-xl hover:bg-white/5"
            aria-label="Toggle Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <button
            className="flex items-center gap-3 select-none group rounded-2xl px-1.5 py-1 hover:bg-white/5 transition-all"
            onClick={onHomeClick}
            title="العودة للرئيسية"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-md bg-[#D4AF37]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="https://i.postimg.cc/RhRmHpj2/1000000424.png"
                alt="Salaf AI Logo"
                width="40"
                height="40"
                className="relative h-10 w-10 object-contain"
              />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-[#F2D16B] tracking-wide flex items-center gap-2">
              <span>Salaf AI</span>
              <span className="hidden sm:inline text-white/30 text-sm font-normal">|</span>
              <span className="hidden sm:inline text-[#E6E7EB] text-base">باحث السلف</span>
            </h1>
          </button>
        </div>

        <a
          href="https://ko-fi.com/its3li"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#D4AF37]/40 text-[#F2D16B] bg-gradient-to-b from-[#D4AF37]/20 to-[#D4AF37]/5 hover:from-[#D4AF37] hover:to-[#C59A2D] hover:text-[#121212] transition-all duration-300 text-sm font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
        >
          <span className="hidden sm:inline">ادعم المشروع</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </a>
      </div>
    </header>
  );
};
