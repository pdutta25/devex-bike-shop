"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";

interface StatusUpdaterProps {
  orderId: number;
  currentStatus: string;
}

export function StatusUpdater({ orderId, currentStatus }: StatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleUpdate = async () => {
    if (status === currentStatus) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Order status updated");
      router.refresh();
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-end gap-3">
      <Select
        id="status"
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-64"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      <Button
        onClick={handleUpdate}
        loading={loading}
        disabled={status === currentStatus}
      >
        Update Status
      </Button>
    </div>
  );
}
