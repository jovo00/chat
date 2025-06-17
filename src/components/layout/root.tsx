import Header from "./header";
import Sidebar from "./sidebar";
import { preloadUser } from "@/lib/auth/server";
import { preloadPaginatedQuery } from "@/lib/convex/preload";
import { getLastDeviceState, getLastSidebarState } from "@/lib/state/cookies";
import { api } from "@gen/api";
import { ErrorBoundary } from "react-error-boundary";

export default async function Root({ children }: { children: React.ReactNode }) {
  const preloadedUser = await preloadUser();
  const preloadedChatHistory = await preloadPaginatedQuery(api.chat.get.chats, {}, { initialNumItems: 50 });
  const lastSidebarState = await getLastSidebarState();
  const lastDeviceState = await getLastDeviceState();

  return (
    <div className="bg-background flex h-svh min-h-[20rem] w-full overflow-hidden">
      <Sidebar
        lastSidebarState={lastSidebarState}
        lastDeviceState={lastDeviceState}
        preloadedUser={preloadedUser}
        preloadedChatHistory={preloadedChatHistory}
      />

      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <ErrorBoundary fallback={null}>
          <Header preloadedUser={preloadedUser} lastDeviceState={lastDeviceState} />
        </ErrorBoundary>
        <div className="flex h-[calc(100svh-3.5rem)] w-full flex-1">{children}</div>
      </div>
    </div>
  );
}
