"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { AdminNav } from "@/components/admin-nav";

interface Transaction {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountUSD: number;
  amountINR: number;
  creditAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  environment: string;
  paymentDetails?: Record<string, unknown>;
  creditsAdded?: number;
  creditsAddedAt?: string;
  errorMessage?: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
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

    async function fetchTransactions() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/transactions");

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();

        if (data.success) {
          setTransactions(data.data);
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
    fetchTransactions();
  }, [router]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return transactions.filter(
      (transaction) =>
        transaction.orderId?.toLowerCase().includes(lowerCaseQuery) ||
        transaction.userName?.toLowerCase().includes(lowerCaseQuery) ||
        transaction.userEmail?.toLowerCase().includes(lowerCaseQuery) ||
        transaction.status?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [transactions, searchQuery]);

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / itemsPerPage)
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Get status color based on transaction status
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "text-green-400";
      case "PAID":
        return "text-blue-400";
      case "CREATED":
      case "PENDING_PAYMENT":
      case "PROCESSING":
      case "PROCESSING_VERIFICATION":
        return "text-yellow-400";
      case "FAILED":
      case "VERIFICATION_FAILED":
      case "PAYMENT_COMPLETED_CREDIT_FAILED":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // Open transaction details dialog
  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-white">Loading transactions...</p>
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
      <h1 className="text-2xl font-bold mb-6 text-white">
        Transaction History
      </h1>

      <AdminNav />

      {/* Search Bar */}
      <div className="mb-6">
        <SearchInput
          placeholder="Search by order ID, user name, email or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <div className="mt-2 text-sm text-gray-400">
          Showing {filteredTransactions.length}{" "}
          {filteredTransactions.length === 1 ? "transaction" : "transactions"}
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
                  Order ID
                </th>
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
                  Amount
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
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Date
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
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    {searchQuery
                      ? "No transactions found matching your search"
                      : "No transactions found"}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-200">
                          {transaction.userName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {transaction.userEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-300">
                          ${transaction.amountUSD?.toFixed(2) || "N/A"} USD
                        </div>
                        <div className="text-sm text-gray-400">
                          ₹{transaction.amountINR?.toFixed(2) || "N/A"} INR
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-green-400 font-medium">
                        {transaction.creditAmount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`${getStatusColor(
                          transaction.status
                        )} font-medium`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewTransactionDetails(transaction)}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Transaction Details Dialog */}
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      >
        <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-400">Order ID</h3>
                  <p className="mt-1 text-white">
                    {selectedTransaction.orderId}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">Status</h3>
                  <p
                    className={`mt-1 ${getStatusColor(
                      selectedTransaction.status
                    )}`}
                  >
                    {selectedTransaction.status}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">User</h3>
                  <p className="mt-1 text-white">
                    {selectedTransaction.userName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {selectedTransaction.userEmail}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">User ID</h3>
                  <p className="mt-1 text-white">
                    {selectedTransaction.userId}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">Amount (USD)</h3>
                  <p className="mt-1 text-white">
                    ${selectedTransaction.amountUSD?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">Amount (INR)</h3>
                  <p className="mt-1 text-white">
                    ₹{selectedTransaction.amountINR?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">Credits</h3>
                  <p className="mt-1 text-green-400 font-medium">
                    {selectedTransaction.creditAmount} credits
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">Environment</h3>
                  <p className="mt-1 text-white">
                    {selectedTransaction.environment}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">Created At</h3>
                  <p className="mt-1 text-white">
                    {formatDate(selectedTransaction.createdAt)}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400">Updated At</h3>
                  <p className="mt-1 text-white">
                    {formatDate(selectedTransaction.updatedAt)}
                  </p>
                </div>
                {selectedTransaction.creditsAddedAt && (
                  <div>
                    <h3 className="font-medium text-gray-400">
                      Credits Added At
                    </h3>
                    <p className="mt-1 text-white">
                      {formatDate(selectedTransaction.creditsAddedAt)}
                    </p>
                  </div>
                )}
                {selectedTransaction.errorMessage && (
                  <div className="col-span-2">
                    <h3 className="font-medium text-gray-400">Error Message</h3>
                    <p className="mt-1 text-red-400">
                      {selectedTransaction.errorMessage}
                    </p>
                  </div>
                )}
              </div>

              {selectedTransaction.paymentDetails && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-400 mb-2">
                    Payment Details
                  </h3>
                  <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto text-xs text-gray-300">
                    {JSON.stringify(
                      selectedTransaction.paymentDetails,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
