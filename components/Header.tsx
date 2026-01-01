import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onHomeClick }) => {
  return (
    <header className="w-full bg-[#1E1E1E]/80 backdrop-blur-md border-b border-[#333] sticky top-0 z-30 shadow-md shrink-0">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="md:hidden text-[#E0E0E0] hover:text-[#D4AF37] transition-colors p-1"
            aria-label="Toggle Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div 
            className="flex items-center gap-3 select-none cursor-pointer group"
            onClick={onHomeClick}
            title="العودة للرئيسية"
          >
            <img 
              src="https://i.postimg.cc/RhRmHpj2/1000000424.png" 
              alt="Salaf AI Logo" 
              width="40"
              height="40"
              className="h-10 w-auto object-contain drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)] transition-all"
            />
            <h1 className="text-xl font-bold text-[#D4AF37] tracking-wide flex items-center gap-2">
              Salaf AI 
              <span className="hidden sm:inline text-[#777] text-sm font-normal mx-1">|</span> 
              <span className="hidden sm:inline text-[#E0E0E0]">باحث السلف</span>
            </h1>
          </div>
        </div>

        {/* Donate Button (Visible on Left due to RTL) */}
        <a
          href="https://ko-fi.com/its3li"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#121212] transition-all duration-300 text-sm font-medium"
        >
           <span className="hidden sm:inline">تبرع</span>
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </a>
      </div>
    </header>
  );
};