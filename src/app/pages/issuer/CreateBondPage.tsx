import { useState } from "react";
import { ArrowLeft, Upload, CheckCircle, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { apiPost, apiPostFormData } from "@/app/services/api";

interface CreateBondPageProps {
  onNavigate: (page: string) => void;
}

export function CreateBondPage({ onNavigate }: CreateBondPageProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    projectName: "",
    category: "roads",
    location: "",
    description: "",
    fundingGoal: "",
    roi: "",
    tenure: "",
    tokenPrice: "100",
  });

  // Document upload state: { docName: { isUploading, proofUrl, fileName } }
  const [documentUploads, setDocumentUploads] = useState<Record<string, {
    isUploading: boolean;
    proofUrl: string;
    fileName: string;
  }>>({
    "Tender Approval Document": { isUploading: false, proofUrl: "", fileName: "" },
    "Environmental Clearance Certificate": { isUploading: false, proofUrl: "", fileName: "" },
    "Project DPR (Detailed Project Report)": { isUploading: false, proofUrl: "", fileName: "" },
    "Financial Projections": { isUploading: false, proofUrl: "", fileName: "" },
    "Issuer Registration Certificate": { isUploading: false, proofUrl: "", fileName: "" },
  });

  const handleFileSelect = async (docName: string, file: File) => {
    if (!file) return;

    try {
      setDocumentUploads((prev) => ({
        ...prev,
        [docName]: { ...prev[docName], isUploading: true },
      }));

      const token = localStorage.getItem("token") || "";
      if (!token) {
        alert("Unauthorized. Please login again.");
        setDocumentUploads((prev) => ({
          ...prev,
          [docName]: { ...prev[docName], isUploading: false },
        }));
        return;
      }

      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const res = await apiPostFormData("/upload", formDataObj, token);

      if (res?.error) {
        alert(`Failed to upload ${docName}: ${res.error}`);
        setDocumentUploads((prev) => ({
          ...prev,
          [docName]: { ...prev[docName], isUploading: false },
        }));
        return;
      }

      // Store the proof_url and file name in state
      setDocumentUploads((prev) => ({
        ...prev,
        [docName]: {
          isUploading: false,
          proofUrl: res.proof_url || res.filename || "",
          fileName: file.name,
        },
      }));
    } catch (err: any) {
      alert(`Failed to upload ${docName}: ${err?.message}`);
      setDocumentUploads((prev) => ({
        ...prev,
        [docName]: { ...prev[docName], isUploading: false },
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const token = localStorage.getItem("token") || "";
      if (!token) {
        alert("Unauthorized. Please login again.");
        setSubmitting(false);
        return;
      }

      const fundingTarget = Number(formData.fundingGoal || 0);
      const roiPercent = Number(formData.roi || 0);
      const tenureYears = Number(formData.tenure || 0);
      const tokenPrice = Number(formData.tokenPrice || 100);

      if (!formData.projectName.trim() || !formData.location.trim() || !formData.description.trim()) {
        alert("Please fill Project Name, Location and Description.");
        setSubmitting(false);
        return;
      }

      if (fundingTarget <= 0 || tokenPrice <= 0) {
        alert("Invalid Funding Goal / Token Price.");
        setSubmitting(false);
        return;
      }

      if (roiPercent <= 0) {
        alert("Invalid ROI.");
        setSubmitting(false);
        return;
      }

      if (tenureYears <= 0) {
        alert("Invalid Tenure.");
        setSubmitting(false);
        return;
      }

      const payload = {
        title: formData.projectName,
        category: formData.category,
        location: formData.location,
        description: formData.description,
        funding_target: fundingTarget,
        roi_percent: roiPercent,
        tenure_months: Math.max(12, tenureYears * 12),
        token_price: tokenPrice,

        // ✅ For admin approval flow (backend can ignore, but safe for future)
        status: "PENDING",

        milestones: [
          { title: "Tender Approval", escrow_release_percent: 20 },
          { title: "Work Order Issued", escrow_release_percent: 20 },
          { title: "25% Construction", escrow_release_percent: 20 },
          { title: "75% Construction", escrow_release_percent: 20 },
          { title: "Final Audit & Handover", escrow_release_percent: 20 },
        ],
      };

      const res = await apiPost("/issuer/projects", payload, token);

      if (res?.error) {
        alert(res.error);
        setSubmitting(false);
        return;
      }

      alert("Project submitted successfully!");
      onNavigate("issuer-dashboard");
    } catch (err: any) {
      alert("Failed to create project: " + err?.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => onNavigate("issuer-dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create New Bond Listing</h1>
        <p className="text-muted-foreground">
          List your infrastructure project and raise funding from retail & institutional investors
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { num: 1, label: "Project Details" },
          { num: 2, label: "Financial Terms" },
          { num: 3, label: "Milestones" },
          { num: 4, label: "Documents" },
          { num: 5, label: "Preview & Submit" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s.num ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className="text-sm font-medium hidden md:block">{s.label}</span>
            </div>
            {i < 4 && (
              <div className={`h-0.5 w-full mx-2 ${step > s.num ? "bg-primary" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Project Details"}
              {step === 2 && "Financial Terms"}
              {step === 3 && "Define Milestones"}
              {step === 4 && "Upload Documents"}
              {step === 5 && "Preview & Submit"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm mb-2 block">Project Name</label>
                  <Input
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="e.g., Mumbai Metro Line Extension"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm mb-2 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-input-background"
                    >
                      <option value="roads">Roads & Highways</option>
                      <option value="transport">Public Transport</option>
                      <option value="energy">Renewable Energy</option>
                      <option value="smart-cities">Smart Cities</option>
                      <option value="ports">Ports & Logistics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="State, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm mb-2 block">Project Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the project, its impact, and benefits..."
                    rows={5}
                    className="w-full px-3 py-2 border rounded-md bg-input-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include SDG alignment, expected impact, and key features
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm mb-2 block">Funding Goal (₹)</label>
                  <Input
                    type="number"
                    value={formData.fundingGoal}
                    onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                    placeholder="50000000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Total funding required</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm mb-2 block">ROI (% per annum)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.roi}
                      onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
                      placeholder="8.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Tenure (years)</label>
                    <Input
                      type="number"
                      value={formData.tenure}
                      onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                      placeholder="7"
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Token Price (₹)</label>
                    <Input
                      type="number"
                      value={formData.tokenPrice}
                      onChange={(e) => setFormData({ ...formData, tokenPrice: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="p-4 bg-accent rounded-lg">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Tokens:</span>
                      <p className="font-medium">
                        {formData.fundingGoal && formData.tokenPrice
                          ? (Number(formData.fundingGoal) / Number(formData.tokenPrice)).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected Return:</span>
                      <p className="font-medium">
                        {formData.roi && formData.tenure
                          ? `₹${(
                              Number(formData.fundingGoal || 0) *
                              (1 + (Number(formData.roi) / 100) * Number(formData.tenure || 0))
                            ).toLocaleString("en-IN")}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Define milestones with escrow release percentages. Total must equal 100%.
                </p>

                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="p-4 border rounded-lg space-y-3">
                    <h4 className="font-medium">Milestone {num}</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm mb-2 block">Milestone Name</label>
                        <Input placeholder="e.g., Tender Approval" />
                      </div>
                      <div>
                        <label className="text-sm mb-2 block">Escrow Release (%)</label>
                        <Input type="number" placeholder="20" />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-lg text-sm">
                  <strong>Total Escrow Allocation:</strong> 100% ✓
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Upload required documents for verification
                </p>

                {[
                  "Tender Approval Document",
                  "Environmental Clearance Certificate",
                  "Project DPR (Detailed Project Report)",
                  "Financial Projections",
                  "Issuer Registration Certificate",
                ].map((doc, i) => {
                  const uploadState = documentUploads[doc];
                  const isUploaded = uploadState?.proofUrl;

                  return (
                    <div key={i} className={`border-2 ${isUploaded ? 'border-solid border-[#10b981]' : 'border-dashed'} rounded-lg p-6 text-center transition-colors`}>
                      {!isUploaded && !uploadState?.isUploading && (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="font-medium mb-1">{doc}</p>
                          <p className="text-xs text-muted-foreground mb-3">PDF, JPG, PNG (Max 10MB)</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById(`file-input-${i}`)?.click()}
                          >
                            Choose File
                          </Button>
                          <input
                            id={`file-input-${i}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileSelect(doc, file);
                              }
                            }}
                          />
                        </>
                      )}

                      {uploadState?.isUploading && (
                        <>
                          <Loader className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                          <p className="font-medium mb-1">{doc}</p>
                          <p className="text-sm text-blue-500">Uploading...</p>
                        </>
                      )}

                      {isUploaded && (
                        <>
                          <CheckCircle className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
                          <p className="font-medium mb-1">{doc}</p>
                          <p className="text-sm text-[#10b981] mb-3">
                            Uploaded ✅ {uploadState.fileName}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById(`file-input-${i}`)?.click()}
                          >
                            Change File
                          </Button>
                          <input
                            id={`file-input-${i}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileSelect(doc, file);
                              }
                            }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="p-6 bg-accent rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">
                    {formData.projectName || "Your Project Name"}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">{formData.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{formData.location || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Funding Goal</p>
                      <p className="font-medium">
                        ₹{Number(formData.fundingGoal || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ROI</p>
                      <p className="font-medium">{formData.roi}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tenure</p>
                      <p className="font-medium">{formData.tenure} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Token Price</p>
                      <p className="font-medium">₹{formData.tokenPrice}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#0ea5e9]/10 rounded-lg text-sm">
                  <p className="text-foreground">
                    <strong>Important:</strong> Your bond listing will be submitted to platform
                    admin for verification. You will be notified once it's approved and goes live.
                  </p>
                </div>

                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit for Admin Approval"}
                </Button>
              </div>
            )}

            {step < 5 && (
              <div className="flex gap-4 mt-6">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                    Previous
                  </Button>
                )}
                <Button onClick={() => setStep(step + 1)} className="flex-1">
                  {step === 4 ? "Preview" : "Continue"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
