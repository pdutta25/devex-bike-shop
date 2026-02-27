"use client";

import { useContext } from "react";
import { CustomerContext } from "@/components/providers/customer-provider";

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomer must be used within a CustomerProvider");
  return context;
}
