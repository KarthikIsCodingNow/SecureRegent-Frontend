import React from "react";
import clsx from "clsx";
import { useSettingsStore } from "../../store/settingsStore";

interface BrandLogoProps {
  className?: string;
  size?: number | string;
  iconOnly?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "",
  size = 28,
  iconOnly = false
}) => {
  const customLogo = useSettingsStore((s) => s.customLogo);
  const productName = useSettingsStore((s) => s.landing.productName);

  if (customLogo) {
    return (
      <img
        src={customLogo}
        alt={productName || "Secure-Regent"}
        style={{ width: size, height: size }}
        className={clsx("object-contain shrink-0 rounded-md", className)}
      />
    );
  }

  // Default clean geometric Secure-Regent icon with perfect light/dark contrast
  return (
    <div
      style={{ width: size, height: size }}
      className={clsx(
        "rounded-lg bg-text-primary flex items-center justify-center shrink-0 shadow-sm transition-colors",
        className
      )}
      aria-label={iconOnly ? productName : undefined}
    >
      <svg
        width="65%"
        height="65%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect x="4" y="3" width="5" height="18" rx="2.5" fill="var(--card)" />
        <rect x="15" y="8" width="5" height="13" rx="2.5" fill="var(--accent)" />
      </svg>
    </div>
  );
};
