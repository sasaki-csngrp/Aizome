'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface QuestClearPopupProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
}

export default function QuestClearPopup({ isOpen, onClose, points }: QuestClearPopupProps) {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isOpen && points > 0) {
      setShowFireworks(true);
      const timer = setTimeout(() => {
        setShowFireworks(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, points]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* 花火アニメーション */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none">
          {/* 花火1 */}
          <div className="absolute top-1/4 left-1/4 animate-firework-1">
            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-ping absolute -top-2 -left-2"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping absolute -top-2 -right-2"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute -bottom-2 -left-2"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping absolute -bottom-2 -right-2"></div>
          </div>
          
          {/* 花火2 */}
          <div className="absolute top-1/3 right-1/4 animate-firework-2">
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
            <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping absolute -top-1 -left-1"></div>
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping absolute -top-1 -right-1"></div>
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping absolute -bottom-1 -left-1"></div>
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping absolute -bottom-1 -right-1"></div>
          </div>
          
          {/* 花火3 */}
          <div className="absolute bottom-1/3 left-1/3 animate-firework-3">
            <div className="w-5 h-5 bg-red-500 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping absolute -top-1 -left-1"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute -top-1 -right-1"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping absolute -bottom-1 -left-1"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping absolute -bottom-1 -right-1"></div>
          </div>
          
          {/* 花火4 */}
          <div className="absolute bottom-1/4 right-1/3 animate-firework-4">
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
            <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping absolute -top-1 -left-1"></div>
            <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping absolute -top-1 -right-1"></div>
            <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-ping absolute -bottom-1 -left-1"></div>
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping absolute -bottom-1 -right-1"></div>
          </div>
        </div>
      )}

      {/* ポップアップ本体 */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              クエストをクリアしました！
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              おめでとうございます！
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 mb-6">
            <p className="text-white text-lg font-medium mb-2">今回の獲得ポイント</p>
            <div className="text-4xl font-bold text-white animate-pulse">
              +{points}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes firework-1 {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(1.5) rotate(180deg); opacity: 0; }
        }
        
        @keyframes firework-2 {
          0% { transform: scale(0) rotate(45deg); opacity: 1; }
          100% { transform: scale(1.2) rotate(225deg); opacity: 0; }
        }
        
        @keyframes firework-3 {
          0% { transform: scale(0) rotate(90deg); opacity: 1; }
          100% { transform: scale(1.8) rotate(270deg); opacity: 0; }
        }
        
        @keyframes firework-4 {
          0% { transform: scale(0) rotate(135deg); opacity: 1; }
          100% { transform: scale(1.3) rotate(315deg); opacity: 0; }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-firework-1 {
          animation: firework-1 1s ease-out;
        }
        
        .animate-firework-2 {
          animation: firework-2 1.2s ease-out 0.3s;
        }
        
        .animate-firework-3 {
          animation: firework-3 1.1s ease-out 0.6s;
        }
        
        .animate-firework-4 {
          animation: firework-4 1.3s ease-out 0.9s;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
