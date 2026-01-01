import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[#1E1E1E] border border-[#333] rounded-2xl shadow-2xl p-6 md:p-8 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-[#D4AF37] hover:text-[#F7D560] transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h3 className="text-xl font-bold text-[#D4AF37] mb-4">عن مشروع Salaf AI</h3>
        <p className="text-[#E0E0E0] leading-relaxed mb-6 text-sm md:text-base">
          مهمتنا في Salaf AI هي توفير أداة بحثية متقدمة تساعد المسلم في الوصول إلى إجابات دقيقة وموثوقة في المسائل الشرعية، معتمدة بشكل أساسي على منهج السلف الصالح.
        </p>
        
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">منهجيتنا</h3>
        <p className="text-[#E0E0E0] leading-relaxed mb-6 text-sm md:text-base">
          تستند جميع إجاباتنا إلى مصدرين أساسيين: القرآن الكريم والسنة النبوية الصحيحة، وذلك بفهم الصحابة والتابعين ومن تبعهم بإحسان من أئمة الدين المعتبرين. نحن نسعى لتقديم المعلومة بدقة علمية بعيدًا عن الآراء المحدثة أو التأويلات التي تخالف فهم القرون الثلاثة المفضلة.
        </p>
        
        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">ملاحظة هامة</h3>
        <p className="text-[#E0E0E0] leading-relaxed text-sm md:text-base">
          هذه الأداة هي معين ومساعد للباحث وطالب العلم، وليست بديلاً عن العلماء الراسخين. في النوازل والمسائل المعقدة، يجب دائمًا الرجوع إلى أهل العلم المختصين.
        </p>
      </div>
    </div>
  );
};