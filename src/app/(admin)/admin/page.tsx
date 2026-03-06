export const dynamic = "force-dynamic";

import { getDashboardStats, getRecentOrders } from "@/lib/queries/report-queries";
import { getLowStockProducts } from "@/lib/queries/product-queries";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from "@/lib/constants";
import RevenueChart from "./revenue-chart";

export default async function AdminDashboardPage() {
  const [stats, recentOrders, lowStockProducts] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(10),
    getLowStockProducts(10),
  ]);

  const kpiCards = [
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: "\uD83D\uDCB0",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: "\uD83D\uDCE6",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      label: "Avg Order Value",
      value: formatPrice(stats.avgOrderValue),
      icon: "\uD83D\uDCCA",
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
    },
    {
      label: "Active Products",
      value: stats.activeProducts.toLocaleString(),
      icon: "\uD83D\uDEB2",
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} rounded-xl shadow-sm p-6`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`${card.iconBg} w-10 h-10 rounded-lg flex items-center justify-center text-xl`}
              >
                {card.icon}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {card.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
        <RevenueChart />
      </Card>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">
                    Order
                  </th>
                  <th className="text-left py-2 font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="text-left py-2 font-medium text-gray-500">
                    Total
                  </th>
                  <th className="text-left py-2 font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((row) => {
                  const status = row.order.status as OrderStatus;
                  return (
                    <tr
                      key={row.order.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-2">
                        <Link
                          href={`/admin/orders/${row.order.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {row.order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2 text-gray-700">
                        {row.customerFirstName} {row.customerLastName}
                      </td>
                      <td className="py-2 font-medium">
                        {formatPrice(row.order.total)}
                      </td>
                      <td className="py-2">
                        <Badge className={ORDER_STATUS_COLORS[status]}>
                          {ORDER_STATUS_LABELS[status]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
            <Link
              href="/admin/inventory"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Manage inventory
            </Link>
          </div>
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sku}</p>
                </div>
                <Badge
                  variant={
                    product.stockQuantity === 0 ? "destructive" : "warning"
                  }
                >
                  {product.stockQuantity === 0
                    ? "Out of stock"
                    : `${product.stockQuantity} left`}
                </Badge>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="py-8 text-center text-gray-400">
                All products are well-stocked
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
