import { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle, Shield, AlertTriangle, ExternalLink, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { apiGet, apiPost } from "@/app/services/api";

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

type ProjectDetailDTO = {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  funding_target: number;
  funding_raised: number;
  roi_percent: number;
  tenure_months: number;
  token_price: number;
  risk_score: number;
  risk_level: string;
  status: string;
};

type MilestoneDTO = {
  id: number;
  title: string;
  escrow_release_percent: number;
  status: string;
  proof_url?: string;
};

export function ApproveProjectsPage() {
  const [projects, setProjects] = useState<AdminProjectDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetailDTO | null>(null);
  const [milestones, setMilestones] = useState<MilestoneDTO[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token") || "";
      const res = await apiGet("/admin/projects", token);

      if (res?.error) {
        alert("Unauthorized. Please login again.");
        setProjects([]);
        return;
      }

      setProjects(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: number) => {
    try {
      setDetailsLoading(true);

      const token = localStorage.getItem("token") || "";
      const res = await apiGet(`/admin/projects/${projectId}/details`, token);

      if (res?.error) {
        alert("Failed to fetch project details: " + res.error);
        return;
      }

      setProjectDetails(res.project || null);
      setMilestones(res.milestones || []);
    } catch (err: any) {
      alert("Failed to fetch project details: " + err?.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReviewClick = (projectId: number) => {
    setSelectedProjectId(projectId);
    fetchProjectDetails(projectId);
  };

  const closeModal = () => {
    setSelectedProjectId(null);
    setProjectDetails(null);
    setMilestones([]);
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (projectId: number, status: "ACTIVE" | "FROZEN") => {
    try {
      setStatusUpdating(true);

      const token = localStorage.getItem("token") || "";

      const res = await apiPost(`/admin/projects/${projectId}/status`, { status }, token);

      if (res?.error) {
        alert(res.error);
        return;
      }

      alert(`Project ${status === "ACTIVE" ? "activated" : "frozen"} successfully`);
      closeModal();
      fetchProjects();
    } catch (err: any) {
      alert("Failed to update project: " + err?.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatCr = (amount: number) => {
    const cr = amount / 10000000;
    if (cr >= 1) return `₹${cr.toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // ✅ Normalize backend status variations
  const normalizedProjects = useMemo(() => {
    return projects.map((p) => {
      const raw = String(p.status || "").toUpperCase();
      const normalized =
        raw === "LIVE" ? "ACTIVE" : raw; // LIVE -> ACTIVE for UI

      return { ...p, status: normalized };
    });
  }, [projects]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Project Approvals</h1>
        <p className="text-muted-foreground">
          Approve, freeze, or monitor active infrastructure bond listings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground p-6">Loading projects...</div>
          ) : normalizedProjects.length === 0 ? (
            <div className="text-muted-foreground p-6">No projects found.</div>
          ) : (
            <div className="space-y-4">
              {normalizedProjects.map((p) => {
                const isFrozen = (p.status || "").toUpperCase() === "FROZEN";

                const progress =
                  p.funding_target > 0
                    ? Math.round((p.funding_raised / p.funding_target) * 100)
                    : 0;

                return (
                  <div
                    key={p.id}
                    className="p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{p.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {p.location} • {p.category}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isFrozen ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-[#dc2626]/10 text-[#dc2626] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> FROZEN
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center gap-1">
                            <Shield className="w-3 h-3" /> ACTIVE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-medium">{formatCr(p.funding_target)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Raised</p>
                        <p className="font-medium">{formatCr(p.funding_raised)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Funded</p>
                        <p className="font-medium text-[#10b981]">{progress}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk Score</p>
                        <p className="font-medium">{p.risk_score}/100</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReviewClick(p.id)}
                      >
                        Review
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(p.id, "ACTIVE")}
                        disabled={!isFrozen}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Activate
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(p.id, "FROZEN")}
                        disabled={isFrozen}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Freeze
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={selectedProjectId !== null} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : projectDetails ? (
            <>
              <DialogHeader>
                <DialogTitle>{projectDetails.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Project Overview */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Project Overview</h3>
                  <p className="text-sm text-muted-foreground">{projectDetails.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{projectDetails.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">{projectDetails.category}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Terms */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Financial Terms</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Funding Target</p>
                      <p className="font-medium">₹{projectDetails.funding_target.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Funding Raised</p>
                      <p className="font-medium">₹{projectDetails.funding_raised.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ROI (% p.a.)</p>
                      <p className="font-medium">{projectDetails.roi_percent}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tenure</p>
                      <p className="font-medium">{Math.round(projectDetails.tenure_months / 12)} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Token Price</p>
                      <p className="font-medium">₹{projectDetails.token_price}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk Level</p>
                      <p className="font-medium">{projectDetails.risk_level}</p>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Risk Assessment</h3>
                  <div className="p-4 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Risk Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            projectDetails.risk_score <= 33
                              ? "bg-[#10b981]"
                              : projectDetails.risk_score <= 66
                              ? "bg-[#f59e0b]"
                              : "bg-[#dc2626]"
                          }`}
                          style={{ width: `${projectDetails.risk_score}%` }}
                        />
                      </div>
                      <p className="font-semibold text-lg w-16 text-center">
                        {projectDetails.risk_score}/100
                      </p>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                {milestones.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Milestones</h3>
                    <div className="space-y-3">
                      {milestones.map((milestone) => (
                        <div key={milestone.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{milestone.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Escrow Release: {milestone.escrow_release_percent}%
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                milestone.status === "COMPLETED"
                                  ? "bg-[#10b981]/10 text-[#10b981]"
                                  : "bg-[#f59e0b]/10 text-[#f59e0b]"
                              }`}
                            >
                              {milestone.status || "PENDING"}
                            </span>
                          </div>

                          {milestone.proof_url && (
                            <button
                              onClick={() =>
                                window.open(`http://localhost:5000${milestone.proof_url}`, "_blank")
                              }
                              className="inline-flex items-center gap-1 text-xs text-[#0ea5e9] hover:underline mt-2"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Document
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateStatus(projectDetails.id, "FROZEN")}
                  disabled={statusUpdating}
                  className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10"
                >
                  {statusUpdating ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Freeze
                </Button>
                <Button
                  onClick={() => updateStatus(projectDetails.id, "ACTIVE")}
                  disabled={statusUpdating}
                  className="bg-[#10b981] hover:bg-[#10b981]/90"
                >
                  {statusUpdating ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">Failed to load project details</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
