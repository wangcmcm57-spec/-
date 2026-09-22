import React, { useState } from 'react';
import { EditorialCard } from '../components/UI';
import PurchaseModal from '../components/PurchaseModal';
import CourtModal from '../components/CourtModal';

const Home = () => {
  const [showPurchase, setShowPurchase] = useState(false);
  const [showCourt, setShowCourt] = useState(false);

  return (
    <div className="p-8 pt-10">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-xs font-bold tracking-[2px] text-[#1A1A1A] uppercase">抠门大赛 / 第03周</h1>
        <div className="px-4 py-1.5 rounded-full border border-[#E5E5E5] text-[10px] font-semibold text-[#1A1A1A] tracking-[2px] uppercase">
          Live
        </div>
      </header>

      <EditorialCard className="mb-12 flex flex-col items-center p-12">
        <p className="text-[#707070] text-[10px] font-bold uppercase tracking-[3px] mb-6">本周守住了</p>
        <p className="font-din text-[96rpx] leading-[0.8] font-[800] text-[#1A1A1A] tracking-[-3px] mb-8">¥128.00</p>
        <div className="bg-[#FAF9F6] px-5 py-2.5 rounded-full text-xs font-medium text-[#707070] tracking-wide">
          已成功阻击消费 6 笔
        </div>
      </EditorialCard>

      <div className="space-y-4 mb-16">
        <button 
          className="w-full bg-[#1A1A1A] text-[#FFFFFF] rounded-full py-5 px-8 shadow-[0_12px_32px_rgba(0,0,0,0.12)] flex items-center justify-center transform transition-all active:scale-95 hover:bg-[#2A2A2A]"
          onClick={() => alert('记账成功！')}
        >
          <span className="text-[14px] font-semibold tracking-[2px]">我忍住了，记一笔省钱</span>
        </button>

        <button 
          className="w-full bg-transparent border border-[#E5E5E5] text-[#1A1A1A] rounded-full py-5 px-8 flex items-center justify-center transform transition-all active:scale-95 hover:bg-[#F5F5F5]"
          onClick={() => setShowPurchase(true)}
        >
          <span className="text-[14px] font-semibold tracking-[2px]">我想买，发起审批</span>
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-end mb-6 px-2">
          <h2 className="text-[10px] font-bold tracking-[2px] uppercase text-[#707070]">最近守住的钱袋子</h2>
        </div>
        <div className="flex flex-col gap-4">
          {[
            { id: 1, title: '差点买下：一杯奶茶', amount: '28.00', tag: '理智消费' },
            { id: 2, title: '差点买下：盲盒手办', amount: '69.00', tag: '悬崖勒马' },
          ].map((item) => (
            <div key={item.id} className="relative cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setShowCourt(true)}>
              <EditorialCard className="p-6 flex justify-between items-center shadow-[0_12px_24px_rgba(0,0,0,0.02)]">
                <div>
                  <p className="font-din text-2xl font-bold text-[#1A1A1A] tracking-tight">¥{item.amount}</p>
                  <p className="text-[11px] text-[#707070] tracking-wide mt-1">{item.title}</p>
                </div>
                <span className="text-[9px] font-bold tracking-widest uppercase text-[#D95338] bg-[#D95338]/10 px-3 py-1.5 rounded-full">
                  {item.tag}
                </span>
              </EditorialCard>
            </div>
          ))}
        </div>
      </div>

      {showPurchase && <PurchaseModal onClose={() => setShowPurchase(false)} />}
      {showCourt && <CourtModal onClose={() => setShowCourt(false)} />}
    </div>
  );
};

export default Home;
