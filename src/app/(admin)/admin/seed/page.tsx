"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface SeedAction {
  title: string;
  description: string;
  action: string;
  accent: string;
  accentBorder: string;
  buttonVariant: "default" | "accent" | "destructive";
  destructive?: boolean;
}

const actions: SeedAction[] = [
  {
    title: "Seed Products",
    description:
      "Populate the database with sample bikes, categories, and product data. This creates a realistic catalog for testing.",
    action: "seed_products",
    accent: "bg-emerald-50",
    accentBorder: "border-emerald-200",
    buttonVariant: "default",
  },
  {
    title: "Seed Orders",
    description:
      "Generate sample customers and orders with realistic data including various statuses, payment info, and fulfillment types.",
    action: "seed_orders",
    accent: "bg-blue-50",
    accentBorder: "border-blue-200",
    buttonVariant: "default",
  },
  {
    title: "Seed Everything",
    description:
      "Run all seed operations at once: products, customers, orders, and reviews. Perfect for a fresh setup.",
    action: "seed_all",
    accent: "bg-amber-50",
    accentBorder: "border-amber-200",
    buttonVariant: "accent",
  },
  {
    title: "Reset All Data",
    description:
      "Delete all data from the database. This action is irreversible and will remove all products, orders, customers, and reviews.",
    action: "reset",
    accent: "bg-red-50",
    accentBorder: "border-red-300",
    buttonVariant: "destructive",
    destructive: true,
  },
];

export default function AdminSeedPage() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const toast = useToast();

  const handleSeed = async (action: string) => {
    setLoadingAction(action);

    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Seed operation failed");
      }

      const parts: string[] = [];
      if (data.categories) parts.push(`${data.categories} categories`);
      if (data.products) parts.push(`${data.products} products`);
      if (data.customers) parts.push(`${data.customers} customers`);
      if (data.orders) parts.push(`${data.orders} orders`);
      if (data.reviews) parts.push(`${data.reviews} reviews`);

      const resultMessage =
        parts.length > 0
          ? `Created: ${parts.join(", ")}`
          : action === "reset"
          ? "All data has been reset"
          : "Operation completed";

      toast.success(resultMessage);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Seed operation failed"
      );
    } finally {
      setLoadingAction(null);
      setResetDialogOpen(false);
    }
  };

  const handleAction = (action: SeedAction) => {
    if (action.destructive) {
      setResetDialogOpen(true);
    } else {
      handleSeed(action.action);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Seed Data</h1>
        <p className="text-sm text-gray-500 mt-1">
          Populate your database with sample data for testing and development.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action) => (
          <Card
            key={action.action}
            className={`p-6 ${action.accent} border ${action.accentBorder}`}
          >
            <h2 className="text-lg font-semibold mb-2">{action.title}</h2>
            <p className="text-sm text-gray-600 mb-4">{action.description}</p>
            <Button
              variant={action.buttonVariant}
              onClick={() => handleAction(action)}
              loading={loadingAction === action.action}
              disabled={loadingAction !== null}
            >
              {loadingAction === action.action
                ? "Running..."
                : action.title}
            </Button>
          </Card>
        ))}
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset All Data</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete all data? This will permanently remove
          all products, orders, customers, and reviews from the database. This
          action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setResetDialogOpen(false)}
            disabled={loadingAction !== null}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleSeed("reset")}
            loading={loadingAction === "reset"}
          >
            Yes, Reset Everything
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
