import React from 'react';
import { X } from 'lucide-react';
import { EditorialCard } from './UI';

const PurchaseModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
      <div className="w-full sm:w-full max-w-sm relative slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500">
        <button onClick={onClose} className="absolute right-6 top-6 sm:-right-4 sm:-top-14 text-[#1A1A1A] z-20 bg-white rounded-full p-3 shadow-[0_8px_16px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
          <X size={20} />
        </button>

        <EditorialCard className="min-h-[70vh] sm:min-h-0 rounded-b-none sm:rounded-[36px] flex flex-col p-8 pt-12 sm:p-10 relative">
          <div className="text-center mb-10">
            <h2 className="text-[10px] font-bold text-[#1A1A1A] tracking-[4px] uppercase pb-4 inline-block">Draft Case</h2>
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <label className="block text-[9px] font-bold text-[#707070] tracking-[2px] uppercase mb-3">申请购买物品</label>
              <input type="text" placeholder="例如：一把新的机械键盘" className="w-full bg-transparent border-b border-[#E5E5E5] py-3 focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A] text-sm transition-colors placeholder:text-[#A0A0A0]" />
            </div>
            
            <div>
              <label className="block text-[9px] font-bold text-[#707070] tracking-[2px] uppercase mb-3">预计花费 (¥)</label>
              <input type="number" placeholder="0.00" className="w-full bg-transparent border-b border-[#E5E5E5] py-3 focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A] font-din text-3xl placeholder:text-[#A0A0A0] transition-colors" />
            </div>
            
            <div>
              <label className="block text-[9px] font-bold text-[#707070] tracking-[2px] uppercase mb-3">想买理由 (陈述)</label>
              <textarea 
                rows={4} 
                placeholder="请详细说明你为什么非买不可..." 
                className="w-full bg-[#FAF9F6] rounded-2xl p-5 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] text-sm resize-none transition-all placeholder:text-[#A0A0A0]"
              />
            </div>
          </div>

          <button 
            className="w-full mt-10 bg-[#1A1A1A] text-[#FFFFFF] rounded-full py-5 px-8 shadow-[0_12px_32px_rgba(0,0,0,0.12)] flex items-center justify-center transform transition-all active:scale-95 hover:bg-[#2A2A2A]"
            onClick={() => {
              alert('案件已生成并送达！');
              onClose();
            }}
          >
            <span className="text-[12px] font-bold tracking-[2px]">立案！转发好友审判</span>
          </button>
        </EditorialCard>
      </div>
    </div>
  );
};

export default PurchaseModal;
