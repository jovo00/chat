import { Doc } from "@gen/dataModel";

type Props = {
  message: Doc<"messages">;
  children: React.ReactNode;
  isUser: boolean;
};

export default function MessageItem({ message, children, isUser }: Props) {
  return (
    <>
      <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
        <div className={`flex max-w-[95%] gap-4 md:max-w-[85%] ${isUser && "flex-row-reverse"}`}>
          <div className={`rounded-lg px-5 py-4 text-base ${isUser ? "bg-popover text-foreground" : ""}`}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
