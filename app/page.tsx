import { auth } from "@/server/auth/config";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-stone-50 p-8">
      <h1 className="font-serif text-2xl font-bold text-stone-900">
        ViralCraft AI
      </h1>
      <p className="mt-2 text-stone-600">
        Signed in as{" "}
        <span className="font-medium text-stone-900">
          {session.user.email}
        </span>
        . Dashboard and client tools ship in the next tasks.
      </p>
    </main>
  );
}
