import { getAllCustomers } from "@/lib/queries/customer-queries";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default async function AdminCustomersPage() {
  const customerRows = await getAllCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customers</h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Email
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">
                  Orders
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">
                  Total Spent
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {customerRows.map((row) => (
                <tr
                  key={row.customer.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">
                    {row.customer.firstName} {row.customer.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {row.customer.email}
                  </td>
                  <td className="px-6 py-4 text-right">{row.orderCount}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatPrice(row.totalSpent)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(row.customer.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </td>
                </tr>
              ))}
              {customerRows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No customers found. Seed some data to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
