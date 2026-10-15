import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-brand-ivory px-4 py-10">
      <Link href="/" className="mb-6 text-xl font-bold text-brand-green">
        탄생
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-brand-green/15 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
