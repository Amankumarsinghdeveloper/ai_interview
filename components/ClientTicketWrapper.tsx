"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import TicketSystemClient with SSR disabled
const TicketSystemClient = dynamic(() => import("./TicketSystemClient"), {
  ssr: false,
  loading: () => <p className="text-center p-4">Loading ticket system...</p>,
});

// Match the User interface from the TicketSystemClient component
export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  photoURL?: string;
  displayName?: string;
  role?: string;
}

interface ClientTicketWrapperProps {
  userData: string;
}

export default function ClientTicketWrapper({
  userData,
}: ClientTicketWrapperProps) {
  // Use state to handle serialized user data
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      if (userData) {
        const parsedUser = JSON.parse(userData);

        // Make sure required properties exist with default values if needed
        const processedUser = {
          ...parsedUser,
          // Use displayName as name if name doesn't exist
          name: parsedUser.name || parsedUser.displayName || "User",
          // Ensure required properties exist
          credits: parsedUser.credits || 0,
        };

        setUser(processedUser);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, [userData]);

  if (!user) {
    return <p className="text-center p-4">Preparing ticket system...</p>;
  }

  return <TicketSystemClient user={user} />;
}
