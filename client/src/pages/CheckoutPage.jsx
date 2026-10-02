import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  notes: "",
};

export default function CheckoutPage() {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    shippingFee: 0,
    total: 0,
    itemCount: 0,
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const [cartResult, addressResult] = await Promise.allSettled([
          api.get("/cart"),
          api.get("/addresses"),
        ]);

        if (cartResult.status === "fulfilled") {
          const payload = cartResult.value.data?.data?.cart;
          if (payload) setCart(payload);
        }

        if (addressResult.status === "fulfilled") {
          const addresses = addressResult.value.data?.data?.addresses || [];
          setSavedAddresses(addresses);
          const defaultAddress = addresses.find((address) => address.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setForm((current) => ({
              ...current,
              fullName: defaultAddress.fullName,
              email: defaultAddress.email || "",
              phone: defaultAddress.phone || "",
              line1: defaultAddress.line1,
              line2: defaultAddress.line2 || "",
              city: defaultAddress.city,
              state: defaultAddress.state,
              postalCode: defaultAddress.postalCode,
              country: defaultAddress.country,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const canCheckout = useMemo(() => cart.items.length > 0, [cart.items]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddressSelect = (event) => {
    const addressId = event.target.value;
    setSelectedAddressId(addressId);

    const address = savedAddresses.find((item) => item.id === addressId);
    if (!address) {
      setForm(initialForm);
      return;
    }

    setForm((current) => ({
      ...current,
      fullName: address.fullName,
      email: address.email || "",
      phone: address.phone || "",
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    }));
  };

  const startPayment = async (orderId) => {
    setPaymentError("");

    try {
      const response = await api.post(`/orders/${orderId}/checkout-session`);
      const checkoutUrl = response.data?.data?.url;

      if (!checkoutUrl) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      window.location.assign(checkoutUrl);
    } catch (error) {
      setPaymentError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment. You can retry from your orders.",
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canCheckout) {
      return;
    }

    setSubmitting(true);
    setCheckoutError("");
    let createdOrder = null;

    try {
      const payload = {
        notes: form.notes,
        ...(selectedAddressId
          ? { shippingAddressId: selectedAddressId }
          : {
              shippingAddress: {
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                line1: form.line1,
                line2: form.line2,
                city: form.city,
                state: form.state,
                postalCode: form.postalCode,
                country: form.country,
              },
            }),
      };

      const response = await api.post("/orders", payload);
      const order = response.data?.data?.order;
      createdOrder = order;
      setOrderPlaced(order);
      setCart({
        items: [],
        subtotal: 0,
        shippingFee: 0,
        total: 0,
        itemCount: 0,
      });

      await startPayment(order.id);
    } catch (error) {
      if (createdOrder) {
        setPaymentError(
          error.response?.data?.message || "Unable to start payment.",
        );
      } else {
        setCheckoutError(
          error.response?.data?.message || "Unable to create your order.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
        Loading checkout...
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">
          Order created. Payment required.
        </h1>
        <p className="mt-3 text-slate-700">
          Order #{orderPlaced.id.slice(-8)} will be confirmed after Stripe
          verifies your payment.
        </p>
        {paymentError && (
          <p
            role="alert"
            className="mx-auto mt-5 max-w-xl rounded-md border border-red-200 bg-white px-4 py-3 text-sm text-red-800"
          >
            {paymentError}
          </p>
        )}
        <div className="mt-5 rounded-2xl bg-white p-4 text-left text-sm text-slate-700 shadow-sm">
          <p>
            <strong>Total:</strong> ${Number(orderPlaced.total || 0).toFixed(2)}
          </p>
          <p>
            <strong>Status:</strong> {orderPlaced.status}
          </p>
          <p>
            <strong>Payment:</strong> {orderPlaced.paymentStatus}
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-4">
          {orderPlaced.paymentStatus !== "PAID" && (
            <button
              type="button"
              onClick={() => startPayment(orderPlaced.id)}
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Opening checkout..." : "Retry payment"}
            </button>
          )}
          <Link
            to="/orders"
            className="rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white"
          >
            View orders
          </Link>
          <Link
            to="/products"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!canCheckout) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Your cart is empty
        </h1>
        <Link
          to="/products"
          className="mt-5 inline-block rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

        {checkoutError && (
          <p
            role="alert"
            className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {checkoutError}
          </p>
        )}

        <label className="mt-6 grid gap-2 text-sm font-medium text-slate-700">
          Shipping address
          <select
            value={selectedAddressId}
            onChange={handleAddressSelect}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
          >
            <option value="">Enter a new address</option>
            {savedAddresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.fullName} · {address.line1}, {address.city}
                {address.isDefault ? " (Default)" : ""}
              </option>
            ))}
          </select>
          <Link
            to="/account"
            className="w-fit text-xs font-semibold text-orange-700 hover:text-orange-900"
          >
            Manage saved addresses
          </Link>
        </label>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>Full name</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              disabled={Boolean(selectedAddressId)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={Boolean(selectedAddressId)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Phone</span>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={Boolean(selectedAddressId)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>Address line 1</span>
            <input
              name="line1"
              value={form.line1}
              onChange={handleChange}
              required
              disabled={Boolean(selectedAddressId)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>Address line 2</span>
            <input
              name="line2"
              value={form.line2}
              onChange={handleChange}
              disabled={Boolean(selectedAddressId)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>City</span>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              disabled={Boolean(selectedAddressId)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>State</span>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              required
              disabled={Boolean(selectedAddressId)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Postal code</span>
            <input
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              required
              disabled={Boolean(selectedAddressId)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Country</span>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              required
              disabled={Boolean(selectedAddressId)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>Order notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          {submitting ? "Preparing secure checkout..." : "Continue to payment"}
        </button>
      </form>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Order summary</h2>
        <div className="mt-5 space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 text-sm text-slate-700"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {item.product.name}
                </p>
                <p>Qty: {item.quantity}</p>
              </div>
              <span>
                $
                {(
                  Number(item.product.discountPrice || item.product.price) *
                  item.quantity
                ).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${Number(cart.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${Number(cart.shippingFee || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>${Number(cart.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
