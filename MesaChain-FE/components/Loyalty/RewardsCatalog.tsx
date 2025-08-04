"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import RewardCard from "./RewardCard";
import RewardDetailModal from "./RewardDetailModal";

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
  category: string;
}

interface RewardsCatalogProps {
  rewards: Reward[];
  onRedeem: (rewardId: string, cost: number) => void;
  userTokens: number;
}

export default function RewardsCatalog({
  rewards,
  onRedeem,
  userTokens,
}: RewardsCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch =
      reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || reward.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    ...Array.from(new Set(rewards.map((r) => r.category))),
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Available Rewards</h2>
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            className="pl-10"
            placeholder="Search rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-6"
      >
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onViewDetails={() => setSelectedReward(reward)}
            userTokens={userTokens}
          />
        ))}
      </div>

      {selectedReward && (
        <RewardDetailModal
          reward={selectedReward}
          userTokens={userTokens}
          onClose={() => setSelectedReward(null)}
          onRedeem={() => {
            onRedeem(selectedReward.id, selectedReward.cost);
            setSelectedReward(null); // Close modal after redemption attempt
          }}
        />
      )}
    </div>
  );
}
