"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: "open" | "closed" | "customer-reply" | "support-reply";
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
  lastMessage?: {
    content: string;
    senderName: string;
    senderEmail: string;
    timestamp: string;
  };
}

interface Message {
  id: string;
  ticketId: string;
  content: string;
  senderName: string;
  senderEmail: string;
  senderRole: "customer" | "support";
  timestamp: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    async function checkAdmin() {
      const user = await getCurrentUser();
      if (!user || user.email !== "amankumarsing956@gmail.com") {
        router.push("/");
        toast.error("Unauthorized access");
      }
    }

    async function fetchTickets() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/tickets");

        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }

        const data = await response.json();

        if (data.success) {
          setTickets(data.tickets);
        } else {
          toast.error(data.message || "Unknown error");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
    fetchTickets();
  }, [router]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Fetch ticket messages when a ticket is selected
  useEffect(() => {
    if (!selectedTicket) {
      setMessages([]);
      return;
    }

    async function fetchMessages() {
      try {
        setMessagesLoading(true);
        if (!selectedTicket) {
          return;
        }

        const response = await fetch(
          `/api/admin/tickets/${selectedTicket.id}/messages`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
        } else {
          toast.error(data.message || "Failed to load messages");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while fetching messages");
      } finally {
        setMessagesLoading(false);
      }
    }

    fetchMessages();
  }, [selectedTicket]);

  const handleSendReply = async () => {
    if (!selectedTicket || !newMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setSubmittingReply(true);
      const response = await fetch(
        `/api/admin/tickets/${selectedTicket.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage("");

        // Update the selected ticket status
        const updatedTicket: Ticket = {
          ...selectedTicket,
          status: "support-reply",
          updatedAt: new Date().toISOString(),
          lastMessage: {
            content: data.message.content,
            senderName: data.message.senderName,
            senderEmail: data.message.senderEmail,
            timestamp: data.message.timestamp,
          },
        };
        setSelectedTicket(updatedTicket);

        // Update the tickets list
        setTickets(
          tickets.map((ticket) =>
            ticket.id === selectedTicket.id ? updatedTicket : ticket
          )
        );
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while sending your message");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCloseTicket = async (ticket: Ticket) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticket.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "closed",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update ticket status");
      }

      const data = await response.json();
      if (data.success) {
        // Update the tickets list
        setTickets(
          tickets.map((t) =>
            t.id === ticket.id ? { ...t, status: "closed" as const } : t
          )
        );

        // Update the selected ticket if it's the same one
        if (selectedTicket?.id === ticket.id) {
          setSelectedTicket({ ...selectedTicket, status: "closed" as const });
        }

        toast.success("Ticket closed successfully");
      } else {
        toast.error(data.message || "Failed to close ticket");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while closing the ticket");
    }
  };

  const handleReopenTicket = async (ticket: Ticket) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticket.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "open",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update ticket status");
      }

      const data = await response.json();
      if (data.success) {
        // Update the tickets list
        setTickets(
          tickets.map((t) =>
            t.id === ticket.id ? { ...t, status: "open" as const } : t
          )
        );

        // Update the selected ticket if it's the same one
        if (selectedTicket?.id === ticket.id) {
          setSelectedTicket({ ...selectedTicket, status: "open" as const });
        }

        toast.success("Ticket reopened successfully");
      } else {
        toast.error(data.message || "Failed to reopen ticket");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while reopening the ticket");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status badge color
  const getStatusColor = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "closed":
        return "bg-gray-500";
      case "customer-reply":
        return "bg-purple-500";
      case "support-reply":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get status display text
  const getStatusText = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return "Open";
      case "closed":
        return "Closed";
      case "customer-reply":
        return "Customer Reply";
      case "support-reply":
        return "Support Reply";
      default:
        return "Unknown";
    }
  };

  // Filter tickets by search and status
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginate tickets
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  return (
    <div className="container mx-auto py-10 px-4 flex flex-col max-w-7xl">
      <header className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-800 mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Support Tickets
        </h1>
      </header>

      <AdminNav />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="mb-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="min-w-[150px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="customer-reply">
                      Customer Reply
                    </SelectItem>
                    <SelectItem value="support-reply">Support Reply</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : paginatedTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No tickets found matching your criteria.
              </div>
            ) : (
              <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2">
                {paginatedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`cursor-pointer p-3 rounded-lg border ${
                      selectedTicket?.id === ticket.id
                        ? "bg-gray-800 border-blue-500"
                        : "bg-gray-900 border-gray-800 hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4
                        className="font-medium text-white truncate"
                        title={ticket.subject}
                      >
                        {ticket.subject}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusText(ticket.status)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1 flex justify-between">
                      <span>{ticket.userEmail}</span>
                      <span>{formatDate(ticket.updatedAt)}</span>
                    </div>
                    <p
                      className="text-sm text-gray-300 truncate"
                      title={ticket.lastMessage?.content || ""}
                    >
                      {ticket.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-2/3 bg-gray-900 rounded-lg border border-gray-800 p-4">
          {selectedTicket ? (
            <div className="space-y-4 h-[700px] flex flex-col">
              <div className="border-b border-gray-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {selectedTicket.subject}
                    </h3>
                    <div className="flex flex-wrap gap-2 items-center text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-white ${getStatusColor(
                          selectedTicket.status
                        )}`}
                      >
                        {getStatusText(selectedTicket.status)}
                      </span>
                      <span className="text-gray-400">
                        From:{" "}
                        <span className="text-gray-300">
                          {selectedTicket.userEmail}
                        </span>
                      </span>
                      <span className="text-gray-400">
                        Created:{" "}
                        <span className="text-gray-300">
                          {formatDate(selectedTicket.createdAt)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div>
                    {selectedTicket.status === "closed" ? (
                      <Button
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                        onClick={() => handleReopenTicket(selectedTicket)}
                      >
                        Reopen Ticket
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-red-700 text-red-300 hover:text-white hover:bg-red-900"
                        onClick={() => handleCloseTicket(selectedTicket)}
                      >
                        Close Ticket
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {messagesLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    No messages in this ticket yet.
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.senderRole === "customer"
                          ? "bg-blue-900/30"
                          : "bg-purple-900/30"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-white">
                            {message.senderName}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            (
                            {message.senderRole === "customer"
                              ? "Customer"
                              : "Support Team"}
                            )
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-200 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {selectedTicket.status !== "closed" && (
                <div className="mt-auto border-t border-gray-800 pt-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-grow">
                      <Textarea
                        value={newMessage}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setNewMessage(e.target.value)
                        }
                        placeholder="Type your reply here..."
                        rows={3}
                        className="bg-gray-800 border-gray-700 text-white resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleSendReply}
                      disabled={submittingReply || !newMessage.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {submittingReply ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[700px] flex flex-col justify-center items-center">
              <h3 className="text-xl font-medium text-white mb-4">
                Select a Ticket
              </h3>
              <p className="text-gray-400 text-center max-w-md">
                Choose a ticket from the list to view its details and
                conversation history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
