import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, Target, Bell, Activity, Building2, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface InvestorDashboardProps {
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

type ProjectDTO = {
  id: number;
  title: string;
  category: string;
  location: string;
  description: string;
  funding_target: number;
  funding_raised: number;
  token_price: number;
  roi_percent: number;
  tenure_months: number;
  risk_level: string;
  risk_score: number;
  status: string;
};

export function InvestorDashboard({ onNavigate }: InvestorDashboardProps) {
  const [holdings, setHoldings] = useState<PortfolioItemDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("token") || "";

        const pRes = await fetch("http://localhost:5000/api/investor/portfolio", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pData = await pRes.json();
        setHoldings(Array.isArray(pData) ? pData : []);

        const projRes = await fetch("http://localhost:5000/api/projects");
        const projData = await projRes.json();
        setProjects(Array.isArray(projData) ? projData : []);
      } catch {
        setHoldings([]);
        setProjects([]);
      }
    };

    loadDashboard();
  }, []);

  const summary = useMemo(() => {
    const totalTokens = holdings.reduce((sum, h) => sum + (h.tokens || 0), 0);

    const totalInvested = holdings.reduce(
      (sum, h) => sum + (h.tokens || 0) * (h.token_price || 0),
      0
    );

    const avgROI =
      holdings.length > 0
        ? holdings.reduce((sum, h) => sum + (h.roi_percent || 0), 0) / holdings.length
        : 0;

    const expectedReturns = holdings.reduce((sum, h) => {
      const invested = (h.tokens || 0) * (h.token_price || 0);
      const expected = invested * (1 + (h.roi_percent || 0) / 100);
      return sum + expected;
    }, 0);

    return {
      totalTokens,
      totalInvested,
      expectedReturns,
      avgROI,
      projectsCount: holdings.length,
    };
  }, [holdings]);

  const portfolioData = useMemo(() => {
    const base = summary.totalInvested || 0;

    return [
      { month: "Aug", value: Math.round(base * 0.0) },
      { month: "Sep", value: Math.round(base * 0.2) },
      { month: "Oct", value: Math.round(base * 0.35) },
      { month: "Nov", value: Math.round(base * 0.52) },
      { month: "Dec", value: Math.round(base * 0.78) },
      { month: "Jan", value: Math.round(base * 1.0) },
    ];
  }, [summary.totalInvested]);

  const riskDistribution = useMemo(() => {
    const total = summary.totalInvested || 0;

    if (total <= 0) {
      return [
        { name: "Low Risk", value: 0, color: "#10b981" },
        { name: "Medium Risk", value: 0, color: "#f59e0b" },
        { name: "High Risk", value: 0, color: "#dc2626" },
      ];
    }

    let low = 0;
    let med = 0;
    let high = 0;

    for (const h of holdings) {
      const invested = (h.tokens || 0) * (h.token_price || 0);
      const roi = h.roi_percent || 0;

      if (roi <= 10) low += invested;
      else if (roi <= 13) med += invested;
      else high += invested;
    }

    return [
      { name: "Low Risk", value: Math.round(low), color: "#10b981" },
      { name: "Medium Risk", value: Math.round(med), color: "#f59e0b" },
      { name: "High Risk", value: Math.round(high), color: "#dc2626" },
    ];
  }, [holdings, summary.totalInvested]);

  const notifications = useMemo(() => {
    const topHold = holdings.slice(0, 3).map((h, idx) => ({
      id: String(idx + 1),
      type: "info",
      title: idx === 0 ? "Investment Confirmed" : "Portfolio Updated",
      message:
        idx === 0
          ? `Tokens successfully minted in ${h.project_title}`
          : `Holding updated for ${h.project_title}`,
      time: idx === 0 ? "Just now" : `${idx + 1} hours ago`,
    }));

    if (topHold.length > 0) return topHold;

    return [
      {
        id: "1",
        type: "info",
        title: "Welcome to InfraBondX",
        message: "Explore verified infrastructure projects and start investing from ₹100.",
        time: "Just now",
      },
    ];
  }, [holdings]);

  const recommendedProjects = useMemo(() => {
    const list = projects
      .slice(0, 2)
      .map((p, idx) => ({
        id: `project-${p.id}`,
        name: p.title,
        roi: p.roi_percent,
        risk: p.risk_score,
        progress:
          p.funding_target > 0 ? Math.round((p.funding_raised / p.funding_target) * 100) : 0,
      }));

    if (list.length > 0) return list;

    return [
      {
        id: "project-1",
        name: "Recommended Project",
        roi: 10.5,
        risk: 45,
        progress: 25,
      },
    ];
  }, [projects]);

  const impact = useMemo(() => {
    const invested = summary.totalInvested || 0;

    const roadMeters = Math.round(invested / 50);
    const solarPercent = Number(((invested / 200000) * 100).toFixed(1));
    const jobs = Math.max(1, Math.round(invested / 250));
    const co2SavedTons = Number((invested / 1200).toFixed(1));

    return { roadMeters, solarPercent, jobs, co2SavedTons };
  }, [summary.totalInvested]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Investment Dashboard</h1>
        <p className="text-muted-foreground">
          Track your portfolio, monitor milestones, and view your impact
        </p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <ImpactCard
          icon={Wallet}
          label="Total Invested"
          value={`₹${summary.totalInvested.toLocaleString("en-IN")}`}
          color="text-primary"
          className="border-l-primary"
        />
        <ImpactCard
          icon={Coins}
          label="Tokens Owned"
          value={`${summary.totalTokens}`}
          color="text-[#0ea5e9]"
          className="border-l-[#0ea5e9]"
        />
        <ImpactCard
          icon={TrendingUp}
          label="Expected Returns"
          value={`₹${Math.round(summary.expectedReturns).toLocaleString("en-IN")}`}
          color="text-[#10b981]"
          className="border-l-[#10b981]"
        />
        <ImpactCard
          icon={Target}
          label="Avg. ROI"
          value={`${summary.avgROI.toFixed(1)}%`}
          color="text-[#8b5cf6]"
          className="border-l-[#8b5cf6]"
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Portfolio Growth */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c4a6e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0c4a6e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0c4a6e"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Meter & Notifications */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Impact Meter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Your Impact Contribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-accent rounded-lg">
              <p className="text-2xl font-bold text-primary mb-1">Your investment helped build:</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-[#10b981]">{impact.roadMeters}m</p>
                <p className="text-sm text-muted-foreground">Road Length</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-[#0ea5e9]">{impact.solarPercent}%</p>
                <p className="text-sm text-muted-foreground">Solar Capacity</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-[#f59e0b]">{impact.jobs}</p>
                <p className="text-sm text-muted-foreground">Jobs Enabled</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-[#8b5cf6]">{impact.co2SavedTons}T</p>
                <p className="text-sm text-muted-foreground">CO₂ Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Live Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm">{notif.title}</h4>
                  <span className="text-xs text-muted-foreground">{notif.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Notifications
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Recommended Projects for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                onClick={() => onNavigate(project.id)}
              >
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{project.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>ROI: {project.roi}%</span>
                    <span>Risk: {project.risk}/100</span>
                    <span>Progress: {project.progress}%</span>
                  </div>
                </div>
                <Button>View Details</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
