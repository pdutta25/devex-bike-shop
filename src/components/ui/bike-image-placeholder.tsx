import { cn } from "@/lib/utils";

const CATEGORY_THEMES: Record<string, { gradient: string; accent: string; icon: string }> = {
  road: {
    gradient: "from-blue-50 via-indigo-50 to-blue-100",
    accent: "#4f46e5",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  mountain: {
    gradient: "from-emerald-50 via-green-50 to-emerald-100",
    accent: "#059669",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
  hybrid: {
    gradient: "from-violet-50 via-purple-50 to-violet-100",
    accent: "#7c3aed",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  electric: {
    gradient: "from-amber-50 via-yellow-50 to-amber-100",
    accent: "#d97706",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  kids: {
    gradient: "from-pink-50 via-rose-50 to-pink-100",
    accent: "#e11d48",
    icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  cruiser: {
    gradient: "from-orange-50 via-amber-50 to-orange-100",
    accent: "#ea580c",
    icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
  },
  gravel: {
    gradient: "from-stone-50 via-warmgray-50 to-stone-200",
    accent: "#78716c",
    icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707",
  },
  bmx: {
    gradient: "from-red-50 via-orange-50 to-red-100",
    accent: "#dc2626",
    icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
  },
};

interface BikeImagePlaceholderProps {
  category?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BikeImagePlaceholder({
  category = "road",
  size = "md",
  className,
}: BikeImagePlaceholderProps) {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.road;

  const sizeMap = {
    sm: { wrapper: "h-32", bike: 80, badge: 20 },
    md: { wrapper: "h-48 sm:h-56", bike: 120, badge: 28 },
    lg: { wrapper: "h-64 sm:h-72", bike: 160, badge: 36 },
  };

  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br flex items-center justify-center",
        theme.gradient,
        s.wrapper,
        className
      )}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0">
        <div
          className="absolute rounded-full opacity-[0.07]"
          style={{
            width: "180%",
            height: "180%",
            top: "-40%",
            right: "-40%",
            background: `radial-gradient(circle, ${theme.accent} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute rounded-full opacity-[0.04]"
          style={{
            width: "100%",
            height: "100%",
            bottom: "-30%",
            left: "-20%",
            background: `radial-gradient(circle, ${theme.accent} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zM40 0h1v40h-1zM0 0h40v1H0zM0 40h40v1H0z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Bike SVG */}
      <svg
        width={s.bike}
        height={s.bike}
        viewBox="0 0 120 120"
        fill="none"
        className="relative z-10 drop-shadow-sm"
      >
        {/* Rear wheel */}
        <circle cx="32" cy="78" r="22" stroke={theme.accent} strokeWidth="2.5" opacity="0.2" />
        <circle cx="32" cy="78" r="22" stroke={theme.accent} strokeWidth="2.5" strokeDasharray="4 6" opacity="0.4" />
        <circle cx="32" cy="78" r="3" fill={theme.accent} opacity="0.5" />

        {/* Front wheel */}
        <circle cx="88" cy="78" r="22" stroke={theme.accent} strokeWidth="2.5" opacity="0.2" />
        <circle cx="88" cy="78" r="22" stroke={theme.accent} strokeWidth="2.5" strokeDasharray="4 6" opacity="0.4" />
        <circle cx="88" cy="78" r="3" fill={theme.accent} opacity="0.5" />

        {/* Frame */}
        <path
          d="M32 78 L55 45 L88 78 L55 45 L78 40 L88 78"
          stroke={theme.accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
        {/* Seat tube */}
        <path d="M55 45 L50 35" stroke={theme.accent} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        {/* Seat */}
        <path d="M45 35 L55 35" stroke={theme.accent} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        {/* Down tube */}
        <path d="M32 78 L55 62" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
        {/* Chainstay */}
        <path d="M55 62 L55 45" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
        {/* Handlebar */}
        <path d="M78 40 L82 33 L86 36" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

        {/* Spokes - rear */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={`rear-${angle}`}
            x1="32"
            y1="78"
            x2={32 + 20 * Math.cos((angle * Math.PI) / 180)}
            y2={78 + 20 * Math.sin((angle * Math.PI) / 180)}
            stroke={theme.accent}
            strokeWidth="0.5"
            opacity="0.15"
          />
        ))}

        {/* Spokes - front */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={`front-${angle}`}
            x1="88"
            y1="78"
            x2={88 + 20 * Math.cos((angle * Math.PI) / 180)}
            y2={78 + 20 * Math.sin((angle * Math.PI) / 180)}
            stroke={theme.accent}
            strokeWidth="0.5"
            opacity="0.15"
          />
        ))}
      </svg>

      {/* Category badge */}
      <div
        className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
        style={{
          backgroundColor: `${theme.accent}12`,
          color: theme.accent,
          border: `1px solid ${theme.accent}20`,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={CATEGORY_THEMES[category]?.icon || CATEGORY_THEMES.road.icon} />
        </svg>
        {category}
      </div>
    </div>
  );
}
