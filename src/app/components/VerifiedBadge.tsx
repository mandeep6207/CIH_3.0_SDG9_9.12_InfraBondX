import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VerifiedBadge({ className, size = "md" }: VerifiedBadgeProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#10b981]/10 text-[#10b981]",
        className
      )}
    >
      <ShieldCheck className={sizes[size]} />
      <span className="text-xs font-medium">Verified</span>
    </div>
  );
}
