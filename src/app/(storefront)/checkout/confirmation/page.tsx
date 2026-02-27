import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ConfirmationPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;
  const orderNumber = params.order ?? "N/A";

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Checkmark */}
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {/* Order Number */}
        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <p className="text-sm text-gray-500 mb-1">Order Number</p>
          <p className="text-2xl font-bold text-white font-mono">
            {orderNumber}
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          We&apos;ll send a confirmation email with your order details and
          tracking information.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/bikes">
            <Button variant="secondary" size="lg">
              Continue Shopping
            </Button>
          </Link>
          <Link href={`/orders/${orderNumber}`}>
            <Button size="lg">View Order</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
