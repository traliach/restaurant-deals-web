import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

type BotLog = {
  _id: string;
  intent: string;
  action: string;
  result?: string;
  createdAt: string;
  userId?: { email: string; role: string };
};

export function AdminBotPage() {
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<BotLog[]>("/api/admin/bot-interactions")
      .then(setLogs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load bot logs"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-600">Loading bot audit logs...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800">Bot Audit</h2>
      <p className="mt-1 text-sm text-slate-500">{logs.length} interactions logged</p>

      {logs.length === 0 ? (
        <p className="mt-6 text-slate-500">No bot interactions yet.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Intent</th>
                <th className="px-4 py-3 text-left font-semibold">Response</th>
                <th className="px-4 py-3 text-left font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 align-top">
                  <td className="px-4 py-3 text-slate-600">
                    {log.userId?.email ?? "Unknown"}
                    {log.userId?.role && (
                      <span className="ml-1 text-xs text-slate-400">({log.userId.role})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs">{log.intent}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs text-xs">
                    {log.result ?? log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
