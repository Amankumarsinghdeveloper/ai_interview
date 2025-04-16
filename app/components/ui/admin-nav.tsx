"use client";

import { useRouter } from "next/navigation";

export function AdminNav() {
  const router = useRouter();

  return (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => router.push("/admin/users")}
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
      >
        User Management
      </button>
      <button
        onClick={() => router.push("/admin/tickets")}
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
      >
        Support Tickets
      </button>
      <button
        onClick={() => router.push("/admin/referrals")}
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
      >
        Referral Management
      </button>
      <button
        onClick={() => router.push("/admin/transactions")}
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
      >
        Transaction History
      </button>
    </div>
  );
}
