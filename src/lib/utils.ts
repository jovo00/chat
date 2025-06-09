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
