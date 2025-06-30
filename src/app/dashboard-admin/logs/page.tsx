"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";

interface LogEntry {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  user_email?: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      let query = supabase
        .from("platform_logs")
        .select("*, users: user_id (email)")
        .order("created_at", { ascending: false });
      if (selectedUser) {
        query = query.eq("user_id", selectedUser);
      }
      const { data, error } = await query;
      if (!error && data) {
        setLogs(
          data.map((log: any) => ({
            ...log,
            user_email: log.users?.email || "Onbekend",
          }))
        );
      }
      setLoading(false);
    };
    fetchLogs();
  }, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email")
        .order("email");
      if (!error && data) setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Platform Logs</h1>
      <div className="mb-4 flex gap-4 items-center">
        <label htmlFor="userFilter" className="font-medium">Filter op gebruiker:</label>
        <select
          id="userFilter"
          className="border rounded px-2 py-1"
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
        >
          <option value="">Alle gebruikers</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.email}</option>
          ))}
        </select>
      </div>
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#232D1A] text-[#B6C948]">
              <th className="px-4 py-2 text-left">Gebruiker</th>
              <th className="px-4 py-2 text-left">Actie</th>
              <th className="px-4 py-2 text-left">Details</th>
              <th className="px-4 py-2 text-left">Datum</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8">Laden...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8">Geen logs gevonden</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-b border-[#232D1A]">
                  <td className="px-4 py-2">{log.user_email}</td>
                  <td className="px-4 py-2">{log.action}</td>
                  <td className="px-4 py-2 whitespace-pre-wrap max-w-xs">
                    <pre className="text-xs bg-[#181F17] rounded p-2 overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre>
                  </td>
                  <td className="px-4 py-2">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
} 