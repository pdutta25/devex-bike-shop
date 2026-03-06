export const dynamic = "force-dynamic";

import { getAllProducts } from "@/lib/queries/product-queries";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeleteProductButton } from "./delete-product-button";

export default async function AdminProductsPage() {
  const productRows = await getAllProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
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
                  Category
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">
                  Price
                </th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">
                  Stock
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
              {productRows.map((row) => {
                const product = row.product;
                const stockColor =
                  product.stockQuantity === 0
                    ? "text-red-600"
                    : product.stockQuantity <= product.lowStockThreshold
                    ? "text-amber-600"
                    : "text-emerald-600";
                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>IMG</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-400">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {row.categoryName || "-"}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatPrice(product.price)}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${stockColor}`}>
                      {product.stockQuantity}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={product.isActive ? "success" : "default"}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {productRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No products found. Add your first product or seed data.
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
