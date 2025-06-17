import NewChat from "@/components/chat/new-chat";

export default async function Home() {
  return (
    <div className="relative flex h-full flex-1 flex-col overflow-y-auto">
      <NewChat />
    </div>
  );
}
