import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const textSizes = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
};

export function PriceDisplay({
  price,
  compareAtPrice,
  size = "md",
  className,
}: PriceDisplayProps) {
  const onSale = compareAtPrice && compareAtPrice > price;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-bold tracking-tight",
          textSizes[size],
          onSale ? "text-red-400" : "text-white"
        )}
      >
        {formatPrice(price)}
      </span>
      {onSale && (
        <span
          className={cn(
            "line-through text-gray-400 font-medium",
            size === "lg" ? "text-base" : "text-xs"
          )}
        >
          {formatPrice(compareAtPrice)}
        </span>
      )}
      {onSale && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
          {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% OFF
        </span>
      )}
    </div>
  );
}
