import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

type DealType = "Lunch" | "Carryout" | "Delivery" | "Other";
type DiscountType = "percent" | "amount" | "bogo" | "other";

type OwnerDeal = {
  _id: string;
  title: string;
  description?: string;
  dealType?: DealType;
  discountType?: DiscountType;
  value?: number;
  status: "DRAFT" | "SUBMITTED" | "PUBLISHED" | "REJECTED";
  restaurantName: string;
  rejectionReason?: string;
  createdAt?: string;
};

type DealStatusFilter = "ALL" | OwnerDeal["status"];

const DEAL_TYPES: DealType[] = ["Lunch", "Carryout", "Delivery", "Other"];
const DISCOUNT_TYPES: DiscountType[] = ["percent", "amount", "bogo", "other"];

export function PortalPage() {
  const [items, setItems] = useState<OwnerDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState<DealStatusFilter>("ALL");

  // Create form state
  const [restaurantName, setRestaurantName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dealType, setDealType] = useState<DealType>("Lunch");
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [value, setValue] = useState(20);

  // Inline edit state — null means not editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    async function loadOwnerDeals() {
      try {
        const data = await apiGet<OwnerDeal[]>("/api/owner/deals");
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load owner deals");
      } finally {
        setLoading(false);
      }
    }
    loadOwnerDeals();
  }, []);

  async function createDraft(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        restaurantName,
        title,
        description,
        dealType,
        discountType,
        value: Number(value),
      };
      const created = await apiPost<OwnerDeal>("/api/owner/deals", payload);
      setItems((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
      setValue(20);
      setSuccess("Draft created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  function startEdit(deal: OwnerDeal) {
    setEditingId(deal._id);
    setEditTitle(deal.title);
    setEditDescription(deal.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setError("");
    setSuccess("");
    try {
      const updated = await apiPut<OwnerDeal>(`/api/owner/deals/${editingId}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setItems((prev) => prev.map((d) => (d._id === editingId ? { ...d, ...updated } : d)));
      setEditingId(null);
      setSuccess("Deal updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Edit failed");
    }
  }

  async function submitDeal(id: string) {
    setError("");
    setSuccess("");
    try {
      await apiPost(`/api/owner/deals/${id}/submit`);
      setItems((prev) =>
        prev.map((deal) =>
          deal._id === id ? { ...deal, status: "SUBMITTED", rejectionReason: "" } : deal
        )
      );
      setSuccess("Deal submitted for review.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    }
  }

  async function deleteDeal(id: string) {
    setError("");
    setSuccess("");
    try {
      await apiDelete(`/api/owner/deals/${id}`);
      setItems((prev) => prev.filter((deal) => deal._id !== id));
      setSuccess("Draft deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) return <p className="text-slate-600">Loading portal...</p>;

  const visibleItems =
    statusFilter === "ALL" ? items : items.filter((deal) => deal.status === statusFilter);

  return (
    <section>
      <h1 className="text-2xl font-semibold">Owner Portal</h1>

      {/* Create form */}
      <form onSubmit={createDraft} className="mt-4 space-y-2 rounded-lg border bg-white p-4">
        <h2 className="text-sm font-semibold">Create Draft Deal</h2>
        <input
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          placeholder="Restaurant name"
          className="w-full rounded border px-3 py-2 text-sm"
          required
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Deal title"
          className="w-full rounded border px-3 py-2 text-sm"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deal description"
          className="w-full rounded border px-3 py-2 text-sm"
          required
        />
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Deal type</label>
            <select
              value={dealType}
              onChange={(e) => setDealType(e.target.value as DealType)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              {DEAL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Discount type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              {DISCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="block text-xs font-medium text-slate-600 mb-1">Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full rounded border px-3 py-2 text-sm"
              min={1}
              required
            />
          </div>
        </div>
        <button className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Create Draft
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-700">{success}</p> : null}

      {/* Status filter */}
      <div className="mt-4 flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Filter:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DealStatusFilter)}
          className="rounded border px-2 py-1 text-xs"
        >
          <option value="ALL">All</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="PUBLISHED">Published</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-slate-600">No deals yet. Create your first draft above.</p>
      ) : null}

      {/* Deal list */}
      <ul className="mt-4 space-y-3">
        {visibleItems.map((deal) => (
          <li key={deal._id} className="rounded-lg border bg-white p-4">
            {editingId === deal._id ? (
              /* Inline edit form */
              <form onSubmit={saveEdit} className="space-y-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm"
                  required
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded border px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Display mode */
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{deal.title}</p>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                    deal.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                    deal.status === "REJECTED" ? "bg-rose-100 text-rose-700" :
                    deal.status === "SUBMITTED" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {deal.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{deal.restaurantName}</p>
                {deal.description ? (
                  <p className="mt-1 text-sm text-slate-700">{deal.description}</p>
                ) : null}
                {deal.createdAt ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Created: {new Date(deal.createdAt).toLocaleDateString()}
                  </p>
                ) : null}
                {deal.status === "REJECTED" && deal.rejectionReason ? (
                  <p className="mt-2 rounded bg-rose-50 px-2 py-1 text-xs text-rose-700">
                    Rejection reason: {deal.rejectionReason}
                  </p>
                ) : null}
                {deal.status === "DRAFT" || deal.status === "REJECTED" ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => startEdit(deal)}
                      className="rounded border px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    {deal.status === "DRAFT" ? (
                      <button
                        onClick={() => deleteDeal(deal._id)}
                        className="rounded border px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    ) : null}
                    <button
                      onClick={() => submitDeal(deal._id)}
                      className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                    >
                      Submit for Review
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
