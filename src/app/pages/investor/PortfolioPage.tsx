import { useEffect, useMemo, useState } from "react";
import { Download, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { RiskScoreMeter } from "@/app/components/RiskScoreMeter";
import { apiGet, apiDownload } from "@/app/services/api";

interface PortfolioPageProps {
  onNavigate: (page: string) => void;
}

type PortfolioItemDTO = {
  project_id: number;
  project_title: string;
  tokens: number;
  avg_buy_price: number;
  token_price: number;
  roi_percent: number;
  tenure_months: number;
};

export function PortfolioPage({ onNavigate }: PortfolioPageProps) {
  const [holdings, setHoldings] = useState<PortfolioItemDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";

        const data = await apiGet("/investor/portfolio", token);

        if (data?.error) {
          setHoldings([]);
          return;
        }

        setHoldings(Array.isArray(data) ? data : []);
      } catch {
        setHoldings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const summary = useMemo(() => {
    const totalTokens = holdings.reduce((sum, h) => sum + (h.tokens || 0), 0);
    const totalInvested = holdings.reduce(
      (sum, h) => sum + (h.tokens || 0) * (h.token_price || 0),
      0
    );

    const currentValue = totalInvested * 1.083;
    const expectedReturns = holdings.reduce((sum, h) => {
      const invested = (h.tokens || 0) * (h.token_price || 0);
      const expected = invested * (1 + (h.roi_percent || 0) / 100);
      return sum + expected;
    }, 0);

    return {
      totalTokens,
      totalInvested,
      currentValue,
      expectedReturns,
      projectsCount: holdings.length,
      growthPercent: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0,
    };
  }, [holdings]);

  const downloadCertificate = async (projectId: number) => {
    try {
      const token = localStorage.getItem("token") || "";

      const blob = await apiDownload(`/investor/certificate/${projectId}`, token);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `InfraBondX_Certificate_${projectId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // silent fail (UI unchanged)
    }
  };

  const formatMaturityDate = (tenureMonths: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + (tenureMonths || 0));
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Portfolio</h1>
          <p className="text-muted-foreground">View and manage your infrastructure investments</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              ₹{summary.totalInvested.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Across {summary.projectsCount} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Current Value</p>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              ₹{Math.round(summary.currentValue).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-[#10b981] mt-1">
              +{summary.growthPercent.toFixed(1)}% growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Expected Returns</p>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-[#10b981]">
              ₹{Math.round(summary.expectedReturns).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">At maturity</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Tokens</p>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{summary.totalTokens}</p>
            <p className="text-xs text-muted-foreground mt-1">InfraTokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="p-6 border rounded-lg text-muted-foreground">
                Loading portfolio...
              </div>
            ) : holdings.length === 0 ? (
              <div className="p-6 border rounded-lg text-muted-foreground">
                No investments yet. Go to Marketplace and invest to see portfolio updates.
              </div>
            ) : (
              holdings.map((holding) => {
                const invested = (holding.tokens || 0) * (holding.token_price || 0);
                const currentValue = Math.round(invested * 1.083);
                const expectedPayout = Math.round(invested * (1 + (holding.roi_percent || 0) / 100));
                const maturityDate = formatMaturityDate(holding.tenure_months);

                const riskScore =
                  holding.roi_percent >= 13 ? 70 : holding.roi_percent <= 11 ? 45 : 58;

                return (
                  <div
                    key={holding.project_id}
                    className="p-6 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                    onClick={() => onNavigate(`project-${holding.project_id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{holding.project_title}</h3>
                        <p className="text-sm text-muted-foreground">India</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                        <p className="text-xl font-bold">
                          ₹{currentValue.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-[#10b981]">
                          +{invested > 0 ? (((currentValue - invested) / invested) * 100).toFixed(1) : "0.0"}%
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tokens Owned</p>
                        <p className="font-medium">{holding.tokens}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Amount Invested</p>
                        <p className="font-medium">₹{invested.toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Expected Payout</p>
                        <p className="font-medium text-[#10b981]">
                          ₹{expectedPayout.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Maturity Date</p>
                        <p className="font-medium">{maturityDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                        <RiskScoreMeter score={riskScore} showLabel={false} />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadCertificate(holding.project_id);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Certificate
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate("secondary-market");
                        }}
                      >
                        Sell Tokens
                      </Button>

                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(`project-${holding.project_id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
