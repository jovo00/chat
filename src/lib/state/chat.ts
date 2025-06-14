import { Id } from "@gen/dataModel";
import { create } from "zustand";

export type ChatState = {
  streaming: Map<Id<"chats">, Set<Id<"messages">>>;
  addStreaming: (chat: Id<"chats">, message: Id<"messages">) => void;
  removeStreaming: (chat: Id<"chats">, message: Id<"messages">) => void;
};

const useChatState = create<ChatState>((set, get) => ({
  streaming: new Map(),
  addStreaming(chat, message) {
    set((prev) => {
      const newChat = prev.streaming.get(chat) ?? new Set();
      newChat.add(message);
      prev.streaming.set(chat, newChat);
      return { streaming: prev.streaming };
    });
  },

  removeStreaming(chat, message) {
    set((prev) => {
      if (!prev.streaming.has(chat)) return { streaming: prev.streaming };

      const messages = prev.streaming.get(chat);
      if (!messages) return { streaming: prev.streaming };

      messages.delete(message);

      if (messages.size === 0) {
        prev.streaming.delete(chat);
      }

      return { streaming: prev.streaming };
    });
  },
}));

export default useChatState;
