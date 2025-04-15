"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReferralShareProps {
  referralCode: string;
}

export function ReferralShare({ referralCode }: ReferralShareProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${baseUrl}/api/referral?code=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy referral link");
    }
  };

  const shareViaEmail = () => {
    const subject = "Join me on PrepWise!";
    const body = `Hello,\n\nI wanted to invite you to PrepWise, a great platform for interview preparation.\n\nUse my referral link to sign up and get bonus credits: ${referralLink}\n\nBest,`;

    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="bg-gradient-to-br from-dark-200 to-dark-300 p-6 rounded-xl border border-light-800/10 space-y-4">
      <h3 className="text-xl font-semibold">Share Your Referral Link</h3>
      <p className="text-light-400 text-sm">
        Invite friends to join PrepWise. They&apos;ll receive 10 extra credits,
        and you&apos;ll earn rewards for each referral.
      </p>

      <div className="flex gap-2">
        <Input value={referralLink} readOnly className="bg-dark-300" />
        <Button
          onClick={copyToClipboard}
          className={copied ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <div className="pt-2">
        <Button onClick={shareViaEmail} variant="outline" className="w-full">
          Share via Email
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t border-light-800/10">
        <p className="text-light-400 text-sm">
          <span className="font-medium text-primary-100">
            Your Referral Stats:
          </span>
        </p>
        <p className="text-sm">
          Referral Code: <span className="font-semibold">{referralCode}</span>
        </p>
      </div>
    </div>
  );
}
