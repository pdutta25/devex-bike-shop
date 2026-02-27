"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "secondary" | "accent" | "destructive" | "ghost" | "link" | "outline";
type ButtonSize = "sm" | "default" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-brand-accent text-white hover:bg-brand-accent-hover shadow-glow-amber hover:shadow-glow-amber-lg",
  secondary:
    "bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-sm",
  accent:
    "bg-gradient-to-r from-brand-accent to-amber-500 text-white hover:from-brand-accent-hover hover:to-amber-600 shadow-glow-amber hover:shadow-glow-amber-lg",
  destructive:
    "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  ghost:
    "text-gray-300 hover:bg-white/10 hover:text-white",
  link:
    "text-brand-accent underline-offset-4 hover:underline p-0 h-auto font-medium",
  outline:
    "bg-transparent text-brand-accent border-2 border-brand-accent hover:bg-brand-accent hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs rounded-lg gap-1.5",
  default: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-13 px-7 text-base rounded-xl gap-2",
  icon: "h-10 w-10 rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]",
          "active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
