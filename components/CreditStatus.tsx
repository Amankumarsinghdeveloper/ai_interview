"use client";

import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface CreditStatusProps {
  credits: number;
  minuteCost: number;
  id?: string;
}

const CreditStatus = ({ credits, minuteCost, id }: CreditStatusProps) => {
  // Calculate minutes remaining (1 credit = 1 minute)
  const minutesRemaining = credits / minuteCost;

  // For the progress bar, let's show the percentage of credits relative to 60 minutes (1 hour)
  const percentage = Math.min(Math.round((minutesRemaining / 60) * 100), 100);

  return (
    <div className="bg-dark-200 rounded-lg p-6" id={id}>
      <h2 className="text-xl font-semibold mb-4">Credit Status</h2>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-32 h-32">
          <CircularProgressbar
            value={percentage}
            text={`${credits}`}
            styles={buildStyles({
              textSize: "22px",
              pathColor:
                credits > 10 ? "#4ade80" : credits > 5 ? "#fbbf24" : "#ef4444",
              textColor: "#ffffff",
              trailColor: "#1e293b",
            })}
          />
        </div>

        <div className="space-y-2">
          <p className="text-center md:text-left">
            <span className="text-lg font-medium">{credits} credits</span>
          </p>
          <p className="text-center md:text-left text-gray-400">
            {minutesRemaining} minutes of interview time
          </p>
          <p className="text-xs text-gray-500">
            Each interview session consumes credits based on duration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreditStatus;
