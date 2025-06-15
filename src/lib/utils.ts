import { Doc, Id } from "@gen/dataModel";
import { clsx, type ClassValue } from "clsx";
import { ConvexError } from "convex/values";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name?: string, username?: string, email?: string): string {
  if (name) {
    let nameParts = name.trim().split(" ");
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    } else {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
  } else if (email) {
    return email.substring(0, 2).toUpperCase();
  } else if (username) {
    return username.substring(0, 2).toUpperCase();
  } else {
    return "";
  }
}

export const fontSize =
  typeof window === "undefined" ? 16 : parseFloat(getComputedStyle(document.documentElement).fontSize);

export function convertRemToPixels(rem: number) {
  if (typeof window === "undefined") return rem * 16;
  return rem * fontSize;
}

export function convertPixelsToRem(px: number) {
  if (typeof window === "undefined") return px / 16;
  return px / fontSize;
}

export function getPricingColor(pricing: number) {
  if (pricing === 0) {
    return "#8ecaff";
  } else if (pricing < 1) {
    return "#a2ff91";
  } else if (pricing < 2) {
    return "#ceffab";
  } else if (pricing < 5) {
    return "#fffba7";
  } else if (pricing < 8) {
    return "#ffe5a2";
  } else if (pricing < 10) {
    return "#ffcf97";
  } else if (pricing < 15) {
    return "#ffa794";
  } else if (pricing < 20) {
    return "#ff9a91";
  } else if (pricing < 50) {
    return "#ff94a8";
  } else {
    return "#ff94cd";
  }
}

export function roundCost(cost: number) {
  return Math.round(cost * 100000000) / 100;
}

export function getProviderName(provider: string) {
  switch (provider) {
    case "openrouter":
      return "OpenRouter";
    default:
      return "";
  }
}

export function getFileExtension(filename: string) {
  if (!filename.includes(".")) return { name: filename, extension: "" };
  const parts = filename.split(".");
  const extension = parts.pop();
  return { name: parts.join("."), extension };
}

export const updateListMargin = (messageRef: React.RefObject<HTMLDivElement | null>) => {
  messageRef?.current?.querySelectorAll("ol")?.forEach((el) => {
    const start = parseInt(el.getAttribute("start") || "1");
    el.querySelectorAll("li")?.forEach((li, i) => {
      li.style.marginLeft = `${`${start + i}`.length + 1}ch`;
    });
  });
};

export function getErrorMessage(error: Error) {
  if (error instanceof ConvexError) {
    return (error as ConvexError<string>).data;
  } else {
    return error?.message;
  }
}

export function createOptimisticMessage(
  chatId: Id<"chats">,
  optimisticData: {
    prompt: string;
    model: Doc<"models">;
    files: Doc<"files">[];
  },
) {
  return {
    _id: "optimistic" as Id<"messages">,
    _creationTime: Date.now(),
    prompt: optimisticData.prompt,
    cancelled: false,
    chat: chatId,
    files: optimisticData.files,
    hide_content: false,
    hide_prompt: false,
    model: optimisticData.model,
    online: false,
    status: "pending",
    user: "current" as Id<"users">,
  } as Doc<"messages"> & { files: Doc<"files">[]; model: Doc<"models"> };
}
