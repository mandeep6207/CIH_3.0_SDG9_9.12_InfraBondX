import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";

interface ImpactCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}

export function ImpactCard({ icon: Icon, label, value, color = "text-[#0c4a6e]", className }: ImpactCardProps) {
  return (
    <Card className={cn("border-l-4", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
          <div className={cn("p-3 rounded-lg bg-accent", color)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
