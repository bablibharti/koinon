import Editor from "@monaco-editor/react";

function App() {
  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 text-white px-4 py-3 text-lg font-semibold">
        Koinon — Collaborative Code Editor
      </header>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start typing here..."
          theme="vs-dark"
        />
      </div>
    </div>
  );
}

export default App;
