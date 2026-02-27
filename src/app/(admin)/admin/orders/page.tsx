import { getOrders } from "@/lib/queries/order-queries";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
} from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const statusFilter = params.status || undefined;

  const { orders, pagination } = await getOrders({
    page,
    status: statusFilter,
    limit: 20,
  });

  const tabs = [
    { label: "All", value: undefined },
    ...ORDER_STATUSES.map((s) => ({
      label: ORDER_STATUS_LABELS[s],
      value: s,
    })),
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          const href = tab.value
            ? `/admin/orders?status=${tab.value}`
            : "/admin/orders";
          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Orders table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Order #
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Customer
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Date
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Total
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((row) => {
                const status = row.order.status as OrderStatus;
                return (
                  <tr
                    key={row.order.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${row.order.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {row.order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div>{row.customerFirstName} {row.customerLastName}</div>
                      <div className="text-xs text-gray-400">
                        {row.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(row.order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(row.order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={ORDER_STATUS_COLORS[status]}>
                        {ORDER_STATUS_LABELS[status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${row.order.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/orders?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
              className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Page {page} of {pagination.totalPages}
          </span>
          {page < pagination.totalPages && (
            <Link
              href={`/admin/orders?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
              className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
