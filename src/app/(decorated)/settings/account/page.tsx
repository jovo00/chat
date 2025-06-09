import Account from "@/components/settings/account";
import { preloadUser } from "@/lib/auth/server";

export default async function AccountSettings() {
  const preloaded = await preloadUser();

  return <Account preloadedUser={preloaded} />;
}
