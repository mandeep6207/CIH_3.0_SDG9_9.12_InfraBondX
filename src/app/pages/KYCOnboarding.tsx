import { useState } from "react";
import { Building2, CheckCircle, User, FileText, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface KYCOnboardingProps {
  onComplete: () => void;
}

export function KYCOnboarding({ onComplete }: KYCOnboardingProps) {
  const [step, setStep] = useState(1);
  const { completeKYC } = useAuth();

  const steps = [
    { id: 1, icon: User, title: "Personal Information", description: "Basic identity details" },
    { id: 2, icon: FileText, title: "Document Verification", description: "Upload ID proofs" },
    { id: 3, icon: Shield, title: "Risk Assessment", description: "Understand your profile" },
  ];

  const handleComplete = () => {
    completeKYC();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your KYC</h1>
          <p className="text-muted-foreground">
            Quick 3-step verification to start investing (Demo simulation)
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2",
                    step > s.id && "bg-[#10b981] border-[#10b981] text-white",
                    step === s.id && "bg-primary border-primary text-white",
                    step < s.id && "bg-white border-gray-300 text-gray-400"
                  )}
                >
                  {step > s.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <s.icon className="w-6 h-6" />
                  )}
                </div>
                <p className="text-sm font-medium text-center">{s.title}</p>
                <p className="text-xs text-muted-foreground text-center">{s.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-full mx-4 -mt-10",
                    step > s.id ? "bg-[#10b981]" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Personal Information"}
              {step === 2 && "Document Verification"}
              {step === 3 && "Risk Assessment & Terms"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm mb-2 block">Full Name</label>
                    <Input placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Date of Birth</label>
                    <Input type="date" />
                  </div>
                </div>
                <div>
                  <label className="text-sm mb-2 block">Phone Number</label>
                  <Input placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="text-sm mb-2 block">Address</label>
                  <Input placeholder="Enter your address" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="text-sm mb-2 block">PAN Card Number</label>
                  <Input placeholder="ABCDE1234F" />
                </div>
                <div>
                  <label className="text-sm mb-2 block">Aadhaar Number</label>
                  <Input placeholder="XXXX XXXX XXXX" />
                </div>
                <div>
                  <label className="text-sm mb-2 block">Upload ID Proof</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="p-4 bg-accent rounded-lg space-y-3">
                  <h4 className="font-medium">Risk Disclosure</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>
                      • Infrastructure bonds carry market and credit risks. Returns are not
                      guaranteed.
                    </li>
                    <li>
                      • Project delays may affect milestone completion and return timelines.
                    </li>
                    <li>
                      • Tokens represent fractional bond ownership, NOT cryptocurrency or
                      speculative assets.
                    </li>
                    <li>• Liquidity in secondary market is subject to buyer availability.</li>
                    <li>
                      • This is a HACKATHON DEMO. No real money or financial transactions are
                      involved.
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" required />
                    <span className="text-sm">
                      I confirm that I have read and understood the risk disclosure statement.
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" required />
                    <span className="text-sm">
                      I agree to the Terms of Service and Privacy Policy.
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" required />
                    <span className="text-sm">
                      I understand this is a demo simulation with no real financial implications.
                    </span>
                  </label>
                </div>
              </>
            )}

            <div className="flex gap-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  Previous
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} className="flex-1">
                  Continue
                </Button>
              ) : (
                <Button onClick={handleComplete} variant="success" className="flex-1">
                  Complete KYC & Start Investing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
