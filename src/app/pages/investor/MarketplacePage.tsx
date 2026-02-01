import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  TrendingUp,
  Target,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { RiskScoreMeter } from "@/app/components/RiskScoreMeter";
import { VerifiedBadge } from "@/app/components/VerifiedBadge";
import { cn } from "@/lib/utils";
import { apiGet } from "@/app/services/api";

interface MarketplacePageProps {
  onNavigate: (page: string) => void;
}

type ProjectDTO = {
  id: number;
  title: string;
  category: string;
  location: string;
  description: string;
  funding_target: number;
  funding_raised: number;
  token_price: number;
  roi_percent: number;
  tenure_months: number;
  risk_level: string;
  risk_score: number;
  status: string;

  issuer_verified?: boolean;

  // ✅ Optional (for safety if any other UI passes camelCase)
  tokenPrice?: number;
  roi?: number;
  tenure?: number;
  fundingTarget?: number;
  fundingRaised?: number;
};

export function MarketplacePage({ onNavigate }: MarketplacePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("most-funded");

  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "roads", label: "Roads & Highways" },
    { id: "transport", label: "Public Transport" },
    { id: "energy", label: "Renewable Energy" },
    { id: "smart-cities", label: "Smart Cities" },
    { id: "ports", label: "Ports & Logistics" },
  ];

  const sortOptions = [
    { id: "most-funded", label: "Most Funded" },
    { id: "highest-roi", label: "Highest ROI" },
    { id: "lowest-risk", label: "Lowest Risk" },
    { id: "shortest-tenure", label: "Shortest Tenure" },
  ];

  const categoryMap: Record<string, string[]> = {
    all: [],
    roads: ["Road", "Roads", "Highway", "Highways"],
    transport: ["Transport", "Metro", "Rail", "Public Transport"],
    energy: ["Energy", "Renewable", "Solar", "Wind", "Power"],
    "smart-cities": ["Smart City", "Smart Cities"],
    ports: ["Port", "Ports", "Logistics"],
  };

  // ✅ FIX: Normalize backend + UI field variations (snake_case + camelCase)
  const normalizeProject = (p: any): ProjectDTO => {
    return {
      id: Number(p?.id ?? 0),
      title: String(p?.title ?? p?.name ?? ""),
      category: String(p?.category ?? ""),
      location: String(p?.location ?? ""),
      description: String(p?.description ?? ""),

      funding_target: Number(p?.funding_target ?? p?.fundingTarget ?? 0),
      funding_raised: Number(p?.funding_raised ?? p?.fundingRaised ?? 0),

      token_price: Number(p?.token_price ?? p?.tokenPrice ?? 100),
      roi_percent: Number(p?.roi_percent ?? p?.roi ?? 0),

      tenure_months: Number(
        p?.tenure_months
          ? p.tenure_months
          : p?.tenure
          ? Number(p.tenure) * 12
          : 12
      ),

      risk_level: String(p?.risk_level ?? "MEDIUM"),
      risk_score: Number(p?.risk_score ?? 0),
      status: String(p?.status ?? "ACTIVE"),

      issuer_verified: p?.issuer_verified,
    };
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const data = await apiGet("/projects");
        const list = Array.isArray(data) ? data.map(normalizeProject) : [];

        setProjects(list);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = [...projects];

    // Search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const hay = `${p.title} ${p.location} ${p.category}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // Category
    if (selectedCategory !== "all") {
      const allowed = categoryMap[selectedCategory] || [];
      list = list.filter((p) =>
        allowed.some((a) => p.category.toLowerCase().includes(a.toLowerCase()))
      );
    }

    // Sorting
    if (sortBy === "most-funded") {
      list.sort((a, b) => (b.funding_raised || 0) - (a.funding_raised || 0));
    } else if (sortBy === "highest-roi") {
      list.sort((a, b) => (b.roi_percent || 0) - (a.roi_percent || 0));
    } else if (sortBy === "lowest-risk") {
      list.sort((a, b) => (a.risk_score || 0) - (b.risk_score || 0));
    } else if (sortBy === "shortest-tenure") {
      list.sort((a, b) => (a.tenure_months || 0) - (b.tenure_months || 0));
    }

    return list;
  }, [projects, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Project Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and invest in verified infrastructure projects
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, location, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-md bg-input-background"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full whitespace-nowrap transition-colors",
              selectedCategory === cat.id
                ? "bg-primary text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            {[...Array(6)].map((_, idx) => (
              <Card key={idx} className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                  <div className="h-2 w-full bg-muted rounded" />
                  <div className="h-10 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : filteredAndSorted.length === 0 ? (
          <div className="col-span-full p-6 border rounded-lg text-muted-foreground">
            No projects found. Try changing search or category filters.
          </div>
        ) : (
          filteredAndSorted.map((project) => {
            const fundingProgress =
              project.funding_target > 0
                ? (project.funding_raised / project.funding_target) * 100
                : 0;

            const showVerified = project.issuer_verified !== false;

            return (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                onClick={() => onNavigate(`project-${project.id}`)}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold leading-tight">
                        {project.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location}</span>
                    </div>

                    {showVerified && (
                      <div className="mt-2">
                        <VerifiedBadge size="sm" />
                      </div>
                    )}
                  </div>

                  {/* Funding Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Funding Progress
                      </span>
                      <span className="font-medium">
                        {fundingProgress.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, fundingProgress)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        ₹{(project.funding_raised / 10000000).toFixed(1)}Cr raised
                      </span>
                      <span>
                        ₹{(project.funding_target / 10000000).toFixed(1)}Cr target
                      </span>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-[#10b981] mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">
                          {project.roi_percent}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">ROI p.a.</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">
                          {Math.max(1, Math.round(project.tenure_months / 12))}y
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Tenure</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-[#0ea5e9] mb-1">
                        <Target className="w-4 h-4" />
                        <span className="font-semibold">
                          ₹{project.token_price}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Per Token</p>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <RiskScoreMeter score={project.risk_score || 0} showLabel={false} />

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`project-${project.id}`);
                      }}
                    >
                      View Details
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`project-${project.id}`);
                      }}
                    >
                      Invest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg" disabled>
          Load More Projects
        </Button>
      </div>
    </div>
  );
}
