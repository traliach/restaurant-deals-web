import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function CartPage() {
  const { items, removeItem, total, count } = useCart();

  if (count === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Your cart is empty.</p>
        <Link to="/deals" className="mt-4 inline-block text-indigo-600 hover:underline">
          Browse deals
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Your Cart</h1>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.dealId}
            className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-slate-500">{item.restaurantName}</p>
              <p className="text-sm text-slate-600">
                ${item.price.toFixed(2)} × {item.qty}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">
                ${(item.price * item.qty).toFixed(2)}
              </span>
              <button
                onClick={() => removeItem(item.dealId)}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-lg font-semibold">Total: ${total.toFixed(2)}</span>
        <Link
          to="/checkout"
          className="rounded bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Proceed to Checkout
        </Link>
      </div>
    </section>
  );
}
