import React, { useState } from 'react';
import { X } from 'lucide-react';
import { EditorialCard, Stamp } from './UI';

const CourtModal = ({ onClose }: { onClose: () => void }) => {
  const [verdict, setVerdict] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [reason, setReason] = useState('');
  
  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm relative zoom-in-95 duration-500">
        <button onClick={onClose} className="absolute -right-2 -top-14 text-[#1A1A1A] z-10 bg-white rounded-full p-3 shadow-[0_8px_16px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
          <X size={20} />
        </button>

        <EditorialCard className="min-h-[400px] flex flex-col p-10 relative overflow-hidden">
          <div className="text-center mb-10">
            <h2 className="text-[10px] font-bold text-[#1A1A1A] tracking-[4px] uppercase pb-4 inline-block">Verdict Draft</h2>
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <span className="text-[9px] text-[#707070] font-bold tracking-[2px] uppercase">Defendant</span>
              <p className="text-sm mt-2 font-medium text-[#1A1A1A]">张三 (Mechanical Keyboard)</p>
            </div>
            
            <div>
              <span className="text-[9px] text-[#707070] font-bold tracking-[2px] uppercase">Amount</span>
              <p className="font-din text-[40px] font-[800] text-[#D95338] mt-1 tracking-tight leading-none">¥299.00</p>
            </div>
            
            <div>
              <span className="text-[9px] text-[#707070] font-bold tracking-[2px] uppercase">Statement</span>
              <p className="text-[13px] mt-3 text-[#707070] leading-relaxed border-l-2 border-[#E5E5E5] pl-4 italic">
                “现在的薄膜键盘敲得我手疼，买个红轴提升生产力...”
              </p>
            </div>

            {verdict === 'pending' && (
              <div className="pt-8 mt-4 border-t border-[#E5E5E5]">
                <input 
                  type="text" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="审判意见 (驳回必填)"
                  className="w-full bg-[#FAF9F6] rounded-2xl p-5 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] text-sm mb-6 transition-all placeholder:text-[#A0A0A0]"
                />
                <div className="flex gap-4">
                  <button onClick={() => { if(!reason) return alert('驳回必须给出理由'); setVerdict('rejected') }} className="flex-1 bg-[#D95338] text-white rounded-full py-4 text-[10px] font-bold tracking-[2px] uppercase shadow-[0_8px_20px_rgba(217,83,56,0.2)] active:scale-95 transition-transform">
                    驳回申请
                  </button>
                  <button onClick={() => setVerdict('approved')} className="flex-1 bg-[#1A1A1A] text-white rounded-full py-4 text-[10px] font-bold tracking-[2px] uppercase shadow-[0_8px_20px_rgba(26,26,26,0.15)] active:scale-95 transition-transform">
                    准许购买
                  </button>
                </div>
              </div>
            )}

            {verdict === 'rejected' && (
              <div className="mt-8 text-center animate-in slide-in-from-bottom-4 fade-in">
                <Stamp type="rejected" text="Rejected" amount="¥299" />
                <p className="text-[11px] font-bold text-[#D95338] mt-20 tracking-[2px] uppercase">Saved: ¥299</p>
                <p className="text-[13px] text-[#707070] mt-3 italic">{reason}</p>
              </div>
            )}

            {verdict === 'approved' && (
              <div className="mt-8 text-center animate-in slide-in-from-bottom-4 fade-in">
                <Stamp type="approved" text="Approved" />
                <p className="text-[11px] font-bold text-[#1A1A1A] mt-20 tracking-[2px] uppercase">Exception Granted</p>
                <p className="text-[13px] text-[#707070] mt-3 italic">{reason || 'No reason provided'}</p>
              </div>
            )}
          </div>
        </EditorialCard>
      </div>
    </div>
  );
};

export default CourtModal;
