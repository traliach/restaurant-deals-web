import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

type OwnerDeal = {
  _id: string;
  title: string;
  description?: string;
  status: "DRAFT" | "SUBMITTED" | "PUBLISHED" | "REJECTED";
  restaurantName: string;
  rejectionReason?: string;
};

type CreateDealInput = {
  restaurantName: string;
  title: string;
  description: string;
  dealType: "Lunch";
  discountType: "percent";
  value: number;
};

type DealStatusFilter = "ALL" | OwnerDeal["status"];

export function PortalPage() {
  const [items, setItems] = useState<OwnerDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState<DealStatusFilter>("ALL");
  const [restaurantName, setRestaurantName] = useState("Demo Grill");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState(20);

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

  async function submitDeal(id: string) {
    try {
      await apiPost(`/api/owner/deals/${id}/submit`);
      setItems((prev) =>
        prev.map((deal) =>
          deal._id === id ? { ...deal, status: "SUBMITTED", rejectionReason: "" } : deal
        )
      );
      setSuccess("Deal submitted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    }
  }

  async function createDraft(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload: CreateDealInput = {
        restaurantName,
        title,
        description,
        dealType: "Lunch",
        discountType: "percent",
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

  async function editDeal(id: string) {
    const current = items.find((deal) => deal._id === id);
    if (!current) return;

    const nextTitle = window.prompt("New title:", current.title);
    if (!nextTitle?.trim()) return;

    const nextDescription = window.prompt("New description:", current.description ?? "");
    if (!nextDescription?.trim()) return;

    try {
      const updated = await apiPut<OwnerDeal>(`/api/owner/deals/${id}`, {
        title: nextTitle.trim(),
        description: nextDescription.trim(),
      });
      setItems((prev) => prev.map((deal) => (deal._id === id ? { ...deal, ...updated } : deal)));
      setSuccess("Deal updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Edit failed");
    }
  }

  async function deleteDeal(id: string) {
    if (!window.confirm("Delete this draft?")) return;
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
      <form onSubmit={createDraft} className="mt-4 space-y-2 rounded border bg-white p-4">
        <h2 className="text-sm font-semibold">Create Draft Deal</h2>
        <input
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          placeholder="Restaurant name"
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Deal title"
          className="w-full rounded border px-3 py-2"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deal description"
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          placeholder="Percent value"
          className="w-full rounded border px-3 py-2"
          min={1}
          max={100}
          required
        />
        <button className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500">
          Create Draft
        </button>
      </form>

      {error ? <p className="mt-3 text-red-600">Error: {error}</p> : null}
      {success ? <p className="mt-3 text-emerald-700">{success}</p> : null}
      {items.length === 0 ? <p className="mt-3 text-slate-600">No owner deals yet.</p> : null}

      <div className="mt-3">
        <label className="text-xs text-slate-600">Filter status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DealStatusFilter)}
          className="ml-2 rounded border px-2 py-1 text-xs"
        >
          <option value="ALL">All</option>
          <option value="DRAFT">DRAFT</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      <ul className="mt-4 space-y-3">
        {visibleItems.map((deal) => (
          <li key={deal._id} className="rounded border bg-white p-4">
            <p className="font-semibold">{deal.title}</p>
            <p className="text-sm text-slate-600">{deal.restaurantName}</p>
            <p className="mt-1 text-xs text-slate-500">Status: {deal.status}</p>
            {deal.status === "REJECTED" && deal.rejectionReason ? (
              <p className="mt-2 text-xs text-rose-700">Reason: {deal.rejectionReason}</p>
            ) : null}
            {deal.status === "DRAFT" || deal.status === "REJECTED" ? (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => editDeal(deal._id)}
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
                  Submit
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
