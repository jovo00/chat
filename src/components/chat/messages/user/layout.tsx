import UserMessageFooter from "./footer";
import { memo, ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Doc } from "@gen/dataModel";
import useChatState from "@/lib/state/chat";

function UserMessageLayoutComponent({ message, children }: { message?: Doc<"messages">; children: ReactNode }) {
  const messageIsHidden = message?.hide_prompt;
  const select = useChatState((state) => state.select);

  return (
    <>
      <div
        className={cn(
          "group relative flex w-fit max-w-[85%] flex-col items-end justify-center gap-1 self-end rounded-4xl px-2",
          messageIsHidden && "opacity-60",
        )}
        onPointerEnter={() => message && select(message._id, true)}
      >
        <div
          className={cn(
            "bg-card relative flex w-full max-w-full items-start self-end overflow-hidden rounded-4xl px-2 transition-colors",
            messageIsHidden && "px-0",
          )}
        >
          {messageIsHidden ? (
            <Accordion type="single" collapsible className="w-full px-0">
              <AccordionItem value="user-message" className="w-full border-none">
                <AccordionTrigger className="hover:bg-accent flex cursor-pointer items-center justify-between rounded-none px-4 pl-6 hover:no-underline">
                  <span className="flex items-center gap-2 pr-4 text-left">Message removed from context</span>
                </AccordionTrigger>
                <AccordionContent className="flex w-full flex-1 flex-col px-5 py-4 pt-1 text-base hyphens-auto">
                  {children}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <div className="flex w-full flex-1 flex-col gap-2 p-4 text-base hyphens-auto">{children}</div>
          )}
        </div>
        {message && <UserMessageFooter message={message} />}
      </div>
    </>
  );
}

export const UserMessageLayout = memo(UserMessageLayoutComponent);
