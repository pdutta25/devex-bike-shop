"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueData {
  period: string;
  revenue: number;
  order_count: number;
}

interface TopProduct {
  productName: string;
  totalRevenue: number;
  totalQuantity: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
}

interface CategoryPerf {
  categoryName: string;
  revenue: number;
  orderCount: number;
  unitsSold: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#9ca3af",
  processing: "#3b82f6",
  ready_for_pickup: "#f59e0b",
  shipped: "#6366f1",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#6366f1", "#9ca3af"];

type Period = "daily" | "weekly" | "monthly";

export default function AdminReportsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [categoryPerf, setCategoryPerf] = useState<CategoryPerf[]>([]);
  const [revenuePeriod, setRevenuePeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/reports/revenue?period=${revenuePeriod}`).then((r) => r.json()),
      fetch("/api/reports/top-products").then((r) => r.json()),
      fetch("/api/reports/orders-by-status").then((r) => r.json()),
      fetch("/api/reports/category-performance").then((r) => r.json()),
    ])
      .then(([revenue, products, statuses, categories]) => {
        setRevenueData(revenue);
        setTopProducts(products);
        setOrdersByStatus(statuses);
        setCategoryPerf(categories);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [revenuePeriod]);

  const formatCurrency = (value: number) => `$${(value / 100).toLocaleString()}`;

  const periods: { label: string; value: Period }[] = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    ready_for_pickup: "Ready for Pickup",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-64 bg-gray-100 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      {/* Revenue Over Time */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Over Time</CardTitle>
            <div className="flex gap-2">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setRevenuePeriod(p.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    revenuePeriod === p.value
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {revenueData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} tickLine={false} width={80} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No product data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="productName"
                    width={120}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(name: string) =>
                      name.length > 18 ? name.slice(0, 18) + "..." : name
                    }
                  />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                  <Bar dataKey="totalRevenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByStatus.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No order data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }: { status: string; count: number }) =>
                      `${STATUS_LABELS[status] || status}: ${count}`
                    }
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, "Orders"]}
                  />
                  <Legend
                    formatter={(value: string) => STATUS_LABELS[value] || value}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryPerf.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No category data available
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-medium text-gray-500">
                      Category
                    </th>
                    <th className="text-right py-3 font-medium text-gray-500">
                      Revenue
                    </th>
                    <th className="text-right py-3 font-medium text-gray-500">
                      Orders
                    </th>
                    <th className="text-right py-3 font-medium text-gray-500">
                      Units Sold
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryPerf.map((cat) => (
                    <tr
                      key={cat.categoryName}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-3 font-medium">{cat.categoryName}</td>
                      <td className="py-3 text-right">
                        {formatCurrency(cat.revenue)}
                      </td>
                      <td className="py-3 text-right">{cat.orderCount}</td>
                      <td className="py-3 text-right">{cat.unitsSold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
