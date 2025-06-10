import Logo from "../icons/logos/logo";
import ChatInput from "./input/input";

export default function NewChat() {
  return (
    <>
      <div className="h-auto w-full flex-1 overflow-y-auto">
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            <Logo className="mb-1 size-5 md:size-6" /> <h1 className="font-special text-xl md:text-2xl">Chat AI</h1>
          </div>
          <div className="w-60 md:w-72">Model Select</div>
        </div>
      </div>
      <ChatInput />
    </>
  );
}
