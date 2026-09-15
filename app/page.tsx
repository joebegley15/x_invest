import Image from "next/image";

export default function Home() {
  const boxes = ["Box 1", "Box 2", "Box 3"];

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <div className="flex w-full max-w-5xl flex-row gap-6">
        {boxes.map((label) => (
          <div
            key={label}
            className="flex h-48 flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white text-lg font-semibold text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {label}
          </div>
        ))}
      </div>
    </main>
  );
}