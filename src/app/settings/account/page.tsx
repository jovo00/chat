import SettingsNav from "@/components/settings/nav";
import Account from "@/components/settings/account";
import { preloadUser } from "@/lib/auth/server";

export default async function AccountSettings() {
  const preloaded = await preloadUser();

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <main className="flex flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
        <div className="mx-auto  w-full max-w-6xl gap-2 hidden lg:grid">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <SettingsNav />
          <div className="grid gap-6">
            <Account preloadedUser={preloaded} />
          </div>
        </div>
      </main>
    </div>
  );
}
