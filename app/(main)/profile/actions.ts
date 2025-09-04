"use server";

import { updateUser } from "@/app/lib/services";
import { revalidatePath } from "next/cache";
import { User } from "@/app/lib/models";

export async function updateUserProfile(
  userId: string,
  nickname: string,
  bio: string,
  avatarId: number
): Promise<User> {
  try {
    const updatedUser = await updateUser(userId, {
      nickname,
      bio,
      avatar_id: avatarId,
    });
    revalidatePath("/profile");
    return updatedUser;
  } catch (error: unknown) {
    console.error("Error in updateUserProfile server action:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to update user profile: ${errorMessage}`);
  }
}
