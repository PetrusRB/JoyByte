import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/libs/utils";
import { usePopupAnimations } from "@/hooks/usePopupAnim";

interface DynamicPopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const DynamicPopup = ({
  isOpen,
  onClose,
  children,
  size = "md",
  className,
}: DynamicPopupProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const { showPopup, hidePopup } = usePopupAnimations();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      showPopup(overlayRef.current, popupRef.current);
    } else {
      document.body.style.overflow = "unset";
      if (overlayRef.current && popupRef.current) {
        hidePopup(overlayRef.current, popupRef.current);
      }
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, showPopup, hidePopup]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-md w-full mx-4";
      case "md":
        return "max-w-lg w-full mx-4";
      case "lg":
        return "max-w-4xl w-full mx-4";
      case "full":
        return "w-full h-full m-0 rounded-none md:max-w-6xl md:w-full md:mx-4 md:h-auto md:rounded-2xl md:my-8";
      default:
        return "max-w-lg w-full mx-4";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={handleBackdropClick}
      style={{
        background: "rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: 0,
        transform: "scale(1.05)",
      }}
    >
      <div
        ref={popupRef}
        className={cn(
          "relative dark:bg-zinc-950 border-b border-neutral-950 bg-orange-50 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto",
          getSizeClasses(),
          className,
        )}
        style={{
          opacity: 0,
          transform: "scale(0.95) translateY(20px)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full dark:text-white text-orange-700 dark:bg-zinc-900 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Fechar popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
};

export default DynamicPopup;
