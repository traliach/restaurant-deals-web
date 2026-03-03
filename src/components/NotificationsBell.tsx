import { useEffect, useRef, useState } from "react";
import { apiGet, apiPatch } from "../lib/api";

type Notification = {
  _id: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
};

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Load on mount.
  useEffect(() => {
    apiGet<Notification[]>("/api/notifications")
      .then(setNotifications)
      .catch(() => {});
  }, []);

  // Close dropdown on outside click.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function markRead(id: string) {
    try {
      await apiPatch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Silent fail — non-critical.
    }
  }

  async function markAllRead() {
    try {
      await apiPatch("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }

  function typeLabel(type: string): string {
    switch (type) {
      case "deal_submitted": return "New deal to review";
      case "deal_approved": return "Deal approved";
      case "deal_rejected": return "Deal rejected";
      case "order_status": return "Order update";
      default: return type;
    }
  }

  function typeBadgeColor(type: string): string {
    switch (type) {
      case "deal_submitted": return "bg-amber-100 text-amber-700";
      case "deal_approved": return "bg-emerald-100 text-emerald-700";
      case "deal_rejected": return "bg-red-100 text-red-700";
      case "order_status": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-600";
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded p-1 text-slate-600 hover:bg-slate-100"
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              No notifications yet.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`border-b px-4 py-3 text-sm ${n.read ? "text-slate-400" : "font-medium text-slate-800"}`}
                >
                  <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeColor(n.type)}`}>
                    {typeLabel(n.type)}
                  </span>
                  <p>{n.message}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                    {!n.read && (
                      <button
                        onClick={() => markRead(n._id)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
