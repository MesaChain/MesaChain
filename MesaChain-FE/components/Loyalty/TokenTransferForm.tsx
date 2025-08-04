"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Assuming you have a Label component
import { Send } from "lucide-react";

interface TokenTransferFormProps {
  onTransfer: (recipient: string, amount: number) => void;
}

export default function TokenTransferForm({
  onTransfer,
}: TokenTransferFormProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number.parseFloat(amount);
    if (recipientAddress && !isNaN(parsedAmount) && parsedAmount > 0) {
      onTransfer(recipientAddress, parsedAmount);
      setRecipientAddress("");
      setAmount("");
    } else {
      alert("Please enter a valid recipient address and a positive amount.");
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Transfer Tokens</CardTitle>
        <CardDescription>
          Send your loyalty tokens to another MesaChain user.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="Enter recipient's address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (Tokens)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to transfer"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" /> Transfer Tokens
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
