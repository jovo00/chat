import NewChat from "@/components/chat/new-chat";
import ShiftMobile from "@/components/layout/shift-mobile";

export default async function StartChat() {
  return (
    <ShiftMobile>
      <div className="flex h-full flex-1 flex-col overflow-y-auto">
        <NewChat />
      </div>
    </ShiftMobile>
  );
}
