import { useEffect, useRef, useState } from "react";
import { apiPost } from "../lib/api";

export type AdminDeal = {
  _id: string;
  title: string;
  description: string;
  restaurantName: string;
  restaurantCity?: string;
  restaurantAddress?: string;
  dealType?: string;
  discountType?: string;
  value?: number;
  price?: number;
  imageUrl?: string;
  cuisineType?: string;
  dietaryTags?: string[];
  yelpRating?: number;
  endAt?: string;
  status: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  createdByUserId?: string;
};

type Props = {
  deal: AdminDeal | null;
  onClose: () => void;
  onAction: (id: string, newStatus: string) => void;
};

function formatDiscount(type?: string, value?: number) {
  if (type === "percent" && value != null) return `${value}% off`;
  if (type === "amount" && value != null) return `$${value} off`;
  if (type === "bogo") return "BOGO";
  return type ?? null;
}

export function AdminDealDrawer({ deal, onClose, onAction }: Props) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRejectReason("");
    setShowRejectForm(false);
    setMsg("");
  }, [deal?._id]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!deal) return null;

  const discount = formatDiscount(deal.discountType, deal.value);

  async function approve() {
    if (!deal) return;
    setWorking(true); setMsg("");
    try {
      await apiPost(`/api/admin/deals/${deal._id}/approve`);
      onAction(deal._id, "PUBLISHED");
      setMsg("Approved.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setWorking(false);
    }
  }

  async function reject() {
    if (!deal || !rejectReason.trim()) return;
    setWorking(true); setMsg("");
    try {
      await apiPost(`/api/admin/deals/${deal._id}/reject`, { reason: rejectReason.trim() });
      onAction(deal._id, "REJECTED");
      setMsg("Rejected.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Reject failed");
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-semibold text-slate-800">Deal Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="flex-1 p-5 space-y-4">
          {deal.imageUrl && (
            <img src={deal.imageUrl} alt={deal.title} className="h-48 w-full rounded-lg object-cover" />
          )}

          {/* Title + status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900">{deal.title}</h3>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              deal.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
              deal.status === "SUBMITTED" ? "bg-amber-100 text-amber-700" :
              deal.status === "REJECTED" ? "bg-red-100 text-red-700" :
              "bg-slate-100 text-slate-600"
            }`}>
              {deal.status}
            </span>
          </div>

          {/* Meta */}
          <div className="rounded-lg bg-slate-50 p-3 text-sm space-y-1">
            <div className="flex gap-2">
              <span className="w-32 text-slate-500">Restaurant</span>
              <span className="font-medium">{deal.restaurantName}</span>
            </div>
            {deal.restaurantCity && (
              <div className="flex gap-2">
                <span className="w-32 text-slate-500">City</span>
                <span>{deal.restaurantCity}</span>
              </div>
            )}
            {deal.cuisineType && (
              <div className="flex gap-2">
                <span className="w-32 text-slate-500">Cuisine</span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                  {deal.cuisineType}
                </span>
              </div>
            )}
            {deal.dealType && (
              <div className="flex gap-2">
                <span className="w-32 text-slate-500">Deal type</span>
                <span>{deal.dealType}</span>
              </div>
            )}
            {discount && (
              <div className="flex gap-2">
                <span className="w-32 text-slate-500">Discount</span>
                <span className="font-semibold text-emerald-700">{discount}</span>
              </div>
            )}
            {deal.price != null && (
              <div className="flex gap-2">
                <span className="w-32 text-slate-500">Price</span>
                <span className="font-bold">${deal.price.toFixed(2)}</span>
              </div>
            )}
            {deal.yelpRating != null && (
              <div className="flex gap-2">
                <span className="w-32 text-slate-500">Yelp rating</span>
                <span className="text-amber-600">★ {deal.yelpRating.toFixed(1)}</span>
              </div>
            )}
            {deal.endAt && (
              <div className="flex gap-2">
                <span className="w-32 text-slate-500">Expires</span>
                <span>{new Date(deal.endAt).toLocaleDateString()}</span>
              </div>
            )}
            {deal.createdAt && (
              <div className="flex gap-2">
                <span className="w-32 text-slate-500">Submitted</span>
                <span>{new Date(deal.createdAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Dietary tags */}
          {deal.dietaryTags && deal.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {deal.dietaryTags.map((tag) => (
                <span key={tag} className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{deal.description}</p>
          </div>

          {deal.status === "REJECTED" && deal.rejectionReason && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <strong>Rejection reason:</strong> {deal.rejectionReason}
            </div>
          )}

          {msg && (
            <p className={`text-sm font-medium ${msg.includes("failed") || msg.includes("Failed") ? "text-red-600" : "text-emerald-600"}`}>
              {msg}
            </p>
          )}

          {/* Actions — only for SUBMITTED */}
          {deal.status === "SUBMITTED" && (
            <div className="space-y-3 pt-2">
              <button
                onClick={approve}
                disabled={working}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                Approve
              </button>
              {!showRejectForm ? (
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="w-full rounded-lg border border-red-300 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Reject
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Rejection reason (required)"
                    className="w-full rounded border px-3 py-2 text-sm"
                    rows={3}
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={reject}
                      disabled={working || !rejectReason.trim()}
                      className="flex-1 rounded bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="rounded border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
