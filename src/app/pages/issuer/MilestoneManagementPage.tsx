import { useEffect, useMemo, useState } from "react";
import { Upload, CheckCircle, Clock, FileText, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { MilestoneStepper } from "@/app/components/MilestoneStepper";
import { apiGet, apiPost } from "@/app/services/api";

interface MilestoneManagementPageProps {
  onNavigate: (page: string) => void;
}

type IssuerProjectDTO = {
  id: number;
  title: string;
  location: string;
  funding_raised: number;
  funding_target: number;
  token_price: number;
  roi_percent: number;
  tenure_months: number;
  risk_score: number;
  status: string;
};

type MilestoneDTO = {
  id: number;
  title: string;
  escrow_release_percent: number;
  status: string;
  proof_url: string;
};

function isMilestoneCompleted(status: string) {
  const s = String(status || "").toUpperCase();
  return s === "COMPLETED" || s === "APPROVED";
}

export function MilestoneManagementPage({ onNavigate }: MilestoneManagementPageProps) {
  const [projects, setProjects] = useState<IssuerProjectDTO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [milestones, setMilestones] = useState<MilestoneDTO[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);

  // ✅ new states for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string>("");

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);

      const token = localStorage.getItem("token") || "";
      const res = await apiGet("/issuer/projects", token);

      if (res?.error) {
        alert("Unauthorized. Please login again.");
        setProjects([]);
        return;
      }

      const list = Array.isArray(res) ? res : [];
      setProjects(list);

      if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(list[0].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchMilestones = async (projectId: number) => {
    try {
      setLoadingMilestones(true);

      const res = await apiGet(`/projects/${projectId}/milestones`);

      if (res?.error) {
        setMilestones([]);
        return;
      }

      setMilestones(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error("Failed to fetch milestones:", err);
      setMilestones([]);
    } finally {
      setLoadingMilestones(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProjectId) fetchMilestones(selectedProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const mappedStepperMilestones = useMemo(() => {
    return milestones.map((m) => {
      const done = isMilestoneCompleted(m.status);

      return {
        id: String(m.id),
        name: m.title,
        date: done ? "Verified" : "Pending",
        status: done ? "completed" : "pending",
        escrowRelease: m.escrow_release_percent,
      };
    });
  }, [milestones]);

  const completedCount = useMemo(() => {
    return milestones.filter((m) => isMilestoneCompleted(m.status)).length;
  }, [milestones]);

  const inProgressCount = useMemo(() => {
    const done = completedCount;
    const total = milestones.length;
    if (total === 0) return 0;
    if (done >= total) return 0;
    return 1;
  }, [completedCount, milestones.length]);

  const totalReleasedPercent = useMemo(() => {
    const sumCompleted = milestones
      .filter((m) => isMilestoneCompleted(m.status))
      .reduce((sum, m) => sum + (m.escrow_release_percent || 0), 0);

    return Math.min(100, sumCompleted);
  }, [milestones]);

  const pendingPercent = useMemo(() => {
    return Math.max(0, 100 - totalReleasedPercent);
  }, [totalReleasedPercent]);

  const nextMilestone = useMemo(() => {
    return milestones.find((m) => !isMilestoneCompleted(m.status)) || null;
  }, [milestones]);

  const handleUploadProof = (milestoneId: number) => {
    setSelectedMilestone(milestoneId);
    setShowUploadModal(true);

    // reset upload states each time modal opens
    setSelectedFile(null);
    setUploadingFile(false);
    setUploadedProofUrl("");
  };

  // ✅ upload file to backend: POST /api/upload
  const uploadSelectedFile = async () => {
    if (!selectedFile) {
      alert("Please choose a file first.");
      return;
    }

    try {
      setUploadingFile(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      // ✅ direct fetch because apiPost is usually JSON
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Upload failed");
        return;
      }

      // ✅ backend returns proof_url like: /uploads/xxxxx.pdf
      setUploadedProofUrl(data?.proof_url || "");
      alert("File uploaded successfully ✅");
    } catch (err: any) {
      alert("Upload failed: " + err?.message);
    } finally {
      setUploadingFile(false);
    }
  };

  // ✅ submit proof url to milestone submit endpoint
  const submitProof = async () => {
    if (!selectedMilestone) return;
    if (!selectedProjectId) return;

    try {
      setSubmittingProof(true);

      const token = localStorage.getItem("token") || "";
      if (!token) {
        alert("Unauthorized. Please login again.");
        return;
      }

      if (!uploadedProofUrl) {
        alert("Please upload the proof file first.");
        return;
      }

      const res = await apiPost(
        `/issuer/milestones/${selectedMilestone}/submit`,
        { proof_url: uploadedProofUrl },
        token
      );

      if (res?.error) {
        alert(res.error);
        return;
      }

      alert("Milestone proof submitted successfully ✅");
      setShowUploadModal(false);
      setSelectedMilestone(null);

      await fetchMilestones(selectedProjectId);
    } catch (err: any) {
      alert("Failed to submit proof: " + err?.message);
    } finally {
      setSubmittingProof(false);
    }
  };

  const selectedMilestoneObj = useMemo(() => {
    return milestones.find((m) => m.id === selectedMilestone) || null;
  }, [milestones, selectedMilestone]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Milestone Management</h1>
        <p className="text-muted-foreground">
          Track and manage project milestones, upload proofs, and request escrow releases
        </p>
      </div>

      {/* Project Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">
                {selectedProject ? selectedProject.title : "Select a project"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedProject ? selectedProject.location : "—"}
              </p>
            </div>

            <select
              className="px-4 py-2 border rounded-md bg-input-background"
              value={selectedProjectId ?? ""}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            >
              {loadingProjects ? (
                <option>Loading...</option>
              ) : projects.length === 0 ? (
                <option>No projects found</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Milestone Timeline */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Project Milestones Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMilestones ? (
              <div className="p-6 border rounded-lg text-muted-foreground">Loading milestones...</div>
            ) : (
              <MilestoneStepper milestones={mappedStepperMilestones as any} />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#10b981]/10 rounded-lg text-center">
                  <CheckCircle className="w-6 h-6 text-[#10b981] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#10b981]">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="p-3 bg-[#0ea5e9]/10 rounded-lg text-center">
                  <Clock className="w-6 h-6 text-[#0ea5e9] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0ea5e9]">{inProgressCount}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Released</span>
                  <span className="font-medium text-[#10b981]">{totalReleasedPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Pending</span>
                  <span className="font-medium text-[#f59e0b]">{pendingPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-accent rounded-lg mb-4">
                <h4 className="font-medium mb-2">
                  {nextMilestone ? `Milestone: ${nextMilestone.title}` : "All Milestones Completed"}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {nextMilestone ? "Due: Upcoming" : "No pending milestone"}
                </p>

                <Button
                  className="w-full"
                  onClick={() => nextMilestone && handleUploadProof(nextMilestone.id)}
                  disabled={!nextMilestone}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Proof
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload construction photos, audit reports, or invoices as proof
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proof History (show proof_url if exists) */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Proof History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones
              .filter((m) => isMilestoneCompleted(m.status))
              .map((m) => (
                <div key={m.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{m.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Status: {m.status}
                      </p>

                      {m.proof_url ? (
                        <a
                          href={`http://localhost:5000${m.proof_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 underline mt-1 inline-block"
                        >
                          View Uploaded Proof
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">No proof uploaded</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981]">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified & Released</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-[#10b981]/10 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Escrow Released</span>
                      <span className="font-medium text-[#10b981]">
                        ₹
                        {selectedProject
                          ? Math.round((selectedProject.funding_raised * (m.escrow_release_percent || 0)) / 100)
                              .toLocaleString("en-IN")
                          : "0"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upload Milestone Proof</CardTitle>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 hover:bg-accent rounded-full"
                  disabled={submittingProof || uploadingFile}
                >
                  ×
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">
                  Milestone: {selectedMilestoneObj?.title || "—"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Upload proof document → then submit for verification
                </p>
              </div>

              {/* ✅ File Picker */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="font-medium">Upload Proof File</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 20MB)</p>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full text-sm"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setSelectedFile(f);
                    setUploadedProofUrl("");
                  }}
                />

                {selectedFile ? (
                  <p className="text-xs text-muted-foreground">
                    Selected: <b>{selectedFile.name}</b>
                  </p>
                ) : null}

                <Button
                  variant="outline"
                  onClick={uploadSelectedFile}
                  disabled={!selectedFile || uploadingFile}
                >
                  {uploadingFile ? "Uploading..." : "Upload File"}
                </Button>

                {uploadedProofUrl ? (
                  <p className="text-xs text-[#10b981] font-medium">
                    Uploaded ✅ ({uploadedProofUrl})
                  </p>
                ) : null}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowUploadModal(false)}
                  disabled={submittingProof || uploadingFile}
                >
                  Cancel
                </Button>

                <Button
                  className="flex-1"
                  onClick={submitProof}
                  disabled={submittingProof || uploadingFile || !uploadedProofUrl}
                >
                  {submittingProof ? "Submitting..." : "Submit for Verification"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
