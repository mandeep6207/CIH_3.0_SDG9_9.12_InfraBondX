import { ReactNode } from "react";
import { LayoutDashboard, ShoppingBag, Wallet, History, TrendingUp, LogOut, Building2, Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { DisclaimerBanner } from "./DisclaimerBanner";

interface InvestorLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function InvestorLayout({ children, currentPage, onNavigate }: InvestorLayoutProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "investor-dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "marketplace", icon: ShoppingBag, label: "Marketplace" },
    { id: "portfolio", icon: Wallet, label: "Portfolio" },
    { id: "transactions", icon: History, label: "Transactions" },
    { id: "secondary-market", icon: TrendingUp, label: "Secondary Market" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DisclaimerBanner />
      
      {/* Top Navigation */}
      <nav className="border-b bg-white sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-semibold text-primary">InfraBondX</span>
              <span className="ml-2 text-xs px-2 py-1 bg-accent rounded">Investor Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-accent rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#dc2626] rounded-full" />
            </button>
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                  currentPage === item.id
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
            
            <div className="pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  logout();
                  onNavigate("landing");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
