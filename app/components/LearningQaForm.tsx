"use client";

import { useState } from "react";
import QuestClearPopup from "./QuestClearPopup";
import { Button } from "@/components/ui/button";

type Props = {
  question: string;
  answer: string;
  contentId?: string;
  onLearningComplete?: () => void;
};

export default function LearningQaForm({ question, answer, contentId, onLearningComplete }: Props) {
  const [showQuestion, setShowQuestion] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [showQuestPopup, setShowQuestPopup] = useState(false);
  const [questPoints, setQuestPoints] = useState(0);

  const handleShowQuestion = () => {
    setShowQuestion(true);
    setResult(null);
    setUserAnswer("");
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    const isCorrect = checkAnswer(userAnswer.trim(), answer);
    setResult(isCorrect ? "correct" : "incorrect");
    
    // 正解の場合、学習完了を記録
    if (isCorrect && contentId) {
      try {
        const response = await fetch(`/api/learnings/${contentId}/learn`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          onLearningComplete?.();
          
          // 学習コンテンツ正解時のクエストクリアチェック
          try {
            const questResponse = await fetch('/api/checkClearQuest', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                trigger_event: 'content_learned',
                target_id: contentId
              }),
            });
            
            if (questResponse.ok) {
              const questResult = await questResponse.json();
              if (questResult.points > 0) {
                setQuestPoints(questResult.points);
                setShowQuestPopup(true);
              }
            }
          } catch (questError) {
            console.error('Quest check error:', questError);
          }
        } else {
          console.error('Failed to mark learning content as learned');
        }
      } catch (error) {
        console.error('Failed to mark learning content as learned:', error);
      }
    }
  };

  const checkAnswer = (userInput: string, correctAnswer: string): boolean => {
    // 1文字の場合は完全一致
    if (correctAnswer.length === 1) {
      return userInput === correctAnswer;
    }
    
    // 複数文字の場合は部分一致（ユーザー入力に正解が含まれているか）
    return userInput.includes(correctAnswer);
  };

  const handleReset = () => {
    setShowQuestion(false);
    setUserAnswer("");
    setResult(null);
  };

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
      {!showQuestion ? (
        <div className="text-center">
          <Button 
            onClick={handleShowQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
          >
            問題を表示する
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">問題</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{question}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                回答
              </label>
              <textarea
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="回答を入力してください"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                回答する
              </Button>
              <Button 
                onClick={handleReset}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                リセット
              </Button>
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-lg border ${
              result === "correct" 
                ? "bg-green-50 border-green-200 text-green-800" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <div className="flex items-center gap-2">
                {result === "correct" ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="font-medium">
                  {result === "correct" 
                    ? "正解です。おめでとうございます！" 
                    : "残念ながら不正解です。もう一度、学習内容と問題を確認してみてください。"
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      <QuestClearPopup
        isOpen={showQuestPopup}
        onClose={() => setShowQuestPopup(false)}
        points={questPoints}
      />
    </div>
  );
}

