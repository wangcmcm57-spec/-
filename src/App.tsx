import React, { useState } from 'react';
import { PiggyBank, BarChart2, Trophy, User } from 'lucide-react';
import Home from './pages/Home';
import Stats from './pages/Stats';
import Rank from './pages/Rank';
import Mine from './pages/Mine';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'stats': return <Stats />;
      case 'rank': return <Rank />;
      case 'mine': return <Mine />;
      default: return <Home />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FAF9F6] text-[#1A1A1A] relative shadow-2xl overflow-hidden flex flex-col font-sans">
      <div className="flex-1 overflow-y-auto pb-28 hide-scrollbar relative">
        {renderTab()}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-[#FFFFFF] shadow-[0_20px_40px_rgba(0,0,0,0.08)] px-6 py-4 flex justify-between items-center rounded-full z-40">
        <TabButton icon={<PiggyBank size={20} strokeWidth={2.5} />} label="省钱" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <TabButton icon={<BarChart2 size={20} strokeWidth={2.5} />} label="统计" isActive={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
        <TabButton icon={<Trophy size={20} strokeWidth={2.5} />} label="排行" isActive={activeTab === 'rank'} onClick={() => setActiveTab('rank')} />
        <TabButton icon={<User size={20} strokeWidth={2.5} />} label="我的" isActive={activeTab === 'mine'} onClick={() => setActiveTab('mine')} />
      </div>
    </div>
  );
}

const TabButton = ({ icon, label, isActive, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-[#1A1A1A]' : 'text-[#A0A0A0]'}`}>
    {icon}
    <span className="text-[9px] font-bold tracking-widest">{label}</span>
  </button>
);

export default App;
