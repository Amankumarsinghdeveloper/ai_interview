"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addCredits } from "@/lib/actions/credit.action";

interface BuyCreditsFormProps {
  userId: string;
  creditPrice: number;
}

const BuyCreditsForm = ({ userId, creditPrice }: BuyCreditsFormProps) => {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const predefinedAmounts = [5, 10, 20, 50, 100];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
    }
  };

  const handlePredefinedAmount = (value: number) => {
    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 1) {
      toast.error("Please select a valid amount of credits");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate payment process (in a real app, integrate with payment gateway)
      // For demo purposes, we'll just wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add credits to the user's account
      const result = await addCredits(userId, amount);

      if (result.success) {
        toast.success(`Successfully purchased ${amount} credits!`);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to purchase credits");
      }
    } catch (error) {
      toast.error("An error occurred while processing your payment");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCost = amount * creditPrice;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="creditAmount" className="block mb-2 font-medium">
          Select Credit Amount
        </label>

        <div className="flex flex-wrap gap-2 mb-4">
          {predefinedAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handlePredefinedAmount(value)}
              className={`px-4 py-2 rounded-md transition-colors ${
                amount === value
                  ? "bg-primary-500 text-white"
                  : "bg-dark-300 text-gray-300 hover:bg-dark-400"
              }`}
            >
              {value} credits
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <input
            type="number"
            id="creditAmount"
            value={amount}
            onChange={handleAmountChange}
            min="1"
            className="flex h-10 w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="text-gray-400">credits</span>
        </div>
      </div>

      <div className="bg-dark-300 p-4 rounded-md">
        <div className="flex justify-between">
          <span>Unit Price:</span>
          <span>Rs. {creditPrice} per credit</span>
        </div>
        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-700">
          <span>Total:</span>
          <span>Rs. {totalCost}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || amount < 1}
        className="w-full bg-primary-500 text-white font-medium py-2 px-4 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? "Processing..."
          : `Buy ${amount} Credits for Rs. ${totalCost}`}
      </button>

      <p className="text-xs text-gray-500 mt-2">
        This is a simulated payment for demonstration purposes. In a production
        environment, this would connect to a payment gateway.
      </p>
    </form>
  );
};

export default BuyCreditsForm;
