import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import { LandingPage } from "@/app/pages/LandingPage";
import { RoleSelectPage } from "@/app/pages/RoleSelectPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { KYCOnboarding } from "@/app/pages/KYCOnboarding";

import { InvestorLayout } from "@/app/components/InvestorLayout";
import { AdminLayout } from "@/app/components/AdminLayout";
import { IssuerLayout } from "@/app/components/IssuerLayout";

import { InvestorDashboard } from "@/app/pages/investor/InvestorDashboard";
import { MarketplacePage } from "@/app/pages/investor/MarketplacePage";
import { ProjectDetailsPage } from "@/app/pages/investor/ProjectDetailsPage";
import { PortfolioPage } from "@/app/pages/investor/PortfolioPage";
import { TransactionLedger } from "@/app/pages/investor/TransactionLedger";
import { SecondaryMarketPage } from "@/app/pages/investor/SecondaryMarketPage";

import { IssuerDashboard } from "@/app/pages/issuer/IssuerDashboard";
import { CreateBondPage } from "@/app/pages/issuer/CreateBondPage";
import { MilestoneManagementPage } from "@/app/pages/issuer/MilestoneManagementPage";

import { AdminDashboard } from "@/app/pages/admin/AdminDashboard";
import { ApproveProjectsPage } from "@/app/pages/admin/ApproveProjectsPage";
import { FraudMonitoringPage } from "@/app/pages/admin/FraudMonitoringPage";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedRole, setSelectedRole] = useState<
    "investor" | "issuer" | "admin" | null
  >(null);

  const { user, isAuthenticated } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleRoleSelect = (role: "investor" | "issuer" | "admin") => {
    setSelectedRole(role);
    setCurrentPage("login");
  };

  const handleLoginSuccess = () => {
    // ✅ FIX: use latest user from localStorage (avoid async state timing issue)
    let latestUser = user;
    try {
      const stored = localStorage.getItem("user");
      if (stored) latestUser = JSON.parse(stored);
    } catch {}

    if (latestUser?.role === "investor" && !latestUser?.kycCompleted) {
      setCurrentPage("kyc");
      return;
    }

    if (latestUser?.role === "investor") setCurrentPage("investor-dashboard");
    if (latestUser?.role === "issuer") setCurrentPage("issuer-dashboard");
    if (latestUser?.role === "admin") setCurrentPage("admin-dashboard");
  };

  const handleKYCComplete = () => {
    setCurrentPage("investor-dashboard");
  };

  // ✅ Landing + Auth flow
  if (currentPage === "landing") {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "role-select") {
    return (
      <RoleSelectPage
        onSelectRole={handleRoleSelect}
        onBack={() => setCurrentPage("landing")}
      />
    );
  }

  if (currentPage === "login" && selectedRole) {
    return (
      <LoginPage
        role={selectedRole}
        onBack={() => setCurrentPage("role-select")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentPage === "kyc") {
    return <KYCOnboarding onComplete={handleKYCComplete} />;
  }

  // ✅ Investor Pages
  if (isAuthenticated && user?.role === "investor") {
    return (
      <InvestorLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === "investor-dashboard" && (
          <InvestorDashboard onNavigate={handleNavigate} />
        )}
        {currentPage === "marketplace" && (
          <MarketplacePage onNavigate={handleNavigate} />
        )}
        {currentPage.startsWith("project-") && (
          <ProjectDetailsPage projectId={currentPage} onNavigate={handleNavigate} />
        )}
        {currentPage === "portfolio" && <PortfolioPage onNavigate={handleNavigate} />}
        {currentPage === "transactions" && <TransactionLedger />}
        {currentPage === "secondary-market" && (
          <SecondaryMarketPage onNavigate={handleNavigate} />
        )}
      </InvestorLayout>
    );
  }

  // ✅ Issuer Pages
  if (isAuthenticated && user?.role === "issuer") {
    return (
      <IssuerLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === "issuer-dashboard" && (
          <IssuerDashboard onNavigate={handleNavigate} />
        )}
        {currentPage === "create-bond" && <CreateBondPage onNavigate={handleNavigate} />}
        {currentPage === "milestones" && (
          <MilestoneManagementPage onNavigate={handleNavigate} />
        )}
      </IssuerLayout>
    );
  }

  // ✅ Admin Pages
  if (isAuthenticated && user?.role === "admin") {
    return (
      <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === "admin-dashboard" && (
          <AdminDashboard onNavigate={handleNavigate} />
        )}

        {currentPage === "verify-issuers" && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Issuer Verification</h2>
            <p className="text-muted-foreground">
              Issuer verification workflow - can be added next
            </p>
          </div>
        )}

        {currentPage === "approve-projects" && <ApproveProjectsPage />}
        {currentPage === "fraud-monitoring" && <FraudMonitoringPage />}
      </AdminLayout>
    );
  }

  // fallback
  return <LandingPage onNavigate={handleNavigate} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
