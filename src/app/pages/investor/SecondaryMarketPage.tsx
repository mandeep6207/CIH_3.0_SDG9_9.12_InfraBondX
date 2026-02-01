import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, BadgeIndianRupee, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { apiGet, apiPost } from "@/app/services/api";

interface SecondaryMarketPageProps {
  onNavigate: (page: string) => void;
}

type ListingDTO = {
  id: number;
  project_id: number;
  project_title: string;
  seller_name: string;
  token_count: number;
  price_per_token: number;
  status: string;
};

type PortfolioItemDTO = {
  project_id: number;
  project_title: string;
  tokens: number;
  avg_buy_price: number;
  token_price: number;
  roi_percent: number;
  tenure_months: number;
};

export function SecondaryMarketPage({ onNavigate }: SecondaryMarketPageProps) {
  const [search, setSearch] = useState("");

  const [listings, setListings] = useState<ListingDTO[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItemDTO[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  const [sellProjectId, setSellProjectId] = useState<number | "">("");
  const [sellTokens, setSellTokens] = useState<string>("10");
  const [sellPrice, setSellPrice] = useState<string>("105");
  const [sellLoading, setSellLoading] = useState(false);

  const [buyLoadingId, setBuyLoadingId] = useState<number | null>(null);

  const fetchListings = async () => {
    try {
      setLoadingListings(true);

      const res = await apiGet("/marketplace/listings");

      if (res?.error) {
        setListings([]);
        return;
      }

      setListings(Array.isArray(res) ? res : []);
    } catch {
      setListings([]);
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      setLoadingPortfolio(true);

      const token = localStorage.getItem("token") || "";
      if (!token) {
        setPortfolio([]);
        return;
      }

      const res = await apiGet("/investor/portfolio", token);

      if (res?.error) {
        // silent fail (UI unchanged)
        setPortfolio([]);
        return;
      }

      setPortfolio(Array.isArray(res) ? res : []);
    } catch {
      setPortfolio([]);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredListings = useMemo(() => {
    let list = [...listings];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter((l) => {
        const hay = `${l.project_title} ${l.seller_name}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [listings, search]);

  const selectedHolding = useMemo(() => {
    if (!sellProjectId) return null;
    return portfolio.find((p) => p.project_id === sellProjectId) || null;
  }, [portfolio, sellProjectId]);

  const handleCreateListing = async () => {
    if (!sellProjectId) return;
    if (!sellTokens || !sellPrice) return;

    const tCount = Number(sellTokens);
    const pToken = Number(sellPrice);

    if (Number.isNaN(tCount) || Number.isNaN(pToken)) return;
    if (tCount <= 0 || pToken <= 0) return;

    try {
      setSellLoading(true);

      const token = localStorage.getItem("token") || "";
      if (!token) {
        alert("Unauthorized. Please login again.");
        return;
      }

      const res = await apiPost(
        "/marketplace/list",
        {
          project_id: sellProjectId,
          token_count: tCount,
          price_per_token: pToken,
        },
        token
      );

      if (res?.error) {
        alert(res.error);
        return;
      }

      await fetchListings();
      await fetchPortfolio();
    } catch {
      // silent fail
    } finally {
      setSellLoading(false);
    }
  };

  const handleBuyListing = async (listingId: number) => {
    try {
      setBuyLoadingId(listingId);

      const token = localStorage.getItem("token") || "";
      if (!token) {
        alert("Unauthorized. Please login again.");
        return;
      }

      const res = await apiPost(
        "/marketplace/buy",
        { listing_id: listingId },
        token
      );

      if (res?.error) {
        alert(res.error);
        return;
      }

      await fetchListings();
      await fetchPortfolio();
    } catch {
      // silent fail
    } finally {
      setBuyLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-start justify-between flex-col md:flex-row gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Secondary Market</h1>
          <p className="text-muted-foreground">
            Buy and sell InfraTokens for early exit and liquidity (demo simulation)
          </p>
        </div>
        <Button variant="outline" onClick={() => onNavigate("portfolio")}>
          Back to Portfolio
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by project or seller..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* SELL PANEL */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create Sell Listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm mb-2 block">Select Project</label>
              <select
                value={sellProjectId}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) {
                    setSellProjectId("");
                  } else {
                    setSellProjectId(Number(v));
                  }
                }}
                className="w-full px-4 py-2 border rounded-md bg-input-background"
              >
                <option value="">Choose a project</option>
                {portfolio.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.project_title} ({p.tokens} tokens)
                  </option>
                ))}
              </select>
              {loadingPortfolio ? (
                <p className="text-xs text-muted-foreground mt-2">Loading portfolio...</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm mb-2 block">Tokens to Sell</label>
                <Input
                  type="number"
                  value={sellTokens}
                  onChange={(e) => setSellTokens(e.target.value)}
                  min={1}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="text-sm mb-2 block">Price / Token (₹)</label>
                <Input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  min={1}
                  placeholder="105"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-accent rounded-lg space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Your Tokens</span>
                <span className="font-medium">{selectedHolding?.tokens ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sell Value</span>
                <span className="font-medium">
                  ₹{(Number(sellTokens || 0) * Number(sellPrice || 0)).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Liquidity</span>
                <span className="text-[#10b981] font-medium">Enabled</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCreateListing}
              disabled={
                sellLoading ||
                !sellProjectId ||
                Number(sellTokens) <= 0 ||
                Number(sellPrice) <= 0 ||
                (selectedHolding?.tokens ?? 0) < Number(sellTokens)
              }
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              {sellLoading ? "Creating Listing..." : "List Tokens for Sale"}
            </Button>
          </CardContent>
        </Card>

        {/* BUY PANEL */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingListings ? (
                <div className="p-6 border rounded-lg text-muted-foreground">
                  Loading marketplace listings...
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="p-6 border rounded-lg text-muted-foreground">
                  No active listings found. Create a sell listing to populate this marketplace.
                </div>
              ) : (
                filteredListings.map((l) => (
                  <div
                    key={l.id}
                    className="p-5 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{l.project_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Seller: {l.seller_name} • Listing ID #{l.id}
                        </p>

                        <div className="grid md:grid-cols-3 gap-3 mt-4 text-sm">
                          <div className="p-3 rounded-md bg-accent">
                            <p className="text-muted-foreground text-xs mb-1">Tokens</p>
                            <p className="font-semibold">{l.token_count}</p>
                          </div>
                          <div className="p-3 rounded-md bg-accent">
                            <p className="text-muted-foreground text-xs mb-1">Price / Token</p>
                            <p className="font-semibold">₹{l.price_per_token}</p>
                          </div>
                          <div className="p-3 rounded-md bg-accent">
                            <p className="text-muted-foreground text-xs mb-1">Total</p>
                            <p className="font-semibold">
                              ₹{(l.token_count * l.price_per_token).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[180px]">
                        <Button
                          size="lg"
                          className="w-full"
                          onClick={() => handleBuyListing(l.id)}
                          disabled={buyLoadingId === l.id}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {buyLoadingId === l.id ? "Buying..." : "Buy Tokens"}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => onNavigate(`project-${l.project_id}`)}
                        >
                          <BadgeIndianRupee className="w-4 h-4 mr-2" />
                          View Project
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
