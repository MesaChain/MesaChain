import type { TokenTransaction } from "@/types";

// Define types for mock data
export interface LoyaltyUser {
  id: string;
  name: string;
  tokenBalance: number;
  tier: string;
  tokensToNextTier: number;
  nextTierName: string;
  nextTierBenefits: string[];
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
  category: string;
  expiresAt?: string;
}

interface LoyaltyData {
  user: LoyaltyUser;
  rewards: LoyaltyReward[];
  transactions: TokenTransaction[];
}

let mockUser: LoyaltyUser = {
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

const mockRewards: LoyaltyReward[] = [
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

let mockTransactions: TokenTransaction[] = [
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

// --- Simulated API Calls ---

const simulateNetworkDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchUserLoyaltyData(): Promise<LoyaltyData> {
  await simulateNetworkDelay();
  return {
    user: { ...mockUser },
    rewards: [...mockRewards],
    transactions: [...mockTransactions],
  };
}

export async function redeemRewardApi(
  _userId: string,
  rewardId: string,
  cost: number
): Promise<LoyaltyData> {
  await simulateNetworkDelay();

  if (mockUser.tokenBalance < cost) {
    throw new Error("Insufficient tokens.");
  }

  const reward = mockRewards.find((r) => r.id === rewardId);
  if (!reward) {
    throw new Error("Reward not found.");
  }
  if (reward.expiresAt && new Date(reward.expiresAt).getTime() <= Date.now()) {
    throw new Error("Reward has expired.");
  }

  mockUser = { ...mockUser, tokenBalance: mockUser.tokenBalance - cost };
  const newTransaction: TokenTransaction = {
    id: `T${Date.now()}`,
    type: "Redeem",
    amount: -cost,
    date: new Date().toISOString(),
    description: `Redeemed ${reward.name}`,
    relatedRewardId: rewardId,
  };
  mockTransactions = [newTransaction, ...mockTransactions];

  return {
    user: { ...mockUser },
    rewards: [...mockRewards],
    transactions: [...mockTransactions],
  };
}

export async function transferTokensApi(
  _senderId: string,
  recipientAddress: string,
  amount: number
): Promise<LoyaltyData> {
  await simulateNetworkDelay();

  if (mockUser.tokenBalance < amount) {
    throw new Error("Insufficient tokens for transfer.");
  }

  // Simulate recipient validation (e.g., check if address exists)
  if (recipientAddress === "invalid_address") {
    throw new Error("Recipient address is invalid.");
  }

  mockUser = { ...mockUser, tokenBalance: mockUser.tokenBalance - amount };
  const newTransaction: TokenTransaction = {
    id: `T${Date.now()}`,
    type: "Transfer",
    amount: -amount,
    date: new Date().toISOString(),
    description: `Transferred to ${recipientAddress}`,
    relatedRewardId: null,
  };
  mockTransactions = [newTransaction, ...mockTransactions];

  return {
    user: { ...mockUser },
    rewards: [...mockRewards],
    transactions: [...mockTransactions],
  };
}
