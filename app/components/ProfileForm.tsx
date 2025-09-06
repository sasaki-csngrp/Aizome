"use client";

import { useState, useEffect } from "react";
import { User, Avatar } from "@/app/lib/models";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar as UIAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserProfile } from "@/app/(main)/profile/actions";
import QuestClearPopup from "./QuestClearPopup";

interface ProfileFormProps {
  user: User;
  avatars: Avatar[];
}

export default function ProfileForm({ user, avatars }: ProfileFormProps) {
  const [nickname, setNickname] = useState(user.nickname || "");
  const [bio, setBio] = useState(user.bio || "");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    user.avatar_id?.toString() || "1"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showQuestPopup, setShowQuestPopup] = useState(false);
  const [questPoints, setQuestPoints] = useState(0);

  useEffect(() => {
    setNickname(user.nickname || "");
    setBio(user.bio || "");
    setSelectedAvatarId(user.avatar_id?.toString() || "1");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (!nickname.trim()) {
      setMessage("ニックネームは必須です。");
      setIsSubmitting(false);
      return;
    }

    try {
      await updateUserProfile(
        user.id,
        nickname,
        bio,
        parseInt(selectedAvatarId)
      );
      setMessage("プロフィールが正常に更新されました。");
      
      // クエストクリアチェック
      try {
        const response = await fetch('/api/checkClearQuest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trigger_event: 'profile_updated'
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.points > 0) {
            setQuestPoints(result.points);
            setShowQuestPopup(true);
          }
        }
      } catch (questError) {
        console.error('Quest check error:', questError);
        // クエストチェックのエラーは無視（プロフィール更新は成功している）
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました。";
      setMessage(`プロフィールの更新中にエラーが発生しました: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAvatar = avatars.find(
    (avatar) => avatar.id.toString() === selectedAvatarId
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {message && (
        <div
          className={`p-3 rounded-md ${message.includes("エラー") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {message}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <UIAvatar className="w-20 h-20">
          <AvatarImage src={currentAvatar?.image_url || "/avatars/default.png"} alt="User Avatar" />
          <AvatarFallback>{nickname ? nickname[0] : "?"}</AvatarFallback>
        </UIAvatar>
        <div>
          <h2 className="text-2xl font-semibold">{nickname || "ニックネーム未設定"}</h2>
          <p className="text-gray-500">合計ポイント: {user.total_points || 0}</p>
        </div>
      </div>

      <div>
        <Label htmlFor="nickname">ニックネーム</Label>
        <Input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="bio">自己紹介</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
        />
      </div>

      <div>
        <Label>アバターを選択</Label>
        <RadioGroup
          value={selectedAvatarId}
          onValueChange={setSelectedAvatarId}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-2"
        >
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className="flex flex-col items-center justify-center space-y-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <RadioGroupItem value={avatar.id.toString()} id={`avatar-${avatar.id}`} className="sr-only" />
              <label htmlFor={`avatar-${avatar.id}`} className="flex flex-col items-center cursor-pointer">
                <UIAvatar className="w-16 h-16">
                  <AvatarImage src={avatar.image_url} alt={avatar.name} />
                  <AvatarFallback>{avatar.name[0]}</AvatarFallback>
                </UIAvatar>
                <span className="text-sm mt-2 text-center">{avatar.name}</span>
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div className="pt-4">
        <p className="text-sm text-center text-gray-500 mb-2">変更内容は次回ログイン時から反映されます。</p>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : "プロフィールを保存"}
        </Button>
      </div>
      
      <QuestClearPopup
        isOpen={showQuestPopup}
        onClose={() => setShowQuestPopup(false)}
        points={questPoints}
      />
    </form>
  );
}