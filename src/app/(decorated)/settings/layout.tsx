import SettingsNav from "@/components/settings/nav";
import { preloadUser } from "@/lib/auth/server";
import { ReactNode } from "react";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const preloadedUser = await preloadUser();

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <main className="bg-background flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto hidden w-full max-w-6xl gap-2 lg:grid">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <SettingsNav preloadedUser={preloadedUser} />
          <div className="grid gap-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
