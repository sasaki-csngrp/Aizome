import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { getUserById, getAvatars } from "@/app/lib/services";
import ProfileForm from "@/app/components/ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const user = await getUserById(session.user.id);
  const avatars = await getAvatars();

  if (!user) {
    // This should ideally not happen if the user is authenticated
    // but handle it gracefully
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">プロフィール設定</h1>
      <ProfileForm user={user} avatars={avatars} />
    </div>
  );
}
