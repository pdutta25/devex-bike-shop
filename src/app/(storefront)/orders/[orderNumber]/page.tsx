import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderByNumber } from "@/lib/queries/order-queries";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
} from "@/lib/constants";

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

const ORDER_STEPS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];
const PICKUP_STEPS: OrderStatus[] = [
  "pending",
  "processing",
  "ready_for_pickup",
  "delivered",
];

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderNumber } = await params;
  const orderData = await getOrderByNumber(orderNumber);

  if (!orderData) {
    notFound();
  }

  const { order, customerFirstName, customerLastName, customerEmail, items } =
    orderData;
  const status = order.status as OrderStatus;
  const isPickup = order.fulfillmentType === "pickup";
  const timelineSteps = isPickup ? PICKUP_STEPS : ORDER_STEPS;
  const currentStepIndex = timelineSteps.indexOf(status);
  const isCancelled = status === "cancelled";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link href="/orders" className="hover:text-white">
          Orders
        </Link>
        <span>/</span>
        <span className="text-white">{order.orderNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Order {order.orderNumber}
          </h1>
          <p className="text-gray-500 mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            ORDER_STATUS_COLORS[status] ?? "bg-white/10 text-gray-300"
          }`}
        >
          {ORDER_STATUS_LABELS[status] ?? order.status}
        </span>
      </div>

      {/* Order Timeline */}
      {!isCancelled && (
        <section className="bg-white/5 rounded-xl border border-white/10 p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-6">
            Order Progress
          </h2>
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-amber-500 transition-all"
              style={{
                width:
                  currentStepIndex >= 0
                    ? `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%`
                    : "0%",
              }}
            />

            {timelineSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div
                  key={step}
                  className="relative flex flex-col items-center z-10"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCurrent
                        ? "border-amber-500 bg-amber-500 text-white"
                        : isCompleted
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-white/20 bg-white/5 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4"
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
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium whitespace-nowrap ${
                      isCurrent ? "text-amber-600" : isCompleted ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isCancelled && (
        <section className="bg-red-500/10 rounded-xl border border-red-500/20 p-6 mb-8 text-center">
          <span className="text-3xl block mb-2">
            &#10060;
          </span>
          <p className="text-red-700 font-semibold">
            This order has been cancelled.
          </p>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items Table */}
        <div className="lg:col-span-2">
          <section className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <h2 className="text-lg font-bold text-white px-6 py-4 border-b border-white/10">
              Order Items
            </h2>
            <table className="w-full">
              <thead className="bg-white/5 text-sm text-gray-500">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Product</th>
                  <th className="text-left px-6 py-3 font-medium">
                    Size / Color
                  </th>
                  <th className="text-center px-6 py-3 font-medium">Qty</th>
                  <th className="text-right px-6 py-3 font-medium">Price</th>
                  <th className="text-right px-6 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-400">{item.productSku}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {[item.selectedSize, item.selectedColor]
                        .filter(Boolean)
                        .join(" / ") || "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-white">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-white">
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-white">
                      {formatPrice(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* Right Column: Order Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Summary */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              Payment Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>
                  {order.shippingAmount > 0
                    ? formatPrice(order.shippingAmount)
                    : "Free"}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tax</span>
                <span>{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
            {order.paymentLastFour && (
              <div className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
                <p>
                  Paid with card ending in{" "}
                  <span className="font-mono font-semibold">
                    {order.paymentLastFour}
                  </span>
                </p>
                <p className="mt-1 capitalize">
                  Payment status:{" "}
                  <Badge
                    variant={
                      order.paymentStatus === "paid" ? "success" : "warning"
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </p>
              </div>
            )}
          </section>

          {/* Customer Info */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              Customer
            </h2>
            <div className="text-sm text-gray-400 space-y-1">
              <p className="font-medium text-white">
                {customerFirstName} {customerLastName}
              </p>
              <p>{customerEmail}</p>
            </div>
          </section>

          {/* Shipping Info */}
          {order.fulfillmentType === "delivery" &&
            order.shippingAddressLine1 && (
              <section className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  Shipping Address
                </h2>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>{order.shippingAddressLine1}</p>
                  {order.shippingAddressLine2 && (
                    <p>{order.shippingAddressLine2}</p>
                  )}
                  <p>
                    {order.shippingCity}, {order.shippingState}{" "}
                    {order.shippingZip}
                  </p>
                </div>
              </section>
            )}

          {order.fulfillmentType === "pickup" && (
            <section className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Pickup Location
              </h2>
              <div className="text-sm text-gray-400 space-y-1">
                <p className="font-medium text-white">
                  Summit Street Bikes
                </p>
                <p>123 Summit Street</p>
                <p>San Francisco, CA 94103</p>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link href="/orders">
          <Button variant="secondary">
            &larr; Back to Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}
