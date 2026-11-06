import type { ReactNode } from "react";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { BrandLogo } from "@/components/common/brand-logo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      <AuthBrandPanel />
      <main className="flex flex-col items-center justify-center gap-10 px-6 py-12 sm:px-12">
        <BrandLogo className="lg:hidden" />
        {children}
      </main>
    </div>
  );
}
