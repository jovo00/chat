import { create } from "zustand";

export type MenuState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const useMenuState = create<MenuState>((set, get) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

export default useMenuState;
