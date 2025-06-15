import { Doc, Id } from "@gen/dataModel";
import { create } from "zustand";

export type InputState = {
  model: Id<"models"> | null;
  setModel: (model: Id<"models">) => void;

  optimisticPrompts: {
    [key: Id<"chats">]: {
      prompt: string;
      model: Doc<"models">;
      files: Doc<"files">[];
    };
  };
  addOptimisticPrompt: (chat: Id<"chats">, model: Doc<"models">, prompt: string, files: Doc<"files">[]) => void;
  clearOptimisticPrompt: (chat: Id<"chats">) => void;
};

const useInputState = create<InputState>((set, get) => ({
  model: null,
  setModel: (model) => set({ model }),

  optimisticPrompts: {},
  addOptimisticPrompt: (chat, model, prompt, files) => {
    set({
      optimisticPrompts: {
        ...get().optimisticPrompts,
        [chat]: {
          prompt,
          model,
          files,
        },
      },
    });
  },
  clearOptimisticPrompt: (chat) => {
    if (get().optimisticPrompts[chat]) {
      set({ optimisticPrompts: { ...get().optimisticPrompts, [chat]: undefined } });
    }
  },
}));

export default useInputState;
