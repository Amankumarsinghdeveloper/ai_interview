"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BuyCreditsFormProps {
  userId: string; // Kept for future reference but not used directly
  creditPrice: number;
}

const BuyCreditsForm = ({ creditPrice }: BuyCreditsFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageType, setMessageType] = useState<
    "success" | "error" | "pending" | null
  >(null);
  const [messageText, setMessageText] = useState<string>("");

  const predefinedAmounts = [5, 10, 20, 50, 100];

  // Check URL parameters for payment status
  useEffect(() => {
    const paymentStatus = searchParams.get("paymentStatus");
    const credits = searchParams.get("credits");
    const orderId = searchParams.get("orderId");
    const error = searchParams.get("error");

    if (paymentStatus === "success" && credits) {
      setMessageType("success");
      setMessageText(`Successfully purchased ${credits} credits!`);
      setShowMessage(true);

      // Clear URL parameters after 5 seconds
      setTimeout(() => {
        router.replace("/profile#credits");
      }, 5000);
    } else if (paymentStatus === "pending" && orderId) {
      setMessageType("pending");
      setMessageText(
        `Payment successful! Your credits will be added shortly. Order ID: ${orderId}`
      );
      setShowMessage(true);

      // Clear URL parameters after 5 seconds
      setTimeout(() => {
        router.replace("/profile#credits");
      }, 5000);
    } else if (paymentStatus === "failed") {
      setMessageType("error");
      setMessageText(`Payment failed: ${error || "Unknown error"}`);
      setShowMessage(true);

      // Clear URL parameters after 5 seconds
      setTimeout(() => {
        router.replace("/profile#credits");
      }, 5000);
    }
  }, [searchParams, router]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
    }
  };

  const handlePredefinedAmount = (value: number) => {
    setAmount(value);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 1) {
      toast.error("Please select a valid amount of credits");
      return;
    }

    setIsLoading(true);

    try {
      // Calculate total cost
      const totalCost = parseFloat((amount * creditPrice).toFixed(2));

      // Create order with Cashfree
      const response = await fetch("/api/payments/cashfree/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalCost,
          creditAmount: amount,
          usePaypal: false,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.message || "Failed to create payment order");
        setIsLoading(false);
        return;
      }

      // Redirect to Cashfree payment page
      window.location.href = result.data.paymentLink;
    } catch (error) {
      toast.error("An error occurred while processing your payment");
      console.error(error);
      setIsLoading(false);
    }
  };

  const totalCost = (amount * creditPrice).toFixed(2);

  return (
    <form className="space-y-6">
      {showMessage && messageType && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            messageType === "success"
              ? "bg-green-500/20 border border-green-500/30 text-green-300"
              : messageType === "pending"
              ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
              : "bg-red-500/20 border border-red-500/30 text-red-300"
          }`}
        >
          <p>{messageText}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="creditAmount"
          className="block mb-3 font-medium text-light-100"
        >
          Select Credit Amount
        </label>

        <div className="flex flex-wrap gap-2 mb-4">
          {predefinedAmounts.map((value) => (
            <Button
              key={value}
              type="button"
              onClick={() => handlePredefinedAmount(value)}
              variant={amount === value ? "default" : "outline"}
              size="sm"
            >
              {value} credits
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Input
            type="number"
            id="creditAmount"
            value={amount}
            onChange={handleAmountChange}
            min="1"
            className="h-12"
          />
          <span className="text-gray-400">credits</span>
        </div>
      </div>

      <div className="bg-dark-300 p-5 rounded-xl">
        <div className="flex justify-between">
          <span>Unit Price:</span>
          <span>$ {creditPrice} per credit</span>
        </div>
        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-700">
          <span>Total:</span>
          <span>$ {totalCost}</span>
        </div>
      </div>

      <Button
        type="submit"
        onClick={handlePayment}
        disabled={isLoading || amount < 1}
        className="w-full h-12"
        variant="default"
        size="lg"
      >
        {isLoading
          ? "Processing..."
          : `Buy ${amount} Credits for $ ${totalCost}`}
      </Button>

      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="relative h-5 w-24">
          <Image
            src="/images/cashfree-logo.svg"
            alt="Cashfree Payments"
            fill
            className="object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <span className="text-xs text-gray-500">
          Secured by Cashfree Payments
        </span>
      </div>
    </form>
  );
};

export default BuyCreditsForm;
