import { auth } from "@/server/auth/config";
import { getOrCreateWorkspace } from "@/server/clients/service";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { CreateClientForm } from "./create-client-form";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const workspace = await getOrCreateWorkspace(
    prisma,
    session.user.id,
    session.user.name ? `${session.user.name}'s workspace` : "My agency",
  );

  const clients = await prisma.client.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Clients
        </h1>
        <p className="mt-2 text-stone-600">
          Manage brand workspaces for{" "}
          <span className="font-medium text-stone-800">{workspace.name}</span>
          .
        </p>

        <CreateClientForm />

        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            Brand portfolio
          </h2>
          {clients.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
              No clients yet. Add your first brand above.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white shadow-sm">
              {clients.map((c) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 first:rounded-t-2xl last:rounded-b-2xl"
                  key={c.id}
                >
                  <div>
                    <p className="font-medium text-stone-900">{c.name}</p>
                    <p className="text-sm text-stone-600">{c.industry}</p>
                    {c.audience ? (
                      <p className="mt-1 text-xs text-stone-500">
                        Audience: {c.audience}
                      </p>
                    ) : null}
                  </div>
                  <p className="font-mono text-xs text-stone-400">{c.id}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
