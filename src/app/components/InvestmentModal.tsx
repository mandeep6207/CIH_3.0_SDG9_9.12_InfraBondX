import { useMemo, useState } from "react";
import { X, Coins, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { apiPost } from "@/app/services/api";

interface InvestmentModalProps {
  project: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function InvestmentModal({ project, onClose, onSuccess }: InvestmentModalProps) {
  const [step, setStep] = useState<"input" | "confirm" | "processing" | "success">("input");
  const [amount, setAmount] = useState<string>("1000");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [txHash, setTxHash] = useState<string>("0x7f9a...4b3c");
  const [tokensIssued, setTokensIssued] = useState<number>(0);

  const token = localStorage.getItem("token") || "";

  // ✅ FIX: Support Backend + UI both
  const safeTokenPrice = Number(project?.token_price ?? project?.tokenPrice ?? 100);
  const safeROI = Number(project?.roi_percent ?? project?.roi ?? 0);

  // ✅ Backend tenure is months, UI sometimes gives years
  const safeTenure = Number(
    project?.tenure_months
      ? Math.max(1, Math.round(Number(project.tenure_months) / 12))
      : project?.tenure ?? 1
  );

  const tokens = useMemo(() => {
    const amt = Number(amount || 0);
    if (!safeTokenPrice || safeTokenPrice <= 0) return 0;
    return Math.floor(amt / safeTokenPrice);
  }, [amount, safeTokenPrice]);

  const expectedReturn = useMemo(() => {
    const amt = Number(amount || 0);

    // ✅ FIX: now expected return respects tenure years too (Compound)
    const years = Number(safeTenure || 1);
    const roi = Number(safeROI || 0) / 100;

    // compound interest (demo)
    return amt * Math.pow(1 + roi, years);
  }, [amount, safeROI, safeTenure]);

  const backendProjectId = useMemo(() => {
    const raw = project?.id;

    if (typeof raw === "number") return raw;

    const str = String(raw || "").trim();

    if (/^\d+$/.test(str)) return Number(str);

    const match = str.match(/\d+/);
    if (match) return Number(match[0]);

    return 1;
  }, [project?.id]);

  const handleInvest = () => {
    if (!acceptedTerms) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    try {
      setStep("processing");

      if (!token) {
        alert("Unauthorized. Please login again.");
        setStep("input");
        return;
      }

      const investAmount = Number(amount);

      if (!backendProjectId || Number.isNaN(backendProjectId)) {
        alert("Invalid project id.");
        setStep("input");
        return;
      }

      if (!investAmount || investAmount < safeTokenPrice) {
        alert(`Amount too low. Minimum ₹${safeTokenPrice}`);
        setStep("input");
        return;
      }

      const res = await apiPost(
        "/investor/invest",
        {
          project_id: backendProjectId,
          amount: investAmount,
        },
        token
      );

      if (res?.error) {
        alert(res.error);
        setStep("input");
        return;
      }

      setTxHash(res?.tx_hash || "0x7f9a...4b3c");
      setTokensIssued(Number(res?.tokens_issued ?? tokens));

      setStep("success");
    } catch {
      alert("Investment failed. Backend not responding.");
      setStep("input");
    }
  };

  const handleSuccess = () => {
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {step === "input" && "Invest in Project"}
              {step === "confirm" && "Confirm Investment"}
              {step === "processing" && "Processing Transaction"}
              {step === "success" && "Investment Successful!"}
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded-full transition-colors"
              disabled={step === "processing"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Input Step */}
          {step === "input" && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">{project?.title || project?.name}</h4>
                <p className="text-sm text-muted-foreground">{project?.location}</p>
              </div>

              <div>
                <label className="text-sm mb-2 block">Investment Amount (₹)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={safeTokenPrice}
                  step={safeTokenPrice}
                  placeholder="Enter amount"
                />
                <p className="text-xs text-muted-foreground mt-1">Minimum: ₹{safeTokenPrice}</p>
              </div>

              {/* Quick Select */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="px-3 py-2 border rounded-md hover:border-primary hover:bg-accent transition-colors text-sm"
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              {/* Investment Preview */}
              <div className="p-4 bg-accent rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tokens Received</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="font-medium">{tokens}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ROI</span>
                  <span className="font-medium text-[#10b981]">{safeROI}% p.a.</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tenure</span>
                  <span className="font-medium">{safeTenure} years</span>
                </div>

                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="text-sm">Expected Return</span>
                  <span className="text-lg font-semibold text-[#10b981]">
                    ₹{expectedReturn.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-muted-foreground">
                  I understand that this investment carries risk and returns are not guaranteed. I
                  have read the risk disclosure and project documents. This is a demo simulation
                  with no real money.
                </span>
              </label>

              <Button
                className="w-full"
                size="lg"
                onClick={handleInvest}
                disabled={!acceptedTerms || Number(amount) < safeTokenPrice}
              >
                Continue to Confirm
              </Button>
            </div>
          )}

          {/* Confirm Step */}
          {step === "confirm" && (
            <div className="space-y-6">
              <div className="p-4 bg-accent rounded-lg space-y-3">
                <h4 className="font-medium">Transaction Summary</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project</span>
                    <span className="font-medium text-right max-w-xs truncate">
                      {project?.title || project?.name}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Amount</span>
                    <span className="font-medium">₹{Number(amount).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tokens</span>
                    <span className="font-medium">{tokens} InfraTokens</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Return</span>
                    <span className="font-medium text-[#10b981]">
                      ₹{expectedReturn.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0ea5e9]/10 rounded-lg text-sm">
                <p className="text-foreground">
                  <strong>Simulated Blockchain Transaction:</strong> Your funds will be locked in
                  escrow and released to the issuer only after milestone verification. This is a
                  demo - no real money is involved.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep("input")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => void handleConfirm()} disabled>
                  Confirm & Mint Tokens
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
              <h4 className="text-lg font-medium">Minting InfraTokens...</h4>
              <p className="text-sm text-muted-foreground">
                Simulating blockchain transaction and smart contract execution
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Verifying investment amount</p>
                <p>✓ Locking funds in escrow</p>
                <p>✓ Minting {tokens} tokens</p>
                <p className="animate-pulse">⏳ Recording on blockchain...</p>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="py-12 text-center space-y-6">
              <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-[#10b981]" />
              </div>

              <div>
                <h4 className="text-2xl font-bold mb-2">Investment Successful!</h4>
                <p className="text-muted-foreground">
                  You have successfully invested ₹{Number(amount).toLocaleString("en-IN")} in{" "}
                  {project?.title || project?.name}
                </p>
              </div>

              <div className="p-4 bg-accent rounded-lg space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tokens Minted</span>
                  <span className="font-medium">{tokensIssued || tokens} InfraTokens</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction Hash</span>
                  <span className="font-mono text-xs">
                    {txHash?.length > 14 ? `${txHash.substring(0, 10)}...` : txHash}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-[#10b981]">Confirmed</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button className="flex-1" onClick={handleSuccess}>
                  View Portfolio
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
