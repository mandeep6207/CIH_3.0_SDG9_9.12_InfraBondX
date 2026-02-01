import { Check, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Milestone {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "pending";
  date?: string;
  escrowRelease?: number; // percentage
}

interface MilestoneStepperProps {
  milestones: Milestone[];
  className?: string;
}

export function MilestoneStepper({ milestones, className }: MilestoneStepperProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {milestones.map((milestone, index) => {
        const isLast = index === milestones.length - 1;
        const isCompleted = milestone.status === "completed";
        const isInProgress = milestone.status === "in-progress";

        return (
          <div key={milestone.id} className="flex gap-4">
            {/* Icon and Line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  isCompleted && "bg-[#10b981] border-[#10b981] text-white",
                  isInProgress && "bg-[#0ea5e9] border-[#0ea5e9] text-white",
                  !isCompleted && !isInProgress && "bg-gray-100 border-gray-300 text-gray-400"
                )}
              >
                {isCompleted && <Check className="w-5 h-5" />}
                {isInProgress && <Clock className="w-5 h-5" />}
                {!isCompleted && !isInProgress && <Lock className="w-5 h-5" />}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 h-16 mt-2",
                    isCompleted ? "bg-[#10b981]" : "bg-gray-300"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h4
                    className={cn(
                      "font-medium",
                      isCompleted && "text-foreground",
                      isInProgress && "text-[#0ea5e9]",
                      !isCompleted && !isInProgress && "text-muted-foreground"
                    )}
                  >
                    {milestone.name}
                  </h4>
                  {milestone.date && (
                    <p className="text-sm text-muted-foreground mt-1">{milestone.date}</p>
                  )}
                  {milestone.escrowRelease && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-accent text-xs">
                      <Lock className="w-3 h-3" />
                      <span>
                        {milestone.escrowRelease}% Escrow {isCompleted ? "Released" : "Pending"}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    isCompleted && "bg-[#10b981]/10 text-[#10b981]",
                    isInProgress && "bg-[#0ea5e9]/10 text-[#0ea5e9]",
                    !isCompleted && !isInProgress && "bg-gray-100 text-gray-500"
                  )}
                >
                  {milestone.status === "completed" && "Completed"}
                  {milestone.status === "in-progress" && "In Progress"}
                  {milestone.status === "pending" && "Pending"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
