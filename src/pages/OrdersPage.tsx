import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

type OrderItem = {
  dealId: string;
  title: string;
  restaurantName: string;
  price: number;
  qty: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  total: number;
  status: "Placed" | "Preparing" | "Ready" | "Completed";
  paidAt?: string;
  createdAt: string;
};

const statusColors: Record<Order["status"], string> = {
  Placed: "bg-blue-100 text-blue-700",
  Preparing: "bg-amber-100 text-amber-700",
  Ready: "bg-emerald-100 text-emerald-700",
  Completed: "bg-slate-100 text-slate-600",
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Order[]>("/api/orders")
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-600">Loading orders...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (orders.length === 0) {
    return <p className="text-slate-500">No orders yet. <a href="/deals" className="text-indigo-600 hover:underline">Browse deals</a> to place your first order.</p>;
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Your Orders</h1>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order._id} className="rounded-lg border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                {order.status}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <ul className="space-y-1 text-sm text-slate-700">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>{item.title} × {item.qty}</span>
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t pt-2 text-sm font-semibold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
