import { useState, useRef, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { useEditorStore } from "./store";
import Auth from "./Auth";

const LANGUAGES = ["javascript", "typescript", "python", "java", "cpp"];

function App() {
  const {
    language,
    theme,
    roomId,
    token,
    setLanguage,
    toggleTheme,
    setRoomId,
  } = useEditorStore();
  const [roomInput, setRoomInput] = useState("");

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const handleJoinRoom = () => {
    if (roomInput.trim()) setRoomId(roomInput.trim());
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    setRoomId(newRoomId);
  };

  const handleEditorMount: OnMount = (editor) => {
    if (!roomId) return;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider("ws://localhost:4000", roomId, ydoc);
    providerRef.current = provider;

    const yText = ydoc.getText("monaco");

    const binding = new MonacoBinding(
      yText,
      editor.getModel()!,
      new Set([editor]),
      provider.awareness,
    );
    bindingRef.current = binding;
  };

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    };
  }, [roomId]);

  // 1️⃣ Not logged in → show Auth screen
  if (!token) {
    return <Auth />;
  }

  // 2️⃣ Logged in but no room yet → show Join/Create room screen
  if (!roomId) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg w-96 flex flex-col gap-4">
          <h1 className="text-white text-xl font-semibold text-center">
            Koinon — Join a Room
          </h1>
          <input
            className="bg-gray-700 text-white px-3 py-2 rounded outline-none"
            placeholder="Enter room ID"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
          />
          <button
            onClick={handleJoinRoom}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Join Room
          </button>
          <div className="text-gray-400 text-center text-sm">or</div>
          <button
            onClick={handleCreateRoom}
            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            Create New Room
          </button>
        </div>
      </div>
    );
  }

  // 3️⃣ Logged in AND in a room → show the editor
  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Koinon</span>
          <span className="text-gray-400 text-sm">Room: {roomId}</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <button
            onClick={toggleTheme}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            {theme === "vs-dark" ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          onMount={handleEditorMount}
        />
      </div>
    </div>
  );
}

export default App;
