"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/solid";

const users = [
  { label: 'Rick', value: 'rick', password: 'demo' },
  { label: 'Admin', value: 'admin', password: 'admin123' },
];

export default function Login() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [username, setUsername] = useState(users[0].value);
  const [password, setPassword] = useState(users[0].password);
  const [error, setError] = useState("");

  function handleUserChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const user = users.find(u => u.value === e.target.value)!;
    setSelectedUser(user);
    setUsername(user.value);
    setPassword(user.password);
    setError("");
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (username === "rick" && password === "demo") {
      router.push("/dashboard");
    } else if (username === "admin" && password === "admin123") {
      router.push("/dashboard-admin");
    } else {
      setError("Ongeldige inloggegevens");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ backgroundColor: '#181F17' }}>
      <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-2 text-center">
          <span className="text-white">TOP TIER </span>
          <span className="text-[#8BAE5A]">MEN</span>
        </h1>
        <p className="text-[#8BAE5A] text-center mb-8 text-lg font-['Figtree']">Log in op je dashboard</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="relative">
            <select
              value={selectedUser.value}
              onChange={handleUserChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] border border-[#3A4D23] mb-4 appearance-none font-['Figtree']"
            >
              {users.map(user => (
                <option key={user.value} value={user.value}>{user.label}</option>
              ))}
            </select>
            <UserIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-4" />
          </div>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-['Figtree']"
              placeholder="Gebruikersnaam"
              autoComplete="username"
              readOnly
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-['Figtree']"
              placeholder="Wachtwoord"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="text-[#B6C948] text-center text-sm -mt-4 border border-[#B6C948] rounded-lg py-1 bg-[#181F17] font-['Figtree']">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#3A4D23] text-[#181F17] font-semibold text-lg shadow-lg hover:from-[#B6C948] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] font-['Figtree']"
          >
            Inloggen
          </button>
        </form>
      </div>
    </div>
  );
} 