import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Assuming you have a Progress component
import { Gem } from "lucide-react";

interface UserData {
  tokenBalance: number;
  tier: string;
  tokensToNextTier: number;
}

interface TokenBalanceCardProps {
  user: UserData;
}

export default function TokenBalanceCard({ user }: TokenBalanceCardProps) {
  const progressValue =
    (user.tokenBalance / (user.tokenBalance + user.tokensToNextTier)) * 100;

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Your Token Balance
        </CardTitle>
        <Gem className="h-4 w-4 text-purple-600" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-purple-700">
          {user.tokenBalance}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Current Tier:{" "}
          <span className="font-semibold text-purple-600">{user.tier}</span>
        </p>
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-1">Progress to next tier:</p>
          <Progress
            value={progressValue}
            className="h-2 bg-purple-200 [&>div]:bg-purple-600"
          />

          <p className="text-xs text-gray-500 mt-1">
            {user.tokensToNextTier > 0
              ? `${user.tokensToNextTier} tokens to ${
                  user.tier === "Gold" ? "Platinum" : "next tier"
                }`
              : "You are at the highest tier!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
