"use client";

import { memo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Doc } from "@gen/dataModel";

function AssistantMessageLayoutComponent({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: Doc<"messages">;
}) {
  if (message?.hide_content) {
    return (
      <Accordion type="single" collapsible className="group relative flex w-full items-start opacity-60">
        <AccordionItem value="assistant-message" className="w-full border-none px-0">
          <AccordionTrigger className="bg-card hover:bg-accent flex max-w-fit cursor-pointer items-center justify-start rounded-4xl px-6 hover:no-underline">
            <span className="flex items-center text-left">Message removed from context</span>
          </AccordionTrigger>
          <AccordionContent className="w-full px-4 pt-4">{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return children;
}

export const AssistantMessageLayout = memo(AssistantMessageLayoutComponent);
