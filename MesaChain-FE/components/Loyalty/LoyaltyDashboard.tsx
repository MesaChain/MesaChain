"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Gift, History, Send, BarChart } from "lucide-react";
import TokenBalanceCard from "./TokenBalanceCard";
import RewardsCatalog from "./RewardsCatalog";
import TokenTransactionHistory from "./TokenTransactionHistory";
import TokenTransferForm from "./TokenTransferForm";
import LoyaltyAnalytics from "./LoyaltyAnalytics";
import type { TokenTransaction } from "@/types";
import toast from "react-hot-toast";
import {
  fetchUserLoyaltyData,
  redeemRewardApi,
  transferTokensApi,
  type LoyaltyUser,
  type LoyaltyReward,
} from "@/lib/api/loyalty";

const initialMockUser: LoyaltyUser = {
  id: "user123",
  name: "Alexa Laza",
  tokenBalance: 1250,
  tier: "Gold",
  tokensToNextTier: 750,
  nextTierName: "Platinum",
  nextTierBenefits: [
    "Exclusive discounts on all orders.",
    "Priority table reservations.",
    "Early access to new menu items.",
    "Personalized customer support.",
  ],
};

const initialMockRewards: LoyaltyReward[] = [
  {
    id: "R001",
    name: "Free Coffee",
    description: "Redeem for a complimentary coffee of your choice.",
    cost: 100,
    image: "/placeholder.svg?height=150&width=150",
    category: "Drinks",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // Expires in 30 days
  },
  {
    id: "R002",
    name: "10% Off Next Order",
    description: "Get 10% off your next food or drink order.",
    cost: 300,
    image: "/placeholder.svg?height=150&width=150",
    category: "Discounts",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // Expires in 7 days
  },
  {
    id: "R003",
    name: "Free Dessert",
    description: "Enjoy a free dessert with any main course.",
    cost: 200,
    image: "/placeholder.svg?height=150&width=150",
    category: "Food",
  },
  {
    id: "R004",
    name: "VIP Lounge Access",
    description: "Access to our exclusive VIP lounge for one visit.",
    cost: 500,
    image: "/placeholder.svg?height=150&width=150",
    category: "Experiences",
  },
  {
    id: "R005",
    name: "Birthday Special",
    description: "A special treat on your birthday month.",
    cost: 400,
    image: "/placeholder.svg?height=150&width=150",
    category: "Special",
  },
];

const initialMockTransactions: TokenTransaction[] = [
  {
    id: "T001",
    type: "Earn",
    amount: 50,
    date: "2025-07-20T10:00:00Z",
    description: "Purchase #12345",
    relatedRewardId: null,
  },
  {
    id: "T002",
    type: "Redeem",
    amount: -100,
    date: "2025-07-19T15:30:00Z",
    description: "Redeemed Free Coffee",
    relatedRewardId: "R001",
  },
  {
    id: "T003",
    type: "Earn",
    amount: 75,
    date: "2025-07-18T11:45:00Z",
    description: "Purchase #12344",
    relatedRewardId: null,
  },
  {
    id: "T004",
    type: "Transfer",
    amount: -200,
    date: "2025-07-17T09:00:00Z",
    description: "Transferred to John Doe",
    relatedRewardId: null,
  },
  {
    id: "T005",
    type: "Earn",
    amount: 120,
    date: "2025-07-16T14:00:00Z",
    description: "Purchase #12343",
    relatedRewardId: null,
  },
  {
    id: "T006",
    type: "Redeem",
    amount: -300,
    date: "2025-07-15T18:00:00Z",
    description: "Redeemed 10% Off",
    relatedRewardId: "R002",
  },
];

export default function LoyaltyDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<LoyaltyUser>(initialMockUser);
  const [rewards, setRewards] = useState<LoyaltyReward[]>(initialMockRewards);
  const [transactions, setTransactions] = useState<TokenTransaction[]>(
    initialMockTransactions
  );
  const [loading, setLoading] = useState(true);

  // Simulate fetching initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const userData = await fetchUserLoyaltyData();
        setUser(userData.user);
        setRewards(userData.rewards);
        setTransactions(userData.transactions);
        toast.success("Loyalty data loaded!");
      } catch (error) {
        toast.error("Failed to load loyalty data.");
        console.error("Failed to load loyalty data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Simulate real-time updates (e.g., via WebSocket)
    const simulateRealtimeUpdate = setInterval(() => {
      const randomAmount = Math.floor(Math.random() * 50) + 10; // Earn 10-60 tokens
      const newBalance = user.tokenBalance + randomAmount;
      const newTransaction: TokenTransaction = {
        id: `T${Date.now()}`,
        type: "Earn",
        amount: randomAmount,
        date: new Date().toISOString(),
        description: "Simulated purchase",
        relatedRewardId: null,
      };

      setUser((prev) => ({ ...prev, tokenBalance: newBalance }));
      setTransactions((prev) => [newTransaction, ...prev]);
      toast.success(`+${randomAmount} tokens earned!`, { duration: 1500 });
    }, 30000); // Every 30 seconds

    return () => clearInterval(simulateRealtimeUpdate);
  }, []); // Empty dependency array to run once on mount

  const handleRedeemReward = async (rewardId: string, cost: number) => {
    if (user.tokenBalance < cost) {
      toast.error("Not enough tokens to redeem this reward.");
      return;
    }

    try {
      const updatedData = await redeemRewardApi(user.id, rewardId, cost);
      setUser(updatedData.user);
      setTransactions(updatedData.transactions);
      toast.success(
        `Successfully redeemed ${rewards.find((r) => r.id === rewardId)?.name}!`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to redeem reward.");
      console.error("Redemption error:", error);
    }
  };

  const handleTokenTransfer = async (recipient: string, amount: number) => {
    if (user.tokenBalance < amount) {
      toast.error("Not enough tokens for transfer.");
      return;
    }

    try {
      const updatedData = await transferTokensApi(user.id, recipient, amount);
      setUser(updatedData.user);
      setTransactions(updatedData.transactions);
      toast.success(
        `Successfully transferred ${amount} tokens to ${recipient}!`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to transfer tokens.");
      console.error("Transfer error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        Loading loyalty program...
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8">Loyalty Program</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="flex flex-wrap gap-2 md:gap-x-6 w-fit !h-fit p-1">
          <TabsTrigger value="overview">
            <DollarSign className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-2" /> Rewards
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="h-4 w-4 mr-2" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="transfer">
            <Send className="h-4 w-4 mr-2" /> Transfer
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TokenBalanceCard user={user} />
            <Card>
              <CardHeader>
                <CardTitle>How to Earn Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Earn 10 tokens for every $1 spent.</li>
                  <li>Receive bonus tokens for referring friends.</li>
                  <li>Participate in special promotions and events.</li>
                  <li>Complete surveys for extra tokens.</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  Next Tier:{" "}
                  <span className="text-purple-600">{user.nextTierName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Reach {user.nextTierName} tier to unlock:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
                  {user.nextTierBenefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <RewardsCatalog
            rewards={rewards}
            onRedeem={handleRedeemReward}
            userTokens={user.tokenBalance}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TokenTransactionHistory transactions={transactions} />
        </TabsContent>

        <TabsContent value="transfer" className="mt-6">
          <TokenTransferForm onTransfer={handleTokenTransfer} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <LoyaltyAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
