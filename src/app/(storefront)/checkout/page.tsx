"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useCustomer } from "@/hooks/use-customer";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TAX_RATE, SHIPPING_COST } from "@/lib/constants";

type FulfillmentType = "delivery" | "pickup";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, loading: cartLoading, clearCart } = useCart();
  const { customer, login } = useCustomer();
  const toast = useToast();

  const [fulfillment, setFulfillment] = useState<FulfillmentType>("delivery");
  const [submitting, setSubmitting] = useState(false);

  // Customer info
  const [email, setEmail] = useState(customer?.email ?? "");
  const [firstName, setFirstName] = useState(customer?.firstName ?? "");
  const [lastName, setLastName] = useState(customer?.lastName ?? "");

  // Shipping address
  const [address, setAddress] = useState(customer?.addressLine1 ?? "");
  const [city, setCity] = useState(customer?.city ?? "");
  const [state, setState] = useState(customer?.state ?? "");
  const [zip, setZip] = useState(customer?.zipCode ?? "");

  // Payment
  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [cardholderName, setCardholderName] = useState("");

  if (cartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl mb-4 block">🛒</span>
        <h1 className="text-2xl font-bold text-white mb-2">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-6">
          Add some bikes to your cart before checking out.
        </p>
        <Link href="/bikes">
          <Button size="lg">Browse Bikes</Button>
        </Link>
      </div>
    );
  }

  const shippingCost = fulfillment === "delivery" ? SHIPPING_COST : 0;
  const estimatedTax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + estimatedTax + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Ensure customer exists
      if (!customer) {
        await login(email, firstName, lastName);
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          fulfillmentType: fulfillment,
          shippingAddress:
            fulfillment === "delivery"
              ? {
                  addressLine1: address,
                  city,
                  state,
                  zip,
                }
              : null,
          payment: {
            cardNumber,
            expiry,
            cvv,
            cardholderName,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Checkout failed");
      }

      const data = await res.json();
      clearCart();
      router.push(`/checkout/confirmation?order=${data.orderNumber}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form Sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Customer Information
              </h2>
              <div className="space-y-4">
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="firstName"
                    label="First Name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                  <Input
                    id="lastName"
                    label="Last Name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </section>

            {/* Fulfillment Type */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Fulfillment Method
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFulfillment("delivery")}
                  className={`p-4 rounded-xl border-2 text-center transition-colors ${
                    fulfillment === "delivery"
                      ? "border-brand-accent bg-white/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-2xl block mb-1">🚚</span>
                  <span className="font-semibold text-sm">Delivery</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPrice(SHIPPING_COST)} flat rate
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillment("pickup")}
                  className={`p-4 rounded-xl border-2 text-center transition-colors ${
                    fulfillment === "pickup"
                      ? "border-brand-accent bg-white/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-2xl block mb-1">🏪</span>
                  <span className="font-semibold text-sm">Pickup</span>
                  <p className="text-xs text-gray-500 mt-1">Free</p>
                </button>
              </div>
            </section>

            {/* Shipping Address (conditional) */}
            {fulfillment === "delivery" && (
              <section className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <Input
                    id="address"
                    label="Address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                  />
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-3">
                      <Input
                        id="city"
                        label="City"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="San Francisco"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        id="state"
                        label="State"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="CA"
                        maxLength={2}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        id="zip"
                        label="ZIP Code"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="94103"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Payment Information */}
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Payment Information
              </h2>
              <div className="space-y-4">
                <Input
                  id="cardNumber"
                  label="Card Number"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    id="expiry"
                    label="Expiry"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                  />
                  <Input
                    id="cvv"
                    label="CVV"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                  />
                  <Input
                    id="cardholderName"
                    label="Cardholder Name"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-white ml-2">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {fulfillment === "delivery" && (
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Tax (8.5%)</span>
                  <span>{formatPrice(estimatedTax)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-6"
                loading={submitting}
                disabled={submitting}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
