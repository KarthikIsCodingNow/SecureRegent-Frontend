import React, { useRef, useState, useCallback } from "react";
import { useSettingsStore } from "../../store/settingsStore";

interface TiltElementProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  maxTilt?: number;
  scale?: number;
  elevation?: number;
  glare?: boolean;
  onLongPress?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  to?: string;
  disabled?: boolean;
}

export const TiltElement: React.FC<TiltElementProps> = ({
  as: Component = "div",
  maxTilt = 15,
  scale = 1.03,
  elevation = 12,
  glare = true,
  onLongPress,
  className = "",
  style = {},
  children,
  ...restProps
}) => {
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);
  const elementRef = useRef<HTMLElement | null>(null);
  const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({
    transform: "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)",
    transition: "transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.45s ease-out"
  });
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0
  });

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!animationsEnabled) return;
      const el = elementRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      // Normalized coordinates from -1 to +1
      const normX = ((x - width / 2) / (width / 2));
      const normY = ((y - height / 2) / (height / 2));

      // Physical "losing balance" tilt:
      // When cursor is top-right (normX > 0, normY < 0):
      // Element tips over to the top-right side like losing balance
      const tiltX = -normY * maxTilt;
      const tiltY = normX * maxTilt;

      // Dynamic reactive shadow cast opposite to tilt
      const shadowX = -normX * 12;
      const shadowY = -normY * 12 + 8;
      const shadowBlur = 24 + Math.abs(normX * 8) + Math.abs(normY * 8);

      setTransformStyle({
        transform: `perspective(700px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(${elevation}px) scale(${scale})`,
        boxShadow: `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px rgba(0, 0, 0, 0.18)`,
        transition: "transform 0.1s ease-out, box-shadow 0.15s ease-out",
        transformStyle: "preserve-3d"
      });

      if (glare) {
        setGlarePos({
          x: (x / width) * 100,
          y: (y / height) * 100,
          opacity: 0.35
        });
      }
    },
    [maxTilt, scale, elevation, glare]
  );

  const handleMouseLeave = useCallback(() => {
    setTransformStyle({
      transform: "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)",
      boxShadow: "",
      transition: "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease-out"
    });
    setGlarePos((p) => ({ ...p, opacity: 0 }));
  }, []);

  // Mobile Touch handlers: Touch & hold (Long Press) pop-up preview
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      const touch = e.touches[0];
      const el = elementRef.current;
      if (el && touch) {
        const rect = el.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const normX = ((x - rect.width / 2) / (rect.width / 2));
        const normY = ((y - rect.height / 2) / (rect.height / 2));
        const tiltX = -normY * (maxTilt * 0.7);
        const tiltY = normX * (maxTilt * 0.7);

        setTransformStyle({
          transform: `perspective(700px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(${elevation * 0.5}px) scale(0.98)`,
          transition: "transform 0.12s ease-out",
          transformStyle: "preserve-3d"
        });
      }

      longPressTimerRef.current = setTimeout(() => {
        setIsLongPressed(true);
        if (typeof window !== "undefined" && window.navigator && "vibrate" in window.navigator) {
          try {
            window.navigator.vibrate(25);
          } catch {
            // Ignore if vibration is restricted
          }
        }
        setTransformStyle({
          transform: `perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(${elevation * 1.5}px) scale(1.06)`,
          boxShadow: "0 18px 36px rgba(0, 0, 0, 0.28)",
          transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease-out"
        });
        if (onLongPress) {
          onLongPress();
        }
      }, 380);
    },
    [elevation, maxTilt, onLongPress]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressed(false);
    setTransformStyle({
      transform: "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)",
      boxShadow: "",
      transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease-out"
    });
  }, []);

  return (
    <Component
      ref={(el: HTMLElement | null) => {
        elementRef.current = el;
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        ...style,
        ...transformStyle,
        position: style.position || "relative",
        willChange: "transform, box-shadow"
      }}
      className={`select-none touch-manipulation ${isLongPressed ? "ring-2 ring-accent/40" : ""} ${className}`}
      {...restProps}
    >
      {children}
      {glare && (
        <span
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 overflow-hidden"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 120px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.35) 0%, transparent 80%)`,
            mixBlendMode: "overlay"
          }}
          aria-hidden="true"
        />
      )}
    </Component>
  );
};
