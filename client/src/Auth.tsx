import { useState } from "react";
import { useEditorStore } from "./store";

const API_URL = import.meta.env.VITE_API_URL;

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const setAuth = useEditorStore((state) => state.setAuth);

  const handleSubmit = async () => {
    setError("");
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin ? { email, password } : { email, password, name },
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (isLogin) {
        // Login returns token directly
        setAuth(data.token, data.user);
      } else {
        // Register doesn't return a token — auto-login after register
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        setAuth(loginData.token, loginData.user);
      }
    } catch (err) {
      setError("Could not connect to server");
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg w-96 flex flex-col gap-4">
        <h1 className="text-white text-xl font-semibold text-center">
          {isLogin ? "Login to Koinon" : "Create an Account"}
        </h1>

        {!isLogin && (
          <input
            className="bg-gray-700 text-white px-3 py-2 rounded outline-none"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          className="bg-gray-700 text-white px-3 py-2 rounded outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="bg-gray-700 text-white px-3 py-2 rounded outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          {isLogin ? "Login" : "Register"}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-gray-400 text-sm text-center hover:text-white"
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default Auth;
