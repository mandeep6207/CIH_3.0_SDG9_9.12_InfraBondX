import { Users, Building2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

import { UserRole } from "@/contexts/AuthContext";

interface RoleSelectPageProps {
  onSelectRole: (role: UserRole) => void;
  onBack: () => void;
}

export function RoleSelectPage({ onSelectRole, onBack }: RoleSelectPageProps) {
  const roles = [
    {
      id: "investor" as const,
      icon: Users,
      title: "Investor / Citizen",
      description: "Browse projects, invest in infrastructure bonds, and track your portfolio.",
      features: [
        "Start investing with ₹100",
        "View milestone progress",
        "Track returns & impact",
        "Access secondary market",
      ],
    },
    {
      id: "issuer" as const,
      icon: Building2,
      title: "Issuer / Government / PPP",
      description: "List infrastructure projects, manage milestones, and raise funding.",
      features: [
        "Create bond listings",
        "Upload milestone proofs",
        "Track investor base",
        "Manage escrow releases",
      ],
    },
    {
      id: "admin" as const,
      icon: ShieldCheck,
      title: "Platform Admin",
      description: "Verify issuers, approve projects, and monitor platform integrity.",
      features: [
        "Verify issuer credentials",
        "Approve bond listings",
        "Monitor fraud alerts",
        "Generate platform reports",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c4a6e] to-[#075985] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 mb-6"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Role</h1>
          <p className="text-xl text-white/90">
            Select how you want to interact with InfraBondX
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-primary"
              onClick={() => onSelectRole(role.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <role.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{role.description}</p>
                <ul className="text-left space-y-2 mb-6">
                  {role.features.map((feature, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-[#10b981] mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full">
                  Continue as {role.title.split(" / ")[0]}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/70">
            All roles use mock authentication for this hackathon demo
          </p>
        </div>
      </div>
    </div>
  );
}
