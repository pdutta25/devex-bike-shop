"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FRAME_MATERIALS } from "@/lib/constants";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    brand: "",
    sku: "",
    stockQuantity: "0",
    lowStockThreshold: "5",
    frameMaterial: "",
    wheelSize: "",
    speeds: "",
    weightLbs: "",
    imageUrl: "",
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const priceInCents = Math.round(parseFloat(form.price) * 100);

      const body = {
        name: form.name,
        description: form.description,
        price: priceInCents,
        categoryId: Number(form.categoryId),
        brand: form.brand,
        sku: form.sku,
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        frameMaterial: form.frameMaterial || null,
        wheelSize: form.wheelSize || null,
        speeds: form.speeds ? Number(form.speeds) : null,
        weightLbs: form.weightLbs ? parseFloat(form.weightLbs) : null,
        imageUrl: form.imageUrl || `/images/bikes/placeholder.svg`,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] || "Failed to create product");
      }

      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">New Product</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <Input
              id="name"
              name="name"
              label="Name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Carbon Road Racer Pro"
            />

            <Textarea
              id="description"
              name="description"
              label="Description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the product..."
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="price"
                name="price"
                label="Price ($)"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="0.00"
              />

              <Select
                id="categoryId"
                name="categoryId"
                label="Category"
                value={form.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="brand"
                name="brand"
                label="Brand"
                value={form.brand}
                onChange={handleChange}
                required
                placeholder="e.g. Trek"
              />

              <Input
                id="sku"
                name="sku"
                label="SKU"
                value={form.sku}
                onChange={handleChange}
                required
                placeholder="e.g. ROA-0001"
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="stockQuantity"
                name="stockQuantity"
                label="Stock Quantity"
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={handleChange}
                required
              />
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                label="Low Stock Threshold"
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              <Select
                id="frameMaterial"
                name="frameMaterial"
                label="Frame Material"
                value={form.frameMaterial}
                onChange={handleChange}
              >
                <option value="">Select material</option>
                {FRAME_MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>

              <Input
                id="wheelSize"
                name="wheelSize"
                label="Wheel Size"
                value={form.wheelSize}
                onChange={handleChange}
                placeholder='e.g. 700c, 27.5"'
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="speeds"
                name="speeds"
                label="Speeds"
                type="number"
                min="1"
                value={form.speeds}
                onChange={handleChange}
                placeholder="e.g. 21"
              />

              <Input
                id="weightLbs"
                name="weightLbs"
                label="Weight (lbs)"
                type="number"
                step="0.1"
                min="0"
                value={form.weightLbs}
                onChange={handleChange}
                placeholder="e.g. 22.5"
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Image</h2>
            <Input
              id="imageUrl"
              name="imageUrl"
              label="Image URL"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="/images/bikes/my-bike.svg"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Settings</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium">Featured Product</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="submit" loading={loading}>
              Create Product
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
