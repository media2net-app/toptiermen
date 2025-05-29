'use client';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#1a1a1a] to-[#2d2d2d]">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-[#111111]/95 border border-[#C49C48]/60 backdrop-blur-lg">
        <h1 className="text-3xl font-bold text-[#C49C48] mb-2 text-center tracking-tight drop-shadow-lg">Top Tier Men</h1>
        <p className="text-[#E5C97B] text-center mb-8 text-lg">Log in op je dashboard</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="relative">
            <select
              value={selectedUser.value}
              onChange={handleUserChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181818] text-[#C49C48] focus:outline-none focus:ring-2 focus:ring-[#C49C48] border border-[#C49C48]/30 mb-4 appearance-none"
            >
              {users.map(user => (
                <option key={user.value} value={user.value}>{user.label}</option>
              ))}
            </select>
            <UserIcon className="w-5 h-5 text-[#C49C48] absolute left-3 top-4" />
          </div>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181818] text-[#C49C48] placeholder-[#C49C48] focus:outline-none focus:ring-2 focus:ring-[#C49C48] transition shadow-inner border border-[#C49C48]/30"
              placeholder="Gebruikersnaam"
              autoComplete="username"
              readOnly
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-[#C49C48] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181818] text-[#C49C48] placeholder-[#C49C48] focus:outline-none focus:ring-2 focus:ring-[#C49C48] transition shadow-inner border border-[#C49C48]/30"
              placeholder="Wachtwoord"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="text-[#C49C48] text-center text-sm -mt-4 border border-[#C49C48] rounded-lg py-1 bg-[#181818]">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C49C48] to-[#B8860B] text-black font-semibold text-lg shadow-lg hover:from-[#E5C97B] hover:to-[#C49C48] transition-all duration-200 border border-[#C49C48]/80"
          >
            Inloggen
          </button>
        </form>
      </div>
    </div>
  );
} 