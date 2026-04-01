import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileForm from "@/components/features/profile/ProfileForm";

export const metadata = { title: "Profil Pengguna" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 min-h-[calc(100vh-65px)]">
      <h1 className="text-3xl font-bold mb-2 tracking-tight">Pengaturan Profil</h1>
      <p className="text-gray-500 mb-8 font-medium">Kelola informasi publik dan foto profil Anda.</p>
      
      <ProfileForm user={user} />
    </div>
  );
}
