"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { login } from "./actions";

function LoginForm() {
  const next = useSearchParams().get("next") ?? "/admin";
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h1 className="text-2xl font-semibold">Enter password</h1>
      <input type="hidden" name="next" value={next} />
      <input
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