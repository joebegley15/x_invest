"use client";

import { useActionState, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "./actions";
import { Starfield } from "@/app/components/starfield";
import { ShowTitle } from "@/app/components/show-title";

type Role = "admin" | "judge";

function LoginForm() {
  const params = useSearchParams();
  const initialRole: Role = params.get("role") === "judge" ? "judge" : "admin";
  const next = params.get("next") ?? "";
  const [role, setRole] = useState<Role>(initialRole);
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-line bg-panel p-6">
      <div className="flex rounded-lg border border-line p-1">
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`flex-1 rounded-md px-3 py-2 font-display text-sm uppercase tracking-[0.02em] transition-colors ${
            role === "admin" ? "bg-gold text-navy" : "text-lavender"
          }`}
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => setRole("judge")}
          className={`flex-1 rounded-md px-3 py-2 font-display text-sm uppercase tracking-[0.02em] transition-colors ${
            role === "judge" ? "bg-gold text-navy" : "text-lavender"
          }`}
        >
          Judge
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <h1 className="font-display text-2xl uppercase tracking-[0.02em] text-white">
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
          className="rounded-lg border border-line bg-navy px-3 py-2 text-ice placeholder:text-lavender focus:outline-none focus:ring-2 focus:ring-gold"
        />
        {state?.error && <p className="text-sm text-vote-out">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
        >
          {pending ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-navy p-8">
      <Starfield />
      <div className="relative z-10 flex w-full flex-col items-center gap-8">
        <ShowTitle size="sm" />
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
