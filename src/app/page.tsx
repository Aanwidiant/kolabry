"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
        <main className="min-h-screen w-screen flex justify-center items-center flex-col gap-2">
          <h1 className='text-xl font-medium'>Akan dibuat landing page dengan konten landing, about, pricing, developer team</h1>
          <button
              onClick={handleLoginClick}
              className="mb-6 px-6 py-2 rounded bg-primary text-light hover:secondary transition"
          >
            Go to Login
          </button>
        </main>
  );
}
