import React, { useState } from 'react';
import { EditorialCard } from '../components/UI';
import { Settings, FileText, ShieldCheck } from 'lucide-react';
import CourtModal from '../components/CourtModal';

const Mine = () => {
  const [showCourt, setShowCourt] = useState(false);

  return (
    <div className="p-8 pt-10">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-sm font-bold tracking-[4px] uppercase text-[#1A1A1A]">Profile</h1>
        <button className="text-[#1A1A1A] hover:scale-110 transition-transform">
          <Settings size={20} strokeWidth={2} />
        </button>
      </header>

      <div className="flex flex-col items-center mb-16 relative">
        <div className="w-28 h-28 bg-[#FFFFFF] rounded-[36px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-2 mb-6">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=FAF9F6" alt="Avatar" className="w-full h-full object-cover rounded-[28px] bg-[#FAF9F6]" />
        </div>
        <h2 className="text-2xl font-bold tracking-wide mb-3 text-[#1A1A1A]">张三</h2>
        <span className="bg-[#1A1A1A] text-[#FFFFFF] text-[10px] tracking-[2px] uppercase px-4 py-2 rounded-full font-bold">青铜抠门达人</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <EditorialCard className="p-6 flex flex-col items-center text-center gap-4 active:scale-95 transition cursor-pointer" onClick={() => setShowCourt(true)}>
          <div className="relative">
            <ShieldCheck size={32} strokeWidth={1.5} className="text-[#1A1A1A]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#D95338] rounded-full border-2 border-white"></span>
          </div>
          <span className="font-bold text-[11px] tracking-[1px] uppercase">待我审批</span>
        </EditorialCard>
        
        <EditorialCard className="p-6 flex flex-col items-center text-center gap-4 active:scale-95 transition cursor-pointer">
          <FileText size={32} strokeWidth={1.5} className="text-[#A0A0A0]" />
          <span className="font-bold text-[11px] tracking-[1px] uppercase text-[#A0A0A0]">我发起的</span>
        </EditorialCard>
      </div>

      <div className="space-y-4 mb-10">
        <h3 className="font-bold text-[10px] tracking-[2px] uppercase text-[#707070] mb-6 px-2">Achievements</h3>
        
        <EditorialCard className="p-6 flex items-center gap-5">
          <div className="w-14 h-14 bg-[#FAF9F6] rounded-2xl flex items-center justify-center text-2xl">
            🏆
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[13px] tracking-wide text-[#1A1A1A]">悬崖勒马</h4>
            <p className="text-[11px] text-[#707070] mt-1.5">单次成功阻击超过 ¥500 消费</p>
          </div>
        </EditorialCard>

        <EditorialCard className="p-6 flex items-center gap-5 opacity-60">
          <div className="w-14 h-14 bg-[#FAF9F6] rounded-2xl flex items-center justify-center text-2xl grayscale border border-[#E5E5E5]">
            👑
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[13px] tracking-wide text-[#A0A0A0]">铁公鸡</h4>
            <p className="text-[11px] text-[#A0A0A0] mt-1.5">未解锁 (点击查看秘籍)</p>
          </div>
        </EditorialCard>
      </div>
      
      {showCourt && <CourtModal onClose={() => setShowCourt(false)} />}
    </div>
  );
};

export default Mine;
