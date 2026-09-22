import React from 'react';
import { EditorialCard } from '../components/UI';
import { Trophy, Medal } from 'lucide-react';

const Rank = () => {
  const ranks = [
    { id: 1, name: '省钱仙人', amount: '3,200', avatar: '🧙‍♂️', me: false },
    { id: 2, name: '铁公鸡本鸡', amount: '2,850', avatar: '🐓', me: false },
    { id: 3, name: '抠门小天才', amount: '1,920', avatar: '💡', me: false },
    { id: 4, name: '我 (青铜抠门奴)', amount: '1,280', avatar: '🙋‍♂️', me: true },
    { id: 5, name: '月光族叛徒', amount: '800', avatar: '🏃', me: false },
  ];

  return (
    <div className="p-8 pb-40 pt-10">
      <header className="mb-12 text-center relative mt-4">
        <Trophy size={48} strokeWidth={1} className="mx-auto text-[#1A1A1A] mb-6" />
        <h1 className="text-sm font-bold tracking-[4px] uppercase text-[#1A1A1A]">Leaderboard</h1>
      </header>

      <div className="space-y-4">
        {ranks.map((r, i) => (
          <EditorialCard 
            key={r.id} 
            className={`p-6 flex items-center gap-5 transition-transform ${i > 2 ? 'scale-[0.98]' : ''} ${r.me ? 'ring-2 ring-[#1A1A1A] bg-[#FFFFFF]' : 'shadow-[0_12px_24px_rgba(0,0,0,0.02)]'}`}
          >
            <div className="w-8 text-center">
              {i === 0 ? <Medal className="mx-auto text-[#1A1A1A]" size={24} /> : 
               i === 1 ? <Medal className="mx-auto text-[#707070]" size={24} /> : 
               i === 2 ? <Medal className="mx-auto text-[#D95338]" size={24} /> : 
               <span className="text-lg font-din font-bold text-[#A0A0A0]">{r.id}</span>}
            </div>
            
            <div className="w-12 h-12 bg-[#FAF9F6] rounded-full border border-[#E5E5E5] flex items-center justify-center text-xl shadow-inner">
              {r.avatar}
            </div>
            
            <div className="flex-1">
              <p className={`text-[13px] font-bold tracking-wide ${r.me ? 'text-[#D95338]' : 'text-[#1A1A1A]'}`}>{r.name}</p>
            </div>
            
            <div className="text-right">
              <p className="font-din text-2xl font-bold tracking-tight text-[#1A1A1A]">¥{r.amount}</p>
            </div>
          </EditorialCard>
        ))}
      </div>

      <div className="fixed bottom-[100px] left-0 w-full px-6 pb-4 max-w-md mx-auto z-30 pointer-events-none">
        <div className="bg-[#1A1A1A] text-[#FFFFFF] p-6 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.2)] flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-4">
            <span className="w-6 text-center text-2xl font-din text-[#FFFFFF]">4</span>
            <div className="w-10 h-10 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center text-xl">
              🙋‍♂️
            </div>
            <div>
              <p className="font-bold text-[11px] tracking-[2px] uppercase">My Rank</p>
              <p className="text-[10px] text-[#A0A0A0] tracking-wide mt-1">¥640 to next rank</p>
            </div>
          </div>
          <div className="font-din text-3xl font-[800] tracking-tight text-[#FFFFFF]">¥1,280</div>
        </div>
      </div>
    </div>
  );
};

export default Rank;
