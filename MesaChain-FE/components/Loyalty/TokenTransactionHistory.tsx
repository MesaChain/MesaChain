"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenTransaction {
  id: string;
  type: "Earn" | "Redeem" | "Transfer";
  amount: number;
  date: string;
  description: string;
  relatedRewardId: string | null;
}

interface TokenTransactionHistoryProps {
  transactions: TokenTransaction[];
}

export default function TokenTransactionHistory({
  transactions,
}: TokenTransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== "All") {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (filterDate) {
      filtered = filtered.filter(
        (t) => new Date(t.date).toISOString().split("T")[0] === filterDate
      );
    }

    // Sort by date descending
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return filtered;
  }, [transactions, searchQuery, filterType, filterDate]);

  const getAmountColor = (type: TokenTransaction["type"]) => {
    switch (type) {
      case "Earn":
        return "text-green-600";
      case "Redeem":
        return "text-red-600";
      case "Transfer":
        return "text-blue-600";
      default:
        return "text-gray-900";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              className="pl-10"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Earn">Earn</SelectItem>
                <SelectItem value="Redeem">Redeem</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                size={20}
              />
              <Input
                type="date"
                className="pl-10"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td
                      className={cn(
                        "px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
                        getAmountColor(transaction.type)
                      )}
                    >
                      {transaction.type === "Redeem" ||
                      transaction.type === "Transfer"
                        ? ""
                        : "+"}
                      {transaction.amount} Tokens
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
