import { create } from "zustand";

interface EditorState {
  language: string;
  theme: "vs-dark" | "light";
  roomId: string | null;
  setLanguage: (lang: string) => void;
  toggleTheme: () => void;
  setRoomId: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  language: "javascript",
  theme: "vs-dark",
  roomId: null,
  setLanguage: (lang) => set({ language: lang }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "vs-dark" ? "light" : "vs-dark",
    })),
  setRoomId: (id) => set({ roomId: id }),
}));

