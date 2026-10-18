import React, { useEffect, useState } from "react";
import clsx from "clsx";

interface AnalogRollingCounterProps {
  value: string | number;
  className?: string;
  staggerDelay?: number; // ms per digit cascade
  initialDelay?: number; // ms before start
}

interface RollingDigitProps {
  targetDigit: number;
  cascadeIndex: number;
  staggerDelay: number;
  initialDelay: number;
  prefersReducedMotion: boolean;
}

// Single analog wheel / tumbler drum reel for a single digit
const RollingDigit: React.FC<RollingDigitProps> = ({
  targetDigit,
  cascadeIndex,
  staggerDelay,
  initialDelay,
  prefersReducedMotion
}) => {
  // Generate a multi-cycle reel of digits: [0..9, 0..9, 0..9] so it can spin with realistic inertia
  const REEL_CYCLES = 3;
  const digitsList: number[] = [];
  for (let c = 0; c < REEL_CYCLES; c++) {
    for (let d = 0; d < 10; d++) {
      digitsList.push(d);
    }
  }

  // Target index in the reel: land on the final cycle's target digit
  const finalReelIndex = 10 * (REEL_CYCLES - 1) + targetDigit;

  // Track current animated position index
  const [currentReelIndex, setCurrentReelIndex] = useState<number>(
    prefersReducedMotion ? finalReelIndex : 0
  );

  const [hasStarted, setHasStarted] = useState<boolean>(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentReelIndex(finalReelIndex);
      return;
    }

    // Reset to top and schedule cascading spin
    const delay = initialDelay + cascadeIndex * staggerDelay;
    const timer = setTimeout(() => {
      setHasStarted(true);
      setCurrentReelIndex(finalReelIndex);
    }, delay);

    return () => clearTimeout(timer);
  }, [targetDigit, cascadeIndex, staggerDelay, initialDelay, finalReelIndex, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <span className="inline-block tabular">{targetDigit}</span>;
  }

  return (
    <span
      className="inline-block relative overflow-hidden align-baseline tabular select-none"
      style={{
        height: "1.18em",
        lineHeight: "1.18em",
        width: "0.62em",
        // Analogue cylindrical curved surface shading via vertical mask gradient
        maskImage:
          "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 12%, black 28%, black 72%, rgba(0,0,0,0.7) 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 12%, black 28%, black 72%, rgba(0,0,0,0.7) 88%, transparent 100%)"
      }}
      aria-hidden="true"
    >
      <span
        className="flex flex-col will-change-transform"
        style={{
          transform: `translateY(-${currentReelIndex * 1.18}em)`,
          transition: hasStarted
            ? `transform 750ms cubic-bezier(0.16, 1, 0.3, 1)`
            : "none"
        }}
      >
        {digitsList.map((d, i) => (
          <span
            key={i}
            className="flex items-center justify-center font-display font-medium text-center"
            style={{ height: "1.18em", lineHeight: "1.18em" }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
};

export const AnalogRollingCounter: React.FC<AnalogRollingCounterProps> = ({
  value,
  className = "",
  staggerDelay = 42,
  initialDelay = 40
}) => {
  const strValue = String(value);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }
  }, []);

  // Split string into chars and determine cascade index for digits
  let digitCount = 0;
  const elements = strValue.split("").map((char, index) => {
    const isDigit = /^[0-9]$/.test(char);
    if (isDigit) {
      const currentCascadeIndex = digitCount++;
      return (
        <RollingDigit
          key={`${index}-${char}`}
          targetDigit={parseInt(char, 10)}
          cascadeIndex={currentCascadeIndex}
          staggerDelay={staggerDelay}
          initialDelay={initialDelay}
          prefersReducedMotion={prefersReducedMotion}
        />
      );
    }

    // Static characters (like currency symbols, commas, periods, percentages)
    return (
      <span
        key={`${index}-${char}`}
        className="inline-block align-baseline tabular select-none"
        style={{ height: "1.18em", lineHeight: "1.18em" }}
      >
        {char}
      </span>
    );
  });

  return (
    <span
      className={clsx("inline-flex items-baseline font-display tabular tracking-tight", className)}
      aria-label={strValue}
    >
      {elements}
    </span>
  );
};
