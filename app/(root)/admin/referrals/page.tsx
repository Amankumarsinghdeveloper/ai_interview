"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { AdminNav } from "@/components/admin-nav";

interface ReferralUser {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  referredBy: string;
  referralCount: number;
  credits: number;
}

interface ReferralUsage {
  userId: string;
  name: string;
  email: string;
  usedAt: string;
}

interface StandaloneReferral {
  id: string;
  code: string;
  createdAt: string;
  ownerId: string | null;
  ownerEmail: string | null;
  ownerName: string | null;
  usedCount: number;
  usedBy: ReferralUsage[];
  creditAmount: number;
}

export default function AdminReferralsPage() {
  const [users, setUsers] = useState<ReferralUser[]>([]);
  const [standaloneReferrals, setStandaloneReferrals] = useState<
    StandaloneReferral[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState<{
    code: string;
    link: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    creditAmount: "10",
    customCode: "",
  });
  const [selectedReferral, setSelectedReferral] =
    useState<StandaloneReferral | null>(null);
  const router = useRouter();

  // Search and pagination state for standalone referrals
  const [referralSearchQuery, setReferralSearchQuery] = useState("");
  const [referralCurrentPage, setReferralCurrentPage] = useState(1);

  // Search and pagination state for user referrals
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userCurrentPage, setUserCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    async function checkAdmin() {
      const user = await getCurrentUser();
      if (!user || user.email !== "amankumarsing956@gmail.com") {
        router.push("/");
      }
    }

    async function fetchReferralData() {
      try {
        setIsLoading(true);

        // Fetch user referrals
        const usersResponse = await fetch("/api/admin/referrals");
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch user referral data");
        }
        const usersData = await usersResponse.json();

        // Fetch standalone referrals
        const standaloneResponse = await fetch(
          "/api/admin/referrals/standalone"
        );
        if (!standaloneResponse.ok) {
          throw new Error("Failed to fetch standalone referral data");
        }
        const standaloneData = await standaloneResponse.json();

        if (usersData.success && standaloneData.success) {
          setUsers(usersData.data);
          setStandaloneReferrals(standaloneData.data);
        } else {
          setError(
            usersData.message || standaloneData.message || "Unknown error"
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
    fetchReferralData();
  }, [router]);

  // Reset to first page when search queries change
  useEffect(() => {
    setReferralCurrentPage(1);
  }, [referralSearchQuery]);

  useEffect(() => {
    setUserCurrentPage(1);
  }, [userSearchQuery]);

  // Filter standalone referrals based on search query
  const filteredStandaloneReferrals = useMemo(() => {
    if (!referralSearchQuery.trim()) return standaloneReferrals;

    const lowerCaseQuery = referralSearchQuery.toLowerCase();
    return standaloneReferrals.filter(
      (referral) =>
        referral.code?.toLowerCase().includes(lowerCaseQuery) ||
        referral.ownerEmail?.toLowerCase().includes(lowerCaseQuery) ||
        referral.ownerName?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [standaloneReferrals, referralSearchQuery]);

  // Calculate pagination for standalone referrals
  const referralTotalPages = Math.max(
    1,
    Math.ceil(filteredStandaloneReferrals.length / itemsPerPage)
  );
  const paginatedStandaloneReferrals = useMemo(() => {
    const startIndex = (referralCurrentPage - 1) * itemsPerPage;
    return filteredStandaloneReferrals.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredStandaloneReferrals, referralCurrentPage]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users;

    const lowerCaseQuery = userSearchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(lowerCaseQuery) ||
        user.email?.toLowerCase().includes(lowerCaseQuery) ||
        user.referralCode?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [users, userSearchQuery]);

  // Calculate pagination for users
  const userTotalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage)
  );
  const paginatedUsers = useMemo(() => {
    const startIndex = (userCurrentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, userCurrentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    if (!formData.customCode) {
      toast.error("Referral code is required");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await fetch("/api/admin/referrals/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          creditAmount: formData.creditAmount,
          customCode: formData.customCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to generate referral code"
        );
      }

      const data = await response.json();
      if (data.success) {
        setNewReferralCode(data.data);

        // Refresh the standalone referrals list
        const standaloneResponse = await fetch(
          "/api/admin/referrals/standalone"
        );
        if (standaloneResponse.ok) {
          const standaloneData = await standaloneResponse.json();
          if (standaloneData.success) {
            setStandaloneReferrals(standaloneData.data);
          }
        }

        toast.success("Referral code generated successfully");

        // Reset form
        setFormData({
          email: "",
          creditAmount: "10",
          customCode: "",
        });
      } else {
        toast.error(data.message || "Failed to generate referral code");
      }
    } catch (error) {
      console.error("Error generating referral:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate referral code"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy text");
    }
  };

  const viewReferralUsage = (referral: StandaloneReferral) => {
    setSelectedReferral(referral);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6 text-white">
          Referral Management
        </h1>
        <div className="flex justify-center">
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6 text-white">
          Referral Management
        </h1>
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Referral Management
      </h1>

      <AdminNav />

      {/* Generate Referral Code Section */}
      <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden mb-8 p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Generate Standalone Referral Code
        </h2>
        <p className="text-gray-400 mb-4">
          Create standalone referral codes that can be used by new users during
          signup to get bonus credits.
        </p>

        <form onSubmit={generateReferralCode} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                User Email (owner of this referral code)
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400">
                Enter the email of an existing user who will own this referral
                code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customCode" className="text-gray-300">
                Referral Code
              </Label>
              <Input
                id="customCode"
                name="customCode"
                type="text"
                value={formData.customCode}
                onChange={handleInputChange}
                placeholder="SUMMER2024"
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400">
                Enter a unique referral code for this promotion
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditAmount" className="text-gray-300">
                Bonus Credits
              </Label>
              <Input
                id="creditAmount"
                name="creditAmount"
                type="number"
                min="1"
                max="100"
                value={formData.creditAmount}
                onChange={handleInputChange}
                placeholder="10"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400">
                Number of bonus credits given to users who sign up with this
                code
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGenerating ? "Generating..." : "Generate Referral Code"}
          </Button>
        </form>

        {newReferralCode && (
          <div className="border border-green-700 bg-green-900/20 p-4 rounded-md mt-6">
            <h3 className="font-semibold text-green-400 mb-2">
              New Referral Code Generated
            </h3>

            <div className="mb-3">
              <p className="text-sm text-gray-300 mb-1">Referral Code:</p>
              <div className="flex gap-2">
                <Input
                  value={newReferralCode.code}
                  readOnly
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button
                  onClick={() => copyToClipboard(newReferralCode.code)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-200 hover:bg-gray-700"
                >
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-300 mb-1">Referral Link:</p>
              <div className="flex gap-2">
                <Input
                  value={newReferralCode.link}
                  readOnly
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button
                  onClick={() => copyToClipboard(newReferralCode.link)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-200 hover:bg-gray-700"
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Standalone Referral Codes Table */}
      <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden mb-8 border border-gray-800">
        <h2 className="text-xl font-semibold p-6 border-b border-gray-800 text-white">
          Standalone Referral Codes
        </h2>

        {/* Search Bar for Standalone Referrals */}
        <div className="p-6 pt-2 pb-2 border-b border-gray-800">
          <SearchInput
            placeholder="Search by code, owner name, or email..."
            value={referralSearchQuery}
            onChange={(e) => setReferralSearchQuery(e.target.value)}
          />
          <div className="mt-2 text-sm text-gray-400">
            Showing {filteredStandaloneReferrals.length}{" "}
            {filteredStandaloneReferrals.length === 1
              ? "referral code"
              : "referral codes"}
            {referralSearchQuery && ` for "${referralSearchQuery}"`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {paginatedStandaloneReferrals.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-400"
                  >
                    {referralSearchQuery
                      ? "No referral codes found matching your search"
                      : "No standalone referral codes generated yet"}
                  </td>
                </tr>
              ) : (
                paginatedStandaloneReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-200">
                          {referral.code}
                        </div>
                        <Button
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/api/referral?code=${referral.code}`
                            )
                          }
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 p-0 h-auto text-xs"
                        >
                          Copy Link
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200">
                          {referral.ownerName || "N/A"}
                        </span>
                        <span className="text-gray-400">
                          {referral.ownerEmail || "No owner"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(referral.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-300">
                        {referral.usedCount}{" "}
                        {referral.usedCount === 1 ? "user" : "users"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <span className="text-green-400">
                        +{referral.creditAmount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => viewReferralUsage(referral)}
                            variant="outline"
                            size="sm"
                            disabled={referral.usedCount === 0}
                            className="border-gray-700 text-gray-300 hover:bg-gray-800"
                          >
                            View Usage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl bg-gray-900 border-gray-800 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Referral Code Usage: {referral.code}
                            </DialogTitle>
                          </DialogHeader>

                          <div className="mt-4">
                            <div className="mb-4">
                              <p className="text-sm text-gray-400 mb-1">
                                Owner: {referral.ownerName} (
                                {referral.ownerEmail})
                              </p>
                              <p className="text-sm text-gray-400 mb-1">
                                Credit Amount:{" "}
                                <span className="text-green-400">
                                  +{referral.creditAmount}
                                </span>
                              </p>
                              <p className="text-sm text-gray-400">
                                Created:{" "}
                                {new Date(referral.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="border border-gray-800 rounded-md">
                              <table className="min-w-full divide-y divide-gray-800">
                                <thead className="bg-gray-800">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                      Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                      Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                      Used At
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                  {selectedReferral?.usedBy.map((usage, i) => (
                                    <tr
                                      key={i}
                                      className="hover:bg-gray-800/50"
                                    >
                                      <td className="px-4 py-3 text-sm text-gray-300">
                                        {usage.name}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-300">
                                        {usage.email}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-400">
                                        {new Date(
                                          usage.usedAt
                                        ).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}

                                  {selectedReferral?.usedBy.length === 0 && (
                                    <tr>
                                      <td
                                        colSpan={3}
                                        className="px-4 py-3 text-sm text-center text-gray-400"
                                      >
                                        No usage data found
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination for Standalone Referrals */}
        {filteredStandaloneReferrals.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-800">
            <Pagination
              currentPage={referralCurrentPage}
              totalPages={referralTotalPages}
              onPageChange={setReferralCurrentPage}
            />
          </div>
        )}
      </div>

      {/* User Referrals Table */}
      <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-800">
        <h2 className="text-xl font-semibold p-6 border-b border-gray-800 text-white">
          User Referrals
        </h2>

        {/* Search Bar for User Referrals */}
        <div className="p-6 pt-2 pb-2 border-b border-gray-800">
          <SearchInput
            placeholder="Search by user name, email, or referral code..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
          />
          <div className="mt-2 text-sm text-gray-400">
            Showing {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"}
            {userSearchQuery && ` for "${userSearchQuery}"`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Referral Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Referral Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Referred By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Credits
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-400"
                  >
                    {userSearchQuery
                      ? "No users found matching your search"
                      : "No referral data found"}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-200">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.referralCode || "None"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.referralCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.referredBy || "None"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-green-400">{user.credits}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination for User Referrals */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-800">
            <Pagination
              currentPage={userCurrentPage}
              totalPages={userTotalPages}
              onPageChange={setUserCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
