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
import { useSession } from "next-auth/react";

interface ProfileFormProps {
  user: User;
  avatars: Avatar[];
}

export default function ProfileForm({ user, avatars }: ProfileFormProps) {
  const { update } = useSession();
  const [nickname, setNickname] = useState(user.nickname || "");
  const [bio, setBio] = useState(user.bio || "");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    user.avatar_id?.toString() || "1" // Default to avatar_id 1 if not set
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      setMessage("Nickname is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedUser = await updateUserProfile(
        user.id,
        nickname,
        bio,
        parseInt(selectedAvatarId)
      );
      setMessage("Profile updated successfully!");
      // Update the session to reflect the new user data
      await update({
        nickname: updatedUser.nickname,
        bio: updatedUser.bio,
        image: updatedUser.image, // Assuming image is returned from update
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessage(`Error updating profile: ${errorMessage}`);
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
          className={`p-3 rounded-md ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
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
          <h2 className="text-2xl font-semibold">{nickname || "No Nickname"}</h2>
          <p className="text-gray-500">Total Points: {user.total_points || 0}</p>
        </div>
      </div>

      <div>
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
        />
      </div>

      <div>
        <Label>Select Avatar</Label>
        <RadioGroup
          value={selectedAvatarId}
          onValueChange={setSelectedAvatarId}
          className="grid grid-cols-3 gap-4 mt-2"
        >
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className="flex flex-col items-center justify-center space-y-2 p-4 border rounded-md cursor-pointer hover:bg-gray-50"
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
