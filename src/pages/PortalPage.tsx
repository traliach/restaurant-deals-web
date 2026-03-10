import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";
import { PageHeader } from "../components/ui/PageHeader";
import { SurfaceCard } from "../components/ui/SurfaceCard";

type DealType = "Lunch" | "Carryout" | "Delivery" | "Other";
type DiscountType = "percent" | "amount" | "bogo" | "other";
type CuisineType = "French" | "Italian" | "Spanish" | "American" | "Asian" | "Mexican" | "Mediterranean" | "Other" | "";

const CUISINE_TYPES: CuisineType[] = ["French", "Italian", "Spanish", "American", "Asian", "Mexican", "Mediterranean", "Other"];
const DIETARY_OPTIONS = ["Vegan", "Vegetarian", "Gluten-Free", "Halal", "Keto", "Dairy-Free"];

type OrderStatus = "Placed" | "Preparing" | "Ready" | "Completed";

type OwnerOrder = {
  _id: string;
  userId: string;
  items: { title: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

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

const inputClass =
  "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

const selectClass =
  "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

const textareaClass =
  "min-h-32 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export function PortalPage() {
  const location = useLocation();
  const prefill = (location.state as { prefill?: { restaurantName?: string } } | null)?.prefill;

  const [tab, setTab] = useState<"deals" | "orders">("deals");
  const [items, setItems] = useState<OwnerDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState<DealStatusFilter>("ALL");

  const [orders, setOrders] = useState<OwnerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Create form state — pre-fill from Explore page if navigated with state.
  const [restaurantName, setRestaurantName] = useState(prefill?.restaurantName ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dealType, setDealType] = useState<DealType>("Lunch");
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [value, setValue] = useState(20);
  const [price, setPrice] = useState<number | "">("");
  const [cuisineType, setCuisineType] = useState<CuisineType>("");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [endAt, setEndAt] = useState("");

  function toggleDietaryTag(tag: string) {
    setDietaryTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  // Inline edit state — null means not editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDealType, setEditDealType] = useState<DealType>("Lunch");
  const [editDiscountType, setEditDiscountType] = useState<DiscountType>("percent");
  const [editValue, setEditValue] = useState(20);

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

  useEffect(() => {
    loadOrders();
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
        price: price !== "" ? Number(price) : undefined,
        cuisineType: cuisineType || undefined,
        dietaryTags,
        endAt: endAt || undefined,
      };
      const created = await apiPost<OwnerDeal>("/api/owner/deals", payload);
      setItems((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
      setValue(20);
      setPrice("");
      setCuisineType("");
      setDietaryTags([]);
      setEndAt("");
      setSuccess("Draft created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  function startEdit(deal: OwnerDeal) {
    setEditingId(deal._id);
    setEditTitle(deal.title);
    setEditDescription(deal.description ?? "");
    setEditDealType(deal.dealType ?? "Lunch");
    setEditDiscountType(deal.discountType ?? "percent");
    setEditValue(deal.value ?? 20);
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
        dealType: editDealType,
        discountType: editDiscountType,
        value: Number(editValue),
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
    if (!window.confirm("Delete this deal? This cannot be undone.")) return;
    setError("");
    setSuccess("");
    try {
      await apiDelete(`/api/owner/deals/${id}`);
      setItems((prev) => prev.filter((deal) => deal._id !== id));
      setSuccess("Deal deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function loadOrders() {
    setOrdersLoading(true);
    apiGet<OwnerOrder[]>("/api/owner/orders")
      .then(setOrders)
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    try {
      await apiPut(`/api/owner/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed");
    }
  }

  if (loading) return <p className="text-slate-600">Loading portal...</p>;

  const visibleItems =
    statusFilter === "ALL" ? items : items.filter((deal) => deal.status === statusFilter);

  const publishedCount = items.filter((deal) => deal.status === "PUBLISHED").length;
  const draftCount = items.filter((deal) => deal.status === "DRAFT").length;
  const submittedCount = items.filter((deal) => deal.status === "SUBMITTED").length;
  const orderCount = orders.length;

  const ORDER_STATUSES: OrderStatus[] = ["Placed", "Preparing", "Ready", "Completed"];
  const statusColors: Record<OrderStatus, string> = {
    Placed: "bg-blue-100 text-blue-700",
    Preparing: "bg-amber-100 text-amber-700",
    Ready: "bg-emerald-100 text-emerald-700",
    Completed: "bg-slate-100 text-slate-500",
  };

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Owner workspace"
        title="Owner Portal"
        description="Create, manage, and track your restaurant promotions from one dashboard."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SurfaceCard className="p-5">
          <p className="text-sm text-slate-500">Published deals</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{publishedCount}</p>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <p className="text-sm text-slate-500">Draft deals</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{draftCount}</p>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <p className="text-sm text-slate-500">Incoming orders</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{orderCount}</p>
        </SurfaceCard>
      </div>

      <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          onClick={() => setTab("deals")}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            tab === "deals"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          My Deals
        </button>
        <button
          onClick={() => { setTab("orders"); loadOrders(); }}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            tab === "orders"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Incoming Orders
        </button>
      </div>

      {error ? (
        <SurfaceCard className="p-4">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </SurfaceCard>
      ) : null}
      {success ? (
        <SurfaceCard className="p-4">
          <p className="text-sm font-medium text-emerald-700">{success}</p>
        </SurfaceCard>
      ) : null}

      {tab === "orders" ? (
        <div className="space-y-5">
          {ordersLoading ? (
            <SurfaceCard className="p-8 text-center">
              <p className="text-slate-600">Loading orders...</p>
            </SurfaceCard>
          ) : orders.length === 0 ? (
            <SurfaceCard className="p-8 text-center">
              <h2 className="text-xl font-semibold text-slate-900">No incoming orders yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Once customers place orders for your published deals, they will appear here.
              </p>
            </SurfaceCard>
          ) : (
            <div className="grid gap-5">
              {orders.map((order) => (
                <SurfaceCard key={order._id} className="p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Order #{order._id.slice(-6)}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>

                  <ul className="space-y-2 text-sm text-slate-700">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between gap-4">
                        <span>{item.title} × {item.qty}</span>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      Total: ${order.total.toFixed(2)}
                    </span>
                    {(() => {
                      const nextStatus = ORDER_STATUSES[ORDER_STATUSES.indexOf(order.status) + 1];
                      if (!nextStatus) return null;
                      return (
                        <button
                          onClick={() => updateOrderStatus(order._id, nextStatus)}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                        >
                          Mark as {nextStatus}
                        </button>
                      );
                    })()}
                  </div>
                </SurfaceCard>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <SurfaceCard className="p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Create Draft Deal</h2>
              <p className="mt-2 text-sm text-slate-600">
                Build a polished offer with structured pricing, cuisine tags, and expiration.
              </p>
            </div>

            <form onSubmit={createDraft}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Restaurant name
                  </label>
                  <input
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Restaurant name"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Deal title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Deal title"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deal description"
                  className={textareaClass}
                  required
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Deal type
                  </label>
                  <select
                    value={dealType}
                    onChange={(e) => setDealType(e.target.value as DealType)}
                    className={selectClass}
                  >
                    {DEAL_TYPES.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Discount type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className={selectClass}
                  >
                    {DISCOUNT_TYPES.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Discount value
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className={inputClass}
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0.00"
                    className={inputClass}
                    min={0}
                    step={0.01}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cuisine type
                  </label>
                  <select
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value as CuisineType)}
                    className={selectClass}
                  >
                    <option value="">None</option>
                    {CUISINE_TYPES.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Expiry date
                  </label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submission status
                  </label>
                  <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                    New deals are created as drafts first.
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-slate-700">Dietary tags</p>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDietaryTag(tag)}
                      className={
                        dietaryTags.includes(tag)
                          ? "rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
                          : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                      }
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600">
                  Create Draft
                </button>
              </div>
            </form>
          </SurfaceCard>

          <SurfaceCard className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Deal list
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {visibleItems.length} deal{visibleItems.length !== 1 ? "s" : ""} shown. {submittedCount} waiting for review.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-600">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DealStatusFilter)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="ALL">All</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </SurfaceCard>

          {visibleItems.length === 0 ? (
            <SurfaceCard className="p-8 text-center">
              <h2 className="text-xl font-semibold text-slate-900">No deals yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Create your first draft above to start building your restaurant offers.
              </p>
            </SurfaceCard>
          ) : (
            <div className="grid gap-5">
              {visibleItems.map((deal) => (
                <SurfaceCard key={deal._id} className="p-5">
                  {editingId === deal._id ? (
                    <form onSubmit={saveEdit} className="space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Title
                        </label>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Description
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className={textareaClass}
                          required
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Deal Type
                          </label>
                          <select
                            value={editDealType}
                            onChange={(e) => setEditDealType(e.target.value as DealType)}
                            className={selectClass}
                          >
                            {DEAL_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Discount Type
                          </label>
                          <select
                            value={editDiscountType}
                            onChange={(e) => setEditDiscountType(e.target.value as DiscountType)}
                            className={selectClass}
                          >
                            {DISCOUNT_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Value
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={editValue}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            className={inputClass}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">{deal.title}</h3>
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              deal.status === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700"
                                : deal.status === "DRAFT"
                                  ? "bg-amber-50 text-amber-700"
                                  : deal.status === "REJECTED"
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {deal.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">{deal.restaurantName}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{deal.description}</p>
                        {deal.createdAt ? (
                          <p className="mt-3 text-xs text-slate-400">
                            Created: {new Date(deal.createdAt).toLocaleDateString()}
                          </p>
                        ) : null}
                        {deal.status === "REJECTED" && deal.rejectionReason ? (
                          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            Rejection reason: {deal.rejectionReason}
                          </p>
                        ) : null}
                      </div>

                      {(deal.status === "DRAFT" || deal.status === "REJECTED") ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => startEdit(deal)}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteDeal(deal._id)}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => submitDeal(deal._id)}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                          >
                            Submit for Review
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </SurfaceCard>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
