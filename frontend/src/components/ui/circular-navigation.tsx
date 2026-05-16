import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>;
  onClick: () => void;
  badge?: React.ReactNode;
}

interface CircularNavigationProps {
  navItems: NavItem[];
  isOpen: boolean;
  toggleMenu: () => void;
}

export function CircularNavigation({
  navItems,
  isOpen,
  toggleMenu,
}: CircularNavigationProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const size = 600; // Container size
  const center = size / 2;
  const radius = 220; // Distance from center to item center
  const itemSize = 96; // Button size

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9000] flex items-center justify-center"
          style={{ background: "rgba(4, 5, 10, 0.94)" }}
          onClick={toggleMenu}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="relative"
            style={{
              width: `${size}px`,
              height: `${size}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Outer glow ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
                border: "1px solid rgba(220, 224, 230, 0.06)",
                boxShadow: "0 0 100px rgba(228, 230, 235, 0.03), inset 0 0 80px rgba(255,255,255,0.02)",
              }}
            />

            {/* Middle ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${size - 80}px`,
                height: `${size - 80}px`,
                left: "40px",
                top: "40px",
                border: "1px solid rgba(220, 224, 230, 0.04)",
              }}
            />

            {/* Inner ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${radius * 2 + itemSize}px`,
                height: `${radius * 2 + itemSize}px`,
                left: `${center - radius - itemSize / 2}px`,
                top: `${center - radius - itemSize / 2}px`,
                border: "1px solid rgba(220, 224, 230, 0.06)",
                background: "rgba(255,255,255,0.01)",
              }}
            />

            {/* Center close button - perfectly centered */}
            <button
              onClick={toggleMenu}
              className="absolute flex items-center justify-center rounded-full z-20 transition-all duration-300 hover:scale-110"
              style={{
                width: "72px",
                height: "72px",
                left: `${center - 36}px`,
                top: `${center - 36}px`,
                background: "rgba(228, 230, 235, 0.95)",
                color: "#04050a",
                boxShadow: "0 0 40px rgba(228, 230, 235, 0.25), 0 0 80px rgba(228, 230, 235, 0.1)",
              }}
            >
              <X className="w-8 h-8" strokeWidth={2.5} />
            </button>

            {/* Center label */}
            <div
              className="absolute font-pixel uppercase text-center z-10 pointer-events-none"
              style={{
                fontSize: "10px",
                letterSpacing: "0.35em",
                color: "rgba(228, 230, 235, 0.35)",
                left: `${center - 80}px`,
                top: `${center + 50}px`,
                width: "160px",
              }}
            >
              NAVIGATION
            </div>

            {/* Navigation items - mathematically perfect circle */}
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const angleDeg = (360 / navItems.length) * index - 90; // Start from top (-90°)
              const angleRad = (angleDeg * Math.PI) / 180;
              
              // Calculate exact position from center
              const x = center + radius * Math.cos(angleRad) - itemSize / 2;
              const y = center + radius * Math.sin(angleRad) - itemSize / 2;
              
              const isHovered = hoveredItem === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    item.onClick();
                    toggleMenu();
                  }}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="absolute flex flex-col items-center justify-center transition-all duration-300 z-10"
                  style={{
                    width: `${itemSize}px`,
                    height: `${itemSize}px`,
                    left: `${x}px`,
                    top: `${y}px`,
                    borderRadius: "50%",
                    background: isHovered
                      ? "rgba(228, 230, 235, 0.95)"
                      : "rgba(17, 20, 28, 0.85)",
                    color: isHovered ? "#04050a" : "rgba(228, 230, 235, 0.9)",
                    border: isHovered
                      ? "2px solid rgba(228, 230, 235, 1)"
                      : "1px solid rgba(220, 224, 230, 0.15)",
                    boxShadow: isHovered
                      ? `0 0 50px rgba(228, 230, 235, 0.5), 
                         0 0 100px rgba(228, 230, 235, 0.2), 
                         inset 0 0 30px rgba(255,255,255,0.15),
                         0 8px 32px rgba(0,0,0,0.4)`
                      : `0 4px 24px rgba(0, 0, 0, 0.4), 
                         inset 0 1px 0 rgba(255,255,255,0.06),
                         0 0 0 1px rgba(220, 224, 230, 0.05)`,
                    transform: isHovered ? "scale(1.12)" : "scale(1)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <Icon
                    className="mb-1.5 transition-transform duration-300"
                    style={{
                      width: "26px",
                      height: "26px",
                      transform: isHovered ? "scale(1.1)" : "scale(1)",
                    }}
                    strokeWidth={1.5}
                  />
                  <span
                    className="font-pixel uppercase"
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.18em",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1.5">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
