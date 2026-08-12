import { create } from "zustand";

interface EditorState {
  language: string;
  theme: "vs-dark" | "light";
  roomId: string | null;
  token: string | null;
  user: { id: string; email: string; name: string | null } | null;
  setLanguage: (lang: string) => void;
  toggleTheme: () => void;
  setRoomId: (id: string) => void;
  setAuth: (
    token: string,
    user: { id: string; email: string; name: string | null },
  ) => void;
  logout: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  language: "javascript",
  theme: "vs-dark",
  roomId: null,
  token: localStorage.getItem("token"),
  user: null,
  setLanguage: (lang) => set({ language: lang }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "vs-dark" ? "light" : "vs-dark",
    })),
  setRoomId: (id) => set({ roomId: id }),
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, roomId: null });
  },
}));
