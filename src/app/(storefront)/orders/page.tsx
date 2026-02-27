"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCustomer } from "@/hooks/use-customer";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
} from "@/lib/constants";

interface OrderData {
  id: number;
  orderNumber: string;
  status: string;
  fulfillmentType: string;
  subtotal: number;
  total: number;
  createdAt: string;
}

export default function OrdersPage() {
  const { customer, isLoggedIn, login } = useCustomer();
  const toast = useToast();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (customer) {
      fetchOrders(customer.id);
    }
  }, [customer]);

  const fetchOrders = async (customerId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?customer_id=${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders?.map((o: { order: OrderData }) => o.order) ?? []);
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      await login(email, firstName, lastName);
    } catch {
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <span className="text-5xl mb-4 block">📦</span>
          <h1 className="text-2xl font-bold text-white mb-2">
            View Your Orders
          </h1>
          <p className="text-gray-500 mb-8">
            Sign in to view your order history.
          </p>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <Input
              id="login-email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="login-first"
                label="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
              <Input
                id="login-last"
                label="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loggingIn}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">📦</span>
          <h3 className="text-lg font-semibold text-white mb-1">
            No orders yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Start shopping to see your orders here.
          </p>
          <Link href="/bikes">
            <Button>Browse Bikes</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = order.status as OrderStatus;
            return (
              <div
                key={order.id}
                className="bg-white/5 rounded-xl border border-white/10 p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono font-bold text-white">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ORDER_STATUS_COLORS[status] ?? "bg-white/10 text-gray-300"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[status] ?? order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Total: {formatPrice(order.total)}</span>
                    <span className="capitalize">
                      {order.fulfillmentType === "delivery"
                        ? "Delivery"
                        : "Pickup"}
                    </span>
                  </div>
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="text-sm font-medium text-brand-accent hover:underline"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
