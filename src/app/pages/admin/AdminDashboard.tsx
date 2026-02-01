import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Users,
  Briefcase,
  DollarSign,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import { apiGet } from "@/app/services/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

type AdminProjectDTO = {
  id: number;
  title: string;
  location: string;
  category: string;
  funding_target: number;
  funding_raised: number;
  roi_percent: number;
  tenure_months: number;
  risk_score: number;
  status: string;
};

type FraudAlertDTO = {
  type: string;
  project_id: number;
  project_title: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
};

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [projects, setProjects] = useState<AdminProjectDTO[]>([]);
  const [alerts, setAlerts] = useState<FraudAlertDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // ✅ always read fresh token
        const token = localStorage.getItem("token") || "";
        if (!token) {
          setProjects([]);
          setAlerts([]);
          return;
        }

        // ✅ use helper (consistent auth + errors)
        const dataP = await apiGet("/admin/projects", token);
        if (dataP?.error) {
          setProjects([]);
          setAlerts([]);
          return;
        }

        const dataA = await apiGet("/admin/fraud-alerts", token);
        if (dataA?.error) {
          setAlerts([]);
        }

        setProjects(Array.isArray(dataP) ? dataP : []);
        setAlerts(Array.isArray(dataA) ? dataA : []);
      } catch {
        setProjects([]);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const activeProjects = useMemo(() => {
    return projects.filter((p) => (p.status || "").toUpperCase() !== "FROZEN");
  }, [projects]);

  const totalFundingRaised = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.funding_raised || 0), 0);
  }, [projects]);

  const totalInvestors = useMemo(() => {
    return projects.reduce((sum, p) => {
      const tokenPrice = 100; // demo calc
      return sum + Math.floor((p.funding_raised || 0) / tokenPrice);
    }, 0);
  }, [projects]);

  const escrowReleased = useMemo(() => {
    return Math.round(totalFundingRaised * 0.35);
  }, [totalFundingRaised]);

  const pendingApprovals = useMemo(() => {
    const list: {
      id: string;
      type: string;
      entity: string;
      submitted: string;
      priority: "high" | "medium";
    }[] = [];

    if (projects.length > 0) {
      const p = projects[0];
      list.push({
        id: `proj-${p.id}`,
        type: "Project Approval",
        entity: p.title,
        submitted: "Just now",
        priority: "high",
      });
    }

    if (alerts.length > 0) {
      const a = alerts[0];
      list.push({
        id: `fraud-${a.project_id}`,
        type: "Milestone Verification",
        entity: `${a.project_title} - Verification Pending`,
        submitted: "Today",
        priority: a.severity === "HIGH" ? "high" : "medium",
      });
    }

    if (list.length === 0) {
      list.push({
        id: "none",
        type: "Project Approval",
        entity: "No pending approvals",
        submitted: "—",
        priority: "medium",
      });
    }

    return list.slice(0, 3);
  }, [projects, alerts]);

  const recentAlerts = useMemo(() => {
    if (alerts.length === 0) {
      return [
        {
          id: "ok",
          type: "success" as const,
          message: "No suspicious activities detected",
          time: "Live",
        },
      ];
    }

    return alerts.slice(0, 3).map((a, idx) => ({
      id: String(idx),
      type: a.severity === "HIGH" ? ("warning" as const) : ("info" as const),
      message: a.message,
      time: "Live",
    }));
  }, [alerts]);

  const platformMetrics = useMemo(() => {
    const cr = totalFundingRaised / 10000000;
    const endFunding = Math.round(cr);

    return [
      { month: "Aug", funding: Math.round(endFunding * 0.0), projects: Math.max(0, activeProjects.length - 3) },
      { month: "Sep", funding: Math.round(endFunding * 0.15), projects: Math.max(0, activeProjects.length - 2) },
      { month: "Oct", funding: Math.round(endFunding * 0.35), projects: Math.max(0, activeProjects.length - 1) },
      { month: "Nov", funding: Math.round(endFunding * 0.55), projects: Math.max(1, activeProjects.length) },
      { month: "Dec", funding: Math.round(endFunding * 0.75), projects: Math.max(1, activeProjects.length) },
      { month: "Jan", funding: Math.round(endFunding * 1.0), projects: Math.max(1, activeProjects.length) },
    ];
  }, [totalFundingRaised, activeProjects.length]);

  const formatCr = (amount: number) => {
    const cr = amount / 10000000;
    if (cr >= 1) return `₹${cr.toFixed(0)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Platform Administration</h1>
        <p className="text-muted-foreground">
          Monitor platform health, verify entities, and manage approvals
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <ImpactCard
          icon={Briefcase}
          label="Active Projects"
          value={loading ? "—" : String(activeProjects.length)}
          color="text-primary"
          className="border-l-primary"
        />
        <ImpactCard
          icon={Shield}
          label="Verified Issuers"
          value="12"
          color="text-[#10b981]"
          className="border-l-[#10b981]"
        />
        <ImpactCard
          icon={FileCheck}
          label="Pending Approvals"
          value={loading ? "—" : String(pendingApprovals.filter((x) => x.id !== "none").length)}
          color="text-[#f59e0b]"
          className="border-l-[#f59e0b]"
        />
        <ImpactCard
          icon={AlertTriangle}
          label="Fraud Alerts"
          value={loading ? "—" : String(alerts.length)}
          color="text-[#dc2626]"
          className="border-l-[#dc2626]"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Funding Growth (₹Cr)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={platformMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="funding" stroke="#0c4a6e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects Count</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={platformMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="projects" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals & Alerts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{item.type}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            item.priority === "high"
                              ? "bg-[#dc2626]/10 text-[#dc2626]"
                              : "bg-[#f59e0b]/10 text-[#f59e0b]"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.entity}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.submitted}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onNavigate(item.type.includes("Issuer") ? "verify-issuers" : "approve-projects")
                      }
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate("approve-projects")}
              >
                View All Approvals
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Alerts & Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {alert.type === "warning" && (
                        <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                      )}
                      {alert.type === "success" && (
                        <CheckCircle className="w-4 h-4 text-[#10b981]" />
                      )}
                      {alert.type === "info" && (
                        <Shield className="w-4 h-4 text-[#0ea5e9]" />
                      )}
                      <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate("fraud-monitoring")}
              >
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-4 bg-accent rounded-lg text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCr(totalFundingRaised)}</p>
              <p className="text-sm text-muted-foreground">Total Funding Raised</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <Users className="w-8 h-8 text-[#0ea5e9] mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalInvestors.toLocaleString("en-IN")}</p>
              <p className="text-sm text-muted-foreground">Total Investors</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
              <p className="text-2xl font-bold">87%</p>
              <p className="text-sm text-muted-foreground">Milestone Success Rate</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <Activity className="w-8 h-8 text-[#8b5cf6] mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCr(escrowReleased)}</p>
              <p className="text-sm text-muted-foreground">Escrow Released</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
