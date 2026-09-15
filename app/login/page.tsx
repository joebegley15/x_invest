"use client";

import { useActionState, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "./actions";

type Role = "admin" | "judge";

function LoginForm() {
  const params = useSearchParams();
  const initialRole: Role = params.get("role") === "judge" ? "judge" : "admin";
  const next = params.get("next") ?? "";
  const [role, setRole] = useState<Role>(initialRole);
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex rounded-lg border border-zinc-300 p-1 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            role === "admin"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "text-zinc-500"
          }`}
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => setRole("judge")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            role === "judge"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "text-zinc-500"
          }`}
        >
          Judge
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">
          {role === "admin" ? "Admin login" : "Judge login"}
        </h1>
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="next" value={next} />
        <input
          key={role}
          name="password"
          type="password"
          placeholder="Password"
          required
          autoFocus
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
