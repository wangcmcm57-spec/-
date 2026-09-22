import React from 'react';

export const EditorialCard = ({ children, className = '', ...props }: any) => (
  <div
    className={`bg-[#FFFFFF] rounded-[36px] shadow-[0_24px_50px_rgba(0,0,0,0.025)] transition-transform duration-300 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const Stamp = ({ type, text, amount }: { type: 'rejected' | 'approved', text: string, amount?: string }) => {
  const isRejected = type === 'rejected';
  const color = isRejected ? '#D95338' : '#1A1A1A';
  
  return (
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 border-[2px] flex flex-col items-center justify-center z-20 pointer-events-none bg-white/95 backdrop-blur-md"
      style={{
        borderColor: color,
        color: color,
        borderRadius: '100px',
        animation: 'stampFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <style>{`
        @keyframes stampFade {
          0% { transform: translate(-50%, -50%) scale(1.05); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
      <span className="font-bold text-xs tracking-[3px] uppercase leading-none mb-1">{text}</span>
      {amount && <span className="font-din text-2xl font-bold leading-none">{amount}</span>}
    </div>
  );
};
