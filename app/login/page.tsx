import { Suspense, type ReactNode } from "react";
import { LoginForm } from "./login-form";

function LoginShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          ViralCraft AI
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Sign in to your agency workspace.
        </p>
        {children}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <LoginShell>
      <Suspense
        fallback={
          <p className="mt-8 text-sm text-stone-500">Loading sign-in form…</p>
        }
      >
        <LoginForm />
      </Suspense>
    </LoginShell>
  );
}
