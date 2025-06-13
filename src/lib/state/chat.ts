import { Id } from "@gen/dataModel";
import { create } from "zustand";

export type ChatState = {
  drivenIds: Set<Id<"messages">>;
  addDrivenId: (id: Id<"messages">) => void;

  streaming: boolean;
  setStreaming: (streaming: boolean) => void;
};

const useChatState = create<ChatState>((set, get) => ({
  drivenIds: new Set(),
  addDrivenId(id) {
    set((prev) => {
      prev.drivenIds.add(id);
      return { drivenIds: new Set(prev.drivenIds) };
    });
  },

  streaming: false,
  setStreaming(streaming) {
    set({ streaming });
  },
}));

export default useChatState;
