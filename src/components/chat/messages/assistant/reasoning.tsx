"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Content from "../content";
import Loader from "@/components/ui/loader";

function ReasoningAccordionComponent({ reasoning, isReasoning }: { reasoning?: string | null; isReasoning: boolean }) {
  if (!reasoning) return null;

  return (
    <Accordion type="single" collapsible className="group relative flex w-full items-start pb-3 opacity-70">
      <AccordionItem value="user-reasoning" className="w-full border-none">
        <AccordionTrigger
          className={cn(
            "flex flex-none cursor-pointer items-center justify-between gap-2 py-0 text-base hover:no-underline",
          )}
        >
          {isReasoning && (
            <div className="relative ml-1 h-5 w-10 overflow-hidden">
              <Loader />
            </div>
          )}
          Reasoning
        </AccordionTrigger>
        <AccordionContent className="message bg-card mt-5 flex w-full max-w-full flex-1 grow-0 flex-col gap-3 rounded-md p-5">
          <Content markdown={reasoning} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export const ReasoningAccordion = memo(ReasoningAccordionComponent);
