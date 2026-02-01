import { Building2, ShieldCheck, TrendingUp, Users, ArrowRight, CheckCircle, Lock, FileCheck, Zap, BriefcaseBusiness, Coins, LineChart } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { DisclaimerBanner } from "@/app/components/DisclaimerBanner";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <DisclaimerBanner />
      
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-primary">InfraBondX</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => onNavigate("role-select")}>
              Sign In
            </Button>
            <Button onClick={() => onNavigate("role-select")}>
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#0c4a6e] to-[#075985]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm">Tokenized Infrastructure Bonds • SDG 9 Aligned</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Invest Small, Build Big Infrastructure
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Breaking down infrastructure financing barriers. Enable retail investors to participate
            in nation-building with as low as ₹100, while ensuring transparency through
            milestone-verified escrow release.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => onNavigate("role-select")}
            >
              Explore Projects
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-white border-white hover:bg-white/10"
              onClick={() => onNavigate("role-select")}
            >
              Issuer Login
            </Button>
          </div>

          {/* Problem Statement */}
          <div className="mt-16 grid md:grid-cols-4 gap-6 text-left">
            {[
              { label: "Traditional Min. Entry", value: "$100K+", icon: Coins },
              { label: "Avg. Lock-in Period", value: "10-30 yrs", icon: Lock },
              { label: "Funding Gap (Global)", value: "$15T", icon: TrendingUp },
              { label: "Retail Exclusion", value: "99%", icon: Users },
            ].map((stat, i) => (
              <Card key={i} className="bg-white/10 border-white/20 backdrop-blur">
                <CardContent className="p-6">
                  <stat.icon className="w-8 h-8 text-white mb-2" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/80">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How InfraBondX Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple, transparent, and secure infrastructure financing in 4 steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: LineChart,
                title: "Choose Project",
                description:
                  "Browse verified infrastructure projects with transparent risk ratings and milestone tracking.",
              },
              {
                step: "02",
                icon: Coins,
                title: "Buy InfraTokens",
                description:
                  "Invest as low as ₹100-₹500. Tokens represent fractional bond ownership, not crypto.",
              },
              {
                step: "03",
                icon: Lock,
                title: "Milestone Escrow",
                description:
                  "Your funds are locked in smart contract escrow, released only after verified milestones.",
              },
              {
                step: "04",
                icon: TrendingUp,
                title: "Track & Earn Returns",
                description:
                  "Monitor real-time progress, audit proofs, and earn returns upon project completion.",
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">
                    {step.step}
                  </div>
                  <div className="p-4 bg-accent rounded-lg mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Built on Trust & Transparency</h2>
            <p className="text-lg text-muted-foreground">
              Every layer designed for accountability and investor protection
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Issuers",
                description:
                  "Only government bodies and verified PPP companies can list projects after rigorous KYC.",
              },
              {
                icon: FileCheck,
                title: "Auditable Milestones",
                description:
                  "Every milestone requires documentary proof (photos, invoices, audit reports) before approval.",
              },
              {
                icon: Lock,
                title: "Escrow Release by Proof",
                description:
                  "Funds unlock automatically only when authorities verify milestone completion.",
              },
              {
                icon: Zap,
                title: "Smart Contract Logic",
                description:
                  "Simulated blockchain escrow ensures tamper-proof, automated, transparent fund flow.",
              },
            ].map((feature, i) => (
              <Card key={i} className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-[#10b981]" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981]/10 rounded-full text-[#10b981] mb-4">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">SDG 9: Industry, Innovation & Infrastructure</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Real Impact, Measurable Change</h2>
            <p className="text-lg text-muted-foreground">
              Your investment creates tangible infrastructure and economic growth
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { value: "2,450", label: "Jobs Enabled", suffix: "+" },
              { value: "127", label: "KM Roads Built", suffix: " KM" },
              { value: "18,500", label: "Tons CO₂ Saved", suffix: " T" },
              { value: "43", label: "Projects Funded", suffix: "" },
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary mb-1">
                    {stat.value}
                    {stat.suffix}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-8 bg-primary rounded-xl text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Build the Future?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of retail investors participating in transparent, milestone-verified
              infrastructure financing. Start with as little as ₹100.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => onNavigate("role-select")}
            >
              Start Investing Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold">InfraBondX</span>
              </div>
              <p className="text-sm text-white/70">
                Democratizing infrastructure finance through tokenization and transparency.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>How It Works</li>
                <li>Projects</li>
                <li>For Issuers</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Risk Disclosure</li>
                <li>Compliance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Disclaimer</h4>
              <p className="text-xs text-white/70">
                This is a hackathon MVP simulation. No real money or financial transactions are
                involved. Tokens represent fractional ownership of regulated bonds, NOT
                cryptocurrency.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/70">
            <p>© 2026 InfraBondX. Hackathon MVP Demo. Not meant for collecting PII or securing sensitive data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
