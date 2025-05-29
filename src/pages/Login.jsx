import { useState } from "react";
import { useRouter } from "next/router";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/solid";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("rick");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    if (username === "rick" && password === "demo") {
      router.push("/dashboard");
    } else {
      setError("Ongeldige inloggegevens");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] via-[#393053] to-[#443C68]">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-[#18122B]/90 border border-[#393053]/60 backdrop-blur-lg">
        <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight drop-shadow-lg">Top Tier Men</h1>
        <p className="text-[#A3AED6] text-center mb-8 text-lg">Log in op je dashboard</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="relative">
            <UserIcon className="w-5 h-5 text-[#A3AED6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#232042] text-white placeholder-[#A3AED6] focus:outline-none focus:ring-2 focus:ring-[#635985] transition shadow-inner"
              placeholder="Gebruikersnaam"
              autoComplete="username"
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-[#A3AED6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#232042] text-white placeholder-[#A3AED6] focus:outline-none focus:ring-2 focus:ring-[#635985] transition shadow-inner"
              placeholder="Wachtwoord"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="text-red-400 text-center text-sm -mt-4">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#635985] to-[#18122B] text-white font-semibold text-lg shadow-lg hover:scale-[1.02] hover:from-[#443C68] hover:to-[#635985] transition-all duration-200"
          >
            Inloggen
          </button>
        </form>
      </div>
    </div>
  );
} 