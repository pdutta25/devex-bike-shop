import { getOrderById } from "@/lib/queries/order-queries";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
} from "@/lib/constants";
import { StatusUpdater } from "./status-updater";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orderData = await getOrderById(Number(id));

  if (!orderData) {
    notFound();
  }

  const { order, customerFirstName, customerLastName, customerEmail, customerPhone, items } = orderData;
  const status = order.status as OrderStatus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block"
          >
            &larr; Back to orders
          </Link>
          <h1 className="text-2xl font-semibold">
            Order {order.orderNumber}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={ORDER_STATUS_COLORS[status]}>
            {ORDER_STATUS_LABELS[status]}
          </Badge>
          <span className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Status Updater */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-3">Update Status</h2>
        <StatusUpdater orderId={order.id} currentStatus={order.status} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">
                {customerFirstName} {customerLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{customerEmail}</span>
            </div>
            {customerPhone && (
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{customerPhone}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="font-medium capitalize">
                {order.paymentMethod.replace(/_/g, " ")}
              </span>
            </div>
            {order.paymentLastFour && (
              <div className="flex justify-between">
                <span className="text-gray-500">Card</span>
                <span className="font-medium">
                  **** {order.paymentLastFour}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status</span>
              <Badge
                variant={
                  order.paymentStatus === "paid"
                    ? "success"
                    : order.paymentStatus === "failed"
                    ? "destructive"
                    : "default"
                }
              >
                {order.paymentStatus}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Shipping Info */}
      {order.fulfillmentType === "delivery" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <div className="text-sm text-gray-700">
            <p>{order.shippingAddressLine1}</p>
            {order.shippingAddressLine2 && <p>{order.shippingAddressLine2}</p>}
            <p>
              {order.shippingCity}, {order.shippingState} {order.shippingZip}
            </p>
          </div>
        </Card>
      )}

      {order.fulfillmentType === "pickup" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Fulfillment</h2>
          <p className="text-sm text-gray-700">
            In-store pickup
          </p>
        </Card>
      )}

      {/* Order Items */}
      <Card className="overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Product
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  SKU
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Variant
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">
                  Price
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">
                  Qty
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-6 py-4 font-medium">
                    {item.productName}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.productSku}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {[item.selectedSize, item.selectedColor]
                      .filter(Boolean)
                      .join(" / ") || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="px-6 py-4 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatPrice(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Totals */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col items-end gap-1 text-sm">
            <div className="flex justify-between w-64">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-gray-500">Tax</span>
              <span>{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-gray-500">Shipping</span>
              <span>
                {order.shippingAmount > 0
                  ? formatPrice(order.shippingAmount)
                  : "Free"}
              </span>
            </div>
            <div className="flex justify-between w-64 pt-2 border-t border-gray-200 font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </Card>
      )}
    </div>
  );
}
