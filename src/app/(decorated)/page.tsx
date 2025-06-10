import NewChat from "@/components/chat/new-chat";
import ShiftMobile from "@/components/layout/shift-mobile";

export default async function StartChat() {
  return (
    <ShiftMobile>
      <div className="flex-1 h-full overflow-y-auto flex flex-col">
        <NewChat />
      </div>
    </ShiftMobile>
  );
}
