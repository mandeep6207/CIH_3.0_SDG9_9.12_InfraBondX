import { useState } from "react";
import { Building2, ArrowLeft, Mail, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface LoginPageProps {
  role: UserRole;
  onBack: () => void;
  onLoginSuccess: () => void;
}

export function LoginPage({ role, onBack, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) return;

    try {
      setLoading(true);

      // ✅ Backend Login (real)
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data?.token || !data?.user) {
        setErrorMsg(data?.error || "Login failed");
        return;
      }

      // ✅ FIX: use AuthContext login(apiUser, token)
      login(data.user, data.token);

      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg("Server not reachable. Please start backend.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case "investor":
        return "Investor Login";
      case "issuer":
        return "Issuer Login";
      case "admin":
        return "Admin Login";
      default:
        return "Login";
    }
  };

  const getRoleDescription = () => {
    switch (role) {
      case "investor":
        return "Access your investment portfolio and explore infrastructure projects";
      case "issuer":
        return "Manage your project listings and milestone submissions";
      case "admin":
        return "Access platform administration and verification tools";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c4a6e] to-[#075985] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 mb-6"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle>{getRoleTitle()}</CardTitle>
            <CardDescription>{getRoleDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {errorMsg ? (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {errorMsg}
                </div>
              ) : null}

              <div className="p-3 bg-accent rounded-lg text-sm">
                <strong>Demo Accounts:</strong>
                <div className="mt-2 space-y-1">
                  <div>
                    Investor: <code>investor@infrabondx.com</code> /{" "}
                    <code>investor123</code>
                  </div>
                  <div>
                    Issuer: <code>issuer@infrabondx.com</code> /{" "}
                    <code>issuer123</code>
                  </div>
                  <div>
                    Admin: <code>admin@infrabondx.com</code> /{" "}
                    <code>admin123</code>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button type="button" className="text-primary hover:underline">
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
