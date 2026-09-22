import React, { useState } from 'react';
import { EditorialCard } from '../components/UI';

const Stats = () => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  return (
    <div className="p-8 pt-10">
      <header className="mb-12">
        <h1 className="text-sm font-bold tracking-[4px] uppercase text-[#1A1A1A] mb-8">Archive</h1>
        
        <div className="flex gap-6 relative">
          <button 
            className={`text-[11px] font-bold tracking-[2px] uppercase transition-colors ${period === 'week' ? 'text-[#1A1A1A]' : 'text-[#A0A0A0]'}`}
            onClick={() => setPeriod('week')}
          >
            This Week
            {period === 'week' && <div className="h-0.5 w-full bg-[#1A1A1A] mt-2 rounded-full"></div>}
          </button>
          <button 
            className={`text-[11px] font-bold tracking-[2px] uppercase transition-colors ${period === 'month' ? 'text-[#1A1A1A]' : 'text-[#A0A0A0]'}`}
            onClick={() => setPeriod('month')}
          >
            This Month
            {period === 'month' && <div className="h-0.5 w-full bg-[#1A1A1A] mt-2 rounded-full"></div>}
          </button>
        </div>
      </header>

      <EditorialCard className="mb-12 p-10">
        <p className="text-[#707070] text-[10px] font-bold uppercase tracking-[3px] mb-4">Total Saved</p>
        <p className="font-din text-[56rpx] leading-none font-[800] text-[#1A1A1A] tracking-tight mb-8">¥ 1,280.50</p>
        
        <div className="flex justify-between border-t border-[#E5E5E5] pt-6">
          <div>
            <p className="text-[10px] text-[#707070] tracking-[2px] uppercase mb-2">Impulse Prevented</p>
            <p className="font-din text-2xl font-bold text-[#1A1A1A]">24</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#707070] tracking-[2px] uppercase mb-2">Longest Streak</p>
            <p className="font-din text-2xl font-bold text-[#D95338]">3 WEEKS</p>
          </div>
        </div>
      </EditorialCard>

      <div className="mb-10">
        <h2 className="text-[10px] font-bold tracking-[2px] uppercase text-[#707070] mb-6 px-2">Impulse Trend</h2>
        <EditorialCard className="h-56 flex items-end justify-between p-6 pt-10 gap-3">
          {[40, 70, 30, 90, 50, 20, 60].map((h, i) => (
            <div key={i} className="w-full flex flex-col items-center gap-3 group">
              <div 
                className={`w-full rounded-t-sm transition-all relative ${h === 90 ? 'bg-[#1A1A1A]' : 'bg-[#E5E5E5]'}`}
                style={{ height: `${h}%` }}
              >
                {h === 90 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] text-[#FFFFFF] font-bold tracking-widest uppercase bg-[#1A1A1A] px-2 py-1 rounded whitespace-nowrap">
                    Peak
                  </div>
                )}
              </div>
              <span className="text-[9px] font-bold tracking-widest text-[#A0A0A0] uppercase">{['M','T','W','T','F','S','S'][i]}</span>
            </div>
          ))}
        </EditorialCard>
      </div>
    </div>
  );
};

export default Stats;
