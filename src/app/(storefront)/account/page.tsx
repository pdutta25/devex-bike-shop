"use client";

import { useState } from "react";
import Link from "next/link";
import { useCustomer } from "@/hooks/use-customer";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountPage() {
  const { customer, isLoggedIn, login, logout } = useCustomer();
  const toast = useToast();

  // Login form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      await login(email, firstName, lastName);
      toast.success("Signed in successfully!");
    } catch {
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">👤</span>
            <h1 className="text-2xl font-bold text-white mb-2">
              Sign In to Your Account
            </h1>
            <p className="text-gray-500">
              Enter your details to access your account, view orders, and manage
              your wishlist.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="acct-email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="acct-first"
                label="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
              <Input
                id="acct-last"
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <section className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-white">
                  {customer?.firstName} {customer?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-white">{customer?.email}</p>
              </div>
              {customer?.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-white">{customer.phone}</p>
                </div>
              )}
              {customer?.addressLine1 && (
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-white">
                    {customer.addressLine1}
                    {customer.city && `, ${customer.city}`}
                    {customer.state && `, ${customer.state}`}
                    {customer.zipCode && ` ${customer.zipCode}`}
                  </p>
                </div>
              )}
            </div>
          </section>

          <Button variant="destructive" onClick={logout}>
            Sign Out
          </Button>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-1 space-y-4">
          <Link
            href="/orders"
            className="block bg-white/5 rounded-xl border border-white/10 p-6 hover:shadow-sm transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">📦</span>
              <div>
                <h3 className="font-semibold text-white group-hover:text-brand-accent transition-colors">
                  My Orders
                </h3>
                <p className="text-sm text-gray-500">
                  View your order history and track deliveries
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/wishlist"
            className="block bg-white/5 rounded-xl border border-white/10 p-6 hover:shadow-sm transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">&#10084;&#65039;</span>
              <div>
                <h3 className="font-semibold text-white group-hover:text-brand-accent transition-colors">
                  My Wishlist
                </h3>
                <p className="text-sm text-gray-500">
                  View your saved bikes and favorites
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/cart"
            className="block bg-white/5 rounded-xl border border-white/10 p-6 hover:shadow-sm transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">🛒</span>
              <div>
                <h3 className="font-semibold text-white group-hover:text-brand-accent transition-colors">
                  Shopping Cart
                </h3>
                <p className="text-sm text-gray-500">
                  Review items in your cart
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
