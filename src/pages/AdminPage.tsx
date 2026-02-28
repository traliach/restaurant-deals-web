import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiGet, apiPost } from "../lib/api";

type BotLog = {
  _id: string;
  intent: string;
  action: string;
  createdAt: string;
  userId?: { email: string };
};

type SubmittedDeal = {
  _id: string;
  title: string;
  description?: string;
  restaurantName: string;
  dealType?: string;
  status: "SUBMITTED";
  createdAt?: string;
};

export function AdminPage() {
  const [tab, setTab] = useState<"queue" | "bot">("queue");
  const [items, setItems] = useState<SubmittedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [botLogs, setBotLogs] = useState<BotLog[]>([]);
  const [botLoading, setBotLoading] = useState(false);

  // Inline reject state — null means not rejecting
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    async function loadQueue() {
      try {
        const data = await apiGet<SubmittedDeal[]>("/api/admin/deals/submitted");
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin queue");
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  async function approveDeal(id: string) {
    setError("");
    setSuccess("");
    try {
      await apiPost(`/api/admin/deals/${id}/approve`);
      setItems((prev) => prev.filter((d) => d._id !== id));
      setSuccess("Deal approved and published.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    }
  }

  function startReject(id: string) {
    setRejectingId(id);
    setRejectReason("");
  }

  function cancelReject() {
    setRejectingId(null);
    setRejectReason("");
  }

  async function submitReject(event: FormEvent) {
    event.preventDefault();
    if (!rejectingId || !rejectReason.trim()) return;
    setError("");
    setSuccess("");
    try {
      await apiPost(`/api/admin/deals/${rejectingId}/reject`, { reason: rejectReason.trim() });
      setItems((prev) => prev.filter((d) => d._id !== rejectingId));
      setRejectingId(null);
      setRejectReason("");
      setSuccess("Deal rejected.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    }
  }

  function loadBotLogs() {
    setBotLoading(true);
    apiGet<BotLog[]>("/api/admin/bot-interactions")
      .then(setBotLogs)
      .catch(() => {})
      .finally(() => setBotLoading(false));
  }

  if (loading) return <p className="text-slate-600">Loading admin queue...</p>;

  return (
    <section>
      <h1 className="text-2xl font-semibold">Admin Panel</h1>

      {/* Tab switcher */}
      <div className="mt-4 mb-6 flex gap-2">
        <button
          onClick={() => setTab("queue")}
          className={`rounded px-4 py-1.5 text-sm font-medium ${tab === "queue" ? "bg-indigo-600 text-white" : "border text-slate-700 hover:bg-slate-100"}`}
        >
          Deal Queue {items.length > 0 && `(${items.length})`}
        </button>
        <button
          onClick={() => { setTab("bot"); if (botLogs.length === 0) loadBotLogs(); }}
          className={`rounded px-4 py-1.5 text-sm font-medium ${tab === "bot" ? "bg-indigo-600 text-white" : "border text-slate-700 hover:bg-slate-100"}`}
        >
          Bot Audit
        </button>
      </div>

      {tab === "bot" && (
        <div>
          {botLoading && <p className="text-slate-600">Loading logs...</p>}
          {!botLoading && botLogs.length === 0 && <p className="text-slate-500">No bot interactions yet.</p>}
          <ul className="space-y-3">
            {botLogs.map((log) => (
              <li key={log._id} className="rounded-lg border bg-white p-4 text-sm">
                <p className="text-xs text-slate-400 mb-1">
                  {log.userId?.email ?? "Unknown"} — {new Date(log.createdAt).toLocaleString()}
                </p>
                <p><span className="font-medium text-slate-700">Intent:</span> {log.intent}</p>
                <p className="mt-1 text-slate-600"><span className="font-medium">Response:</span> {log.action}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "queue" && (
      <div>
      <p className="mt-1 text-sm text-slate-600">
        {items.length} deal{items.length !== 1 ? "s" : ""} awaiting review
      </p>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-700">{success}</p> : null}
      <p className="mt-1 text-sm text-slate-600">
        {items.length} deal{items.length !== 1 ? "s" : ""} awaiting review
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-slate-600">No deals pending review. All caught up.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((deal) => (
            <li key={deal._id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{deal.title}</p>
                {deal.dealType ? (
                  <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {deal.dealType}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-slate-600">{deal.restaurantName}</p>
              {deal.description ? (
                <p className="mt-1 text-sm text-slate-700">{deal.description}</p>
              ) : null}
              {deal.createdAt ? (
                <p className="mt-1 text-xs text-slate-500">
                  Submitted: {new Date(deal.createdAt).toLocaleDateString()}
                </p>
              ) : null}

              {rejectingId === deal._id ? (
                /* Inline rejection form */
                <form onSubmit={submitReject} className="mt-3 space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full rounded border px-3 py-2 text-sm"
                    rows={2}
                    required
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-500"
                    >
                      Confirm Reject
                    </button>
                    <button
                      type="button"
                      onClick={cancelReject}
                      className="rounded border px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => approveDeal(deal._id)}
                    className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => startReject(deal._id)}
                    className="rounded bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-500"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      </div>
      )}
    </section>
  );
}
