import { getAllProducts } from "@/lib/queries/product-queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockUpdater } from "./stock-updater";

export default async function AdminInventoryPage() {
  const allProducts = await getAllProducts();

  const outOfStock = allProducts.filter(
    (row) => row.product.stockQuantity === 0
  );
  const lowStock = allProducts.filter(
    (row) =>
      row.product.stockQuantity > 0 &&
      row.product.stockQuantity <= row.product.lowStockThreshold
  );
  const inStock = allProducts.filter(
    (row) => row.product.stockQuantity > row.product.lowStockThreshold
  );

  const sections = [
    {
      title: "Out of Stock",
      items: outOfStock,
      badgeVariant: "destructive" as const,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      emptyMessage: "No products are out of stock",
    },
    {
      title: "Low Stock",
      items: lowStock,
      badgeVariant: "warning" as const,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      emptyMessage: "No products have low stock",
    },
    {
      title: "In Stock",
      items: inStock,
      badgeVariant: "success" as const,
      bgColor: "bg-white",
      borderColor: "border-gray-200",
      emptyMessage: "No products in stock",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Inventory Management</h1>

      {sections.map((section) => (
        <div key={section.title}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <Badge variant={section.badgeVariant}>
              {section.items.length}
            </Badge>
          </div>

          {section.items.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-gray-400 text-center">
                {section.emptyMessage}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((row) => {
                const product = row.product;
                return (
                  <Card
                    key={product.id}
                    className={`p-4 ${section.bgColor} border ${section.borderColor}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {product.sku}
                        </p>
                      </div>
                      <Badge variant={section.badgeVariant}>
                        {product.stockQuantity === 0
                          ? "Out"
                          : `${product.stockQuantity} left`}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      <span>
                        Threshold: {product.lowStockThreshold}
                      </span>
                    </div>
                    <StockUpdater
                      productId={product.id}
                      currentStock={product.stockQuantity}
                    />
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
