import Header from "./header";
import Sidebar from "./sidebar";
import { preloadUser } from "@/lib/auth/server";
import { getLastDeviceState, getLastSidebarState } from "@/lib/state/cookies";
import { ErrorBoundary } from "react-error-boundary";

export default async function Root({ children }: { children: React.ReactNode }) {
  const preloadedUser = await preloadUser();
  const lastSidebarState = await getLastSidebarState();
  const lastDeviceState = await getLastDeviceState();

  return (
    <div className="bg-background w-full h-full flex overflow-hidden">
      <Sidebar lastSidebarState={lastSidebarState} lastDeviceState={lastDeviceState} preloadedUser={preloadedUser} />

      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <ErrorBoundary fallback={null}>
          <Header preloadedUser={preloadedUser} lastDeviceState={lastDeviceState} />
        </ErrorBoundary>
        <div className="flex flex-1 h-[calc(100svh-3.5rem)] w-full">{children}</div>
      </div>
    </div>
  );
}
