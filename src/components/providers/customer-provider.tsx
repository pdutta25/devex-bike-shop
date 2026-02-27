"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";

interface CustomerData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

interface CustomerContextType {
  customer: CustomerData | null;
  isLoggedIn: boolean;
  login: (email: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
}

export const CustomerContext = createContext<CustomerContextType | null>(null);

function getCustomerIdCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/customer_id=([^;]+)/);
  return match ? match[1] : null;
}

function setCustomerIdCookie(id: number) {
  document.cookie = `customer_id=${id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function clearCustomerIdCookie() {
  document.cookie = "customer_id=; path=/; max-age=0";
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const isLoggedIn = customer !== null;

  const fetchCustomer = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      }
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    const id = getCustomerIdCookie();
    if (id) fetchCustomer(id);
  }, [fetchCustomer]);

  const login = useCallback(async (email: string, firstName: string, lastName: string) => {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName }),
    });
    if (res.ok) {
      const data = await res.json();
      setCustomer(data);
      setCustomerIdCookie(data.id);
    } else {
      throw new Error("Failed to login");
    }
  }, []);

  const logout = useCallback(() => {
    setCustomer(null);
    clearCustomerIdCookie();
  }, []);

  return (
    <CustomerContext.Provider value={{ customer, isLoggedIn, login, logout }}>
      {children}
    </CustomerContext.Provider>
  );
}
