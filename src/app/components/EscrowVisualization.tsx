import { Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EscrowVisualizationProps {
  totalFunds: number;
  lockedFunds: number;
  releasedFunds: number;
  className?: string;
}

export function EscrowVisualization({
  totalFunds,
  lockedFunds,
  releasedFunds,
  className,
}: EscrowVisualizationProps) {
  const lockedPercentage = (lockedFunds / totalFunds) * 100;
  const releasedPercentage = (releasedFunds / totalFunds) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-muted-foreground">Locked in Escrow</span>
        </div>
        <span className="font-medium">
          ₹{lockedFunds.toLocaleString("en-IN")} ({lockedPercentage.toFixed(1)}%)
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden flex">
        <div
          className="bg-[#10b981] flex items-center justify-center text-white text-xs font-medium"
          style={{ width: `${releasedPercentage}%` }}
        >
          {releasedPercentage > 10 && `${releasedPercentage.toFixed(0)}%`}
        </div>
        <div
          className="bg-[#f59e0b] flex items-center justify-center text-white text-xs font-medium"
          style={{ width: `${lockedPercentage}%` }}
        >
          {lockedPercentage > 10 && `${lockedPercentage.toFixed(0)}%`}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Unlock className="w-4 h-4 text-[#10b981]" />
          <span className="text-muted-foreground">Released to Issuer</span>
        </div>
        <span className="font-medium">
          ₹{releasedFunds.toLocaleString("en-IN")} ({releasedPercentage.toFixed(1)}%)
        </span>
      </div>

      <div className="mt-4 p-4 bg-accent rounded-lg">
        <p className="text-sm text-foreground">
          <strong>How it works:</strong> Funds are locked in smart contract escrow and released only
          when milestone proofs are verified by authorities. This ensures transparency and
          accountability.
        </p>
      </div>
    </div>
  );
}
