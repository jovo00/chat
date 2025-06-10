import { Id } from "@gen/dataModel";
import { create } from "zustand";

export type InputState = {
  model: Id<"models"> | null;
  setModel: (model: Id<"models">) => void;
};

const useInputState = create<InputState>((set, get) => ({
  model: null,
  setModel: (model) => set({ model }),
}));

export default useInputState;
