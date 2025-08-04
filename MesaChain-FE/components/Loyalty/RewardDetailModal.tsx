"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Gem, Clock } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
  category: string;
  expiresAt?: string;
}

interface RewardDetailModalProps {
  reward: Reward;
  userTokens: number;
  onClose: () => void;
  onRedeem: () => void;
}

export default function RewardDetailModal({
  reward,
  userTokens,
  onClose,
  onRedeem,
}: RewardDetailModalProps) {
  const canRedeem = userTokens >= reward.cost;

  const isExpiringSoon = reward.expiresAt
    ? new Date(reward.expiresAt).getTime() <
        Date.now() + 1000 * 60 * 60 * 24 * 7 &&
      new Date(reward.expiresAt).getTime() > Date.now()
    : false;

  const isExpired = reward.expiresAt
    ? new Date(reward.expiresAt).getTime() <= Date.now()
    : false;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{reward.name}</DialogTitle>
          <DialogDescription>Details about this reward.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <Image
              src={reward.image || "/placeholder.svg"}
              alt={reward.name}
              width={200}
              height={200}
              className="object-contain rounded-md"
            />
          </div>
          <p className="text-sm text-gray-700">{reward.description}</p>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Cost:</span>
            <span className="flex items-center text-purple-700">
              <Gem className="h-5 w-5 mr-1" /> {reward.cost} Tokens
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Your Balance:</span>
            <span className="flex items-center">
              <Gem className="h-4 w-4 mr-1" /> {userTokens} Tokens
            </span>
          </div>
          {reward.expiresAt && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" /> Expires:{" "}
              {new Date(reward.expiresAt).toLocaleDateString()}
              {isExpiringSoon && !isExpired && (
                <span className="ml-2 text-orange-600 font-medium">
                  {" "}
                  (Expiring Soon!)
                </span>
              )}
              {isExpired && (
                <span className="ml-2 text-red-500 font-medium">
                  {" "}
                  (Expired)
                </span>
              )}
            </div>
          )}
          {!canRedeem && (
            <p className="text-red-500 text-sm mt-2">
              You do not have enough tokens to redeem this reward.
            </p>
          )}
          {isExpired && (
            <p className="text-red-500 text-sm mt-2">
              This reward has expired and cannot be redeemed.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onRedeem}
            disabled={!canRedeem || isExpired}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Confirm Redemption
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
