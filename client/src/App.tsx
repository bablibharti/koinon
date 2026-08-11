import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useEditorStore } from "./store";

const LANGUAGES = ["javascript", "typescript", "python", "java", "cpp"];

function App() {
  const { language, theme, roomId, setLanguage, toggleTheme, setRoomId } =
    useEditorStore();
  const [roomInput, setRoomInput] = useState("");

  // Dummy room join — no backend yet, just local state
  const handleJoinRoom = () => {
    if (roomInput.trim()) {
      setRoomId(roomInput.trim());
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    setRoomId(newRoomId);
  };

  // If no room yet, show join/create screen
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

  // Editor screen once a room exists
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
          defaultValue="// Start typing here..."
        />
      </div>
    </div>
  );
}

export default App;
