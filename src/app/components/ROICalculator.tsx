import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

interface ROICalculatorProps {
  roiPercentage: number;
  tenure: number; // in years
  tokenPrice: number;
}

export function ROICalculator({ roiPercentage, tenure, tokenPrice }: ROICalculatorProps) {
  const [investment, setInvestment] = useState<string>("1000");

  const calculateReturns = () => {
    const amount = parseFloat(investment) || 0;
    const tokens = Math.floor(amount / tokenPrice);
    const totalReturn = amount * (1 + roiPercentage / 100);
    const profit = totalReturn - amount;
    const monthlyReturn = totalReturn / (tenure * 12);

    return { amount, tokens, totalReturn, profit, monthlyReturn };
  };

  const results = calculateReturns();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Investment Amount (₹)
          </label>
          <Input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            placeholder="Enter amount"
            min="100"
          />
        </div>

        <div className="p-4 bg-accent rounded-lg space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Tokens Received</span>
            <span className="font-medium">{results.tokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Expected ROI</span>
            <span className="font-medium text-[#10b981]">{roiPercentage}% p.a.</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Tenure</span>
            <span className="font-medium">{tenure} years</span>
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Return</span>
              <span className="text-lg font-semibold text-[#10b981]">
                ₹{results.totalReturn.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-muted-foreground">Profit</span>
              <span className="font-medium text-[#10b981]">
                +₹{results.profit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>Returns are simulated and subject to project completion</span>
        </div>
      </CardContent>
    </Card>
  );
}
