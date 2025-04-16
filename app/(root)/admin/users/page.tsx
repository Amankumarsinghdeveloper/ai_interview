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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { AdminNav } from "@/components/admin-nav";

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  referralCode: string;
  referredBy: string;
  referralCount: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    credits: "0",
    operation: "add",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function checkAdmin() {
      const user = await getCurrentUser();
      if (!user || user.email !== "amankumarsing956@gmail.com") {
        router.push("/");
      }
    }

    async function fetchUsers() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/users");

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();

        if (data.success) {
          setUsers(data.data);
        } else {
          setError(data.message || "Unknown error");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
    fetchUsers();
  }, [router]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(lowerCaseQuery) ||
        user.email?.toLowerCase().includes(lowerCaseQuery) ||
        user.referralCode?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [users, searchQuery]);

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage)
  );
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleCreditDialogOpen = (user: User) => {
    setSelectedUser(user);
    setFormData({
      credits: "0",
      operation: "add",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateUserCredits = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    const credits = parseInt(formData.credits);
    if (isNaN(credits) || credits < 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch("/api/admin/users/update-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          credits: credits,
          operation: formData.operation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user credits");
      }

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);

        // Update the user in the list
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id
              ? { ...user, credits: data.newCredits }
              : user
          )
        );

        // Close the dialog
        setSelectedUser(null);
      } else {
        toast.error(data.message || "Failed to update user credits");
      }
    } catch (error) {
      console.error("Error updating credits:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user credits"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-white">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-white">User Management</h1>

      <AdminNav />

      {/* Search Bar */}
      <div className="mb-6">
        <SearchInput
          placeholder="Search by name, email or referral code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <div className="mt-2 text-sm text-gray-400">
          Showing {filteredUsers.length}{" "}
          {filteredUsers.length === 1 ? "user" : "users"}
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      </div>

      <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Credits
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Referrals
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Referred By
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Joined
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-200">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="text-green-400 font-medium">
                      {user.credits}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.referralCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.referredBy || "None"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <Button
                      onClick={() => handleCreditDialogOpen(user)}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Manage Credits
                    </Button>
                  </td>
                </tr>
              ))}

              {paginatedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-400"
                  >
                    {searchQuery
                      ? "No users found matching your search"
                      : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Credits Dialog */}
      {selectedUser && (
        <Dialog
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
        >
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                Manage Credits: {selectedUser.name}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4">
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">
                  Email: {selectedUser.email}
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  Current Credits:{" "}
                  <span className="text-green-400 font-medium">
                    {selectedUser.credits}
                  </span>
                </p>
              </div>

              <form onSubmit={updateUserCredits} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operation" className="text-gray-300">
                      Operation
                    </Label>
                    <Select
                      value={formData.operation}
                      onValueChange={(value) =>
                        handleSelectChange("operation", value)
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select operation" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="add">Add Credits</SelectItem>
                        <SelectItem value="subtract">
                          Subtract Credits
                        </SelectItem>
                        <SelectItem value="set">Set Credits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credits" className="text-gray-300">
                      Credits Amount
                    </Label>
                    <Input
                      id="credits"
                      name="credits"
                      type="number"
                      min="0"
                      value={formData.credits}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      {formData.operation === "add"
                        ? "Amount of credits to add to the user's account"
                        : formData.operation === "subtract"
                        ? "Amount of credits to subtract from the user's account"
                        : "New total amount of credits for the user"}
                    </p>
                  </div>
                </div>

                <div className="bg-dark-300 p-4 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Current Credits:</span>
                    <span className="text-green-400">
                      {selectedUser.credits}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-700">
                    <span>New Credits:</span>
                    <span className="text-green-400">
                      {formData.operation === "add"
                        ? selectedUser.credits +
                          (parseInt(formData.credits) || 0)
                        : formData.operation === "subtract"
                        ? Math.max(
                            0,
                            selectedUser.credits -
                              (parseInt(formData.credits) || 0)
                          )
                        : Math.max(0, parseInt(formData.credits) || 0)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdating || parseInt(formData.credits) <= 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdating ? "Updating..." : "Update Credits"}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
