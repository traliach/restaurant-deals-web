import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function CartPage() {
  const { items, addItem, removeItem, decrementItem, total, count } = useCart();

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
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-slate-500">{item.restaurantName}</p>
              <p className="text-sm text-slate-400">${item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Quantity controls */}
              <div className="flex items-center gap-1 rounded border">
                <button
                  onClick={() => decrementItem(item.dealId)}
                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-l"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                <button
                  onClick={() => addItem({ dealId: item.dealId, title: item.title, restaurantName: item.restaurantName, price: item.price })}
                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-r"
                >
                  +
                </button>
              </div>
              <span className="w-16 text-right font-semibold">
                ${(item.price * item.qty).toFixed(2)}
              </span>
              <button
                onClick={() => removeItem(item.dealId)}
                className="text-sm text-red-400 hover:text-red-600"
              >
                ✕
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
