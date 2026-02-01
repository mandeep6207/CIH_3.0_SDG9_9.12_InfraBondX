import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskScoreMeterProps {
  score: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function RiskScoreMeter({ score, className, showLabel = true }: RiskScoreMeterProps) {
  const getRiskLevel = (score: number) => {
    if (score <= 33) return { label: "Low Risk", color: "text-[#10b981]", bg: "bg-[#10b981]" };
    if (score <= 66) return { label: "Medium Risk", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]" };
    return { label: "High Risk", color: "text-[#dc2626]", bg: "bg-[#dc2626]" };
  };

  const risk = getRiskLevel(score);

  const getIcon = () => {
    if (score <= 33) return <CheckCircle className="w-5 h-5" />;
    if (score <= 66) return <AlertTriangle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-2", risk.color)}>
          {getIcon()}
          {showLabel && <span className="font-medium">{risk.label}</span>}
        </div>
        <span className="text-sm font-medium text-foreground">{score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn("h-2 rounded-full transition-all", risk.bg)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
