"use client";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, Clock } from "lucide-react"; // Import Clock icon
import { cn } from "@/lib/utils";

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
  category: string;
  expiresAt?: string; // Add expiresAt
}

interface RewardCardProps {
  reward: Reward;
  onViewDetails: () => void;
  userTokens: number;
}

export default function RewardCard({
  reward,
  onViewDetails,
  userTokens,
}: RewardCardProps) {
  const canRedeem = userTokens >= reward.cost;

  const isExpiringSoon = reward.expiresAt
    ? new Date(reward.expiresAt).getTime() <
        Date.now() + 1000 * 60 * 60 * 24 * 7 && // Less than 7 days
      new Date(reward.expiresAt).getTime() > Date.now() // But not yet expired
    : false;

  const isExpired = reward.expiresAt
    ? new Date(reward.expiresAt).getTime() <= Date.now()
    : false;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
        <Badge className="absolute top-2 right-2 z-10">{reward.category}</Badge>
        {isExpired && (
          <Badge variant="destructive" className="absolute top-2 left-2 z-10">
            Expired
          </Badge>
        )}
        {isExpiringSoon && !isExpired && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 z-10 bg-orange-100 text-orange-600"
          >
            <Clock className="h-3 w-3 mr-1" /> Expiring Soon
          </Badge>
        )}
        <Image
          src={reward.image || "/placeholder.svg"}
          alt={reward.name}
          width={150}
          height={150}
          className="object-contain"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2">{reward.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {reward.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center text-purple-700 font-bold text-lg">
            <Gem className="h-5 w-5 mr-1" /> {reward.cost}
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={onViewDetails}
            disabled={!canRedeem || isExpired}
            className={cn(
              "bg-purple-600 hover:bg-purple-700 text-white",
              (!canRedeem || isExpired) &&
                "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
            )}
          >
            {isExpired ? "Expired" : canRedeem ? "Redeem" : "Not Enough Tokens"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
