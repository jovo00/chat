import { clsx, type ClassValue } from "clsx";
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
    case "openai":
      return "OpenAI";
    case "google":
      return "Google";
    case "replicat":
      return "Replicate";
    case "xai":
      return "xAI";
    case "deepseek":
      return "DeepSeek";
    case "anthropic":
      return "Anthropic";
    case "meta":
      return "Meta";
    case "mistral":
      return "Mistral";
    default:
      return "";
  }
}
