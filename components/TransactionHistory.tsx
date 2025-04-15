"use client";

import React from "react";
import dayjs from "dayjs";

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  timestamp: string;
  referralCode?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No transaction history available.
      </div>
    );
  }

  // Function to get a user-friendly transaction type label
  const getTransactionTypeLabel = (transaction: Transaction) => {
    switch (transaction.type) {
      case "purchase":
        return "Credit Purchase";
      case "usage":
        return "Credit Usage";
      case "initial":
        return "Initial Credits";
      case "referral_bonus":
        return "Referral Bonus";
      default:
        return (
          transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-b border-gray-800 hover:bg-dark-300 transition-colors"
            >
              <td className="px-4 py-3">
                {dayjs(transaction.timestamp).format("MMM D, YYYY h:mm A")}
              </td>
              <td className="px-4 py-3">
                {getTransactionTypeLabel(transaction)}
                {transaction.referralCode && (
                  <span className="text-xs block text-gray-400">
                    Code: {transaction.referralCode}
                  </span>
                )}
              </td>
              <td
                className={`px-4 py-3 text-right ${
                  transaction.amount > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount} credits
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
