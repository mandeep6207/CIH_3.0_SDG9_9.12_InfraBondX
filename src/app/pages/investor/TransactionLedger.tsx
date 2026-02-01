import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/lib/utils";
import { apiGet } from "@/app/services/api";

type TxDTO = {
  tx_hash: string;
  type: string;
  amount: number;
  token_count: number;
  status: string;
  created_at: string;

  project_id?: number;
  project_title?: string;
};

export function TransactionLedger() {
  const [txs, setTxs] = useState<TxDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";

        const data = await apiGet("/investor/transactions", token);

        if (data?.error) {
          setTxs([]);
          return;
        }

        setTxs(Array.isArray(data) ? data : []);
      } catch {
        setTxs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTxs();
  }, []);

  const filteredTxs = useMemo(() => {
    let list = [...txs];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => {
        const hay = `${t.tx_hash} ${t.type} ${t.status} ${t.project_title || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (typeFilter !== "all") {
      if (typeFilter === "buy") {
        list = list.filter(
          (t) => t.type.toLowerCase() === "mint" || t.type.toLowerCase() === "buy"
        );
      } else if (typeFilter === "sell") {
        list = list.filter(
          (t) => t.type.toLowerCase() === "sell" || t.type.toLowerCase() === "transfer"
        );
      }
    }

    if (statusFilter !== "all") {
      if (statusFilter === "completed") {
        list = list.filter((t) => t.status.toLowerCase() === "success");
      } else if (statusFilter === "pending") {
        list = list.filter((t) => t.status.toLowerCase() !== "success");
      }
    }

    return list;
  }, [txs, search, typeFilter, statusFilter]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const exportCSV = () => {
    const headers = ["date_time", "project", "type", "tokens", "amount", "status", "tx_hash"];
    const rows = filteredTxs.map((t) => [
      formatDate(t.created_at),
      t.project_title || "Infrastructure Project",
      t.type,
      t.token_count,
      t.amount,
      t.status,
      t.tx_hash,
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "InfraBondX_Transactions.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-muted-foreground">All your investment transactions in one place</p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-md bg-input-background"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <select
          className="px-4 py-2 border rounded-md bg-input-background"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Project
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Tokens
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Tx Hash
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-6 px-4 text-sm text-muted-foreground" colSpan={7}>
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredTxs.length === 0 ? (
                  <tr>
                    <td className="py-6 px-4 text-sm text-muted-foreground" colSpan={7}>
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((tx) => {
                    const isBuy =
                      tx.type.toLowerCase() === "mint" || tx.type.toLowerCase() === "buy";
                    const isCompleted = tx.status.toLowerCase() === "success";

                    return (
                      <tr key={tx.tx_hash} className="border-b hover:bg-accent transition-colors">
                        <td className="py-4 px-4 text-sm">{formatDate(tx.created_at)}</td>

                        <td className="py-4 px-4">
                          <div className="max-w-xs">
                            <p className="font-medium text-sm truncate">
                              {tx.project_title || "Infrastructure Project"}
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                              isBuy
                                ? "bg-[#10b981]/10 text-[#10b981]"
                                : "bg-[#f59e0b]/10 text-[#f59e0b]"
                            )}
                          >
                            {isBuy ? (
                              <ArrowDownRight className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {isBuy ? "Buy" : "Sell"}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right font-medium">{tx.token_count}</td>

                        <td className="py-4 px-4 text-right font-medium">
                          ₹{Number(tx.amount || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={cn(
                              "inline-block px-2 py-1 rounded-full text-xs font-medium",
                              isCompleted
                                ? "bg-[#10b981]/10 text-[#10b981]"
                                : "bg-[#f59e0b]/10 text-[#f59e0b]"
                            )}
                          >
                            {isCompleted ? "Completed" : "Pending"}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-muted-foreground">
                              {tx.tx_hash.substring(0, 10)}...
                            </code>
                            <button className="p-1 hover:bg-accent rounded">
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
