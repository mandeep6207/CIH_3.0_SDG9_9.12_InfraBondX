import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { apiGet } from "@/app/services/api";

type FraudAlertDTO = {
  type: string;
  project_id: number;
  project_title: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
};

export function FraudMonitoringPage() {
  const [alerts, setAlerts] = useState<FraudAlertDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);

      // ✅ always read fresh token
      const token = localStorage.getItem("token") || "";
      if (!token) {
        setAlerts([]);
        return;
      }

      // ✅ use apiGet (consistent auth + error handling)
      const res = await apiGet("/admin/fraud-alerts", token);

      if (res?.error) {
        setAlerts([]);
        return;
      }

      setAlerts(Array.isArray(res) ? res : []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fraud & Risk Monitoring</h1>
          <p className="text-muted-foreground">Real-time suspicious activity feed (simulated)</p>
        </div>
        <Button variant="outline" onClick={fetchAlerts}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suspicious Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground p-6">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="p-6 bg-[#10b981]/10 rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#10b981]" />
              <span className="text-sm font-medium text-[#10b981]">
                No suspicious activity detected ✅
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{a.project_title}</h4>
                      <p className="text-sm text-muted-foreground">{a.message}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        a.severity === "HIGH"
                          ? "bg-[#dc2626]/10 text-[#dc2626]"
                          : a.severity === "MEDIUM"
                          ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Type: {a.type}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
