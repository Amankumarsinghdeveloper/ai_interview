"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define User type directly here since there might be issues with importing from types
export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  photoURL?: string;
}

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: "open" | "closed" | "customer-reply" | "support-reply";
  createdAt: string;
  updatedAt: string;
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

export interface TicketSystemClientProps {
  user: User;
}

function TicketSystemClient({ user }: TicketSystemClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  // Fetch user tickets
  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        const response = await fetch("/api/tickets");

        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }

        const data = await response.json();
        if (data.success) {
          setTickets(data.tickets);
        } else {
          toast.error(data.message || "Failed to load tickets");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while fetching tickets");
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  // Fetch ticket messages when a ticket is selected
  useEffect(() => {
    if (!selectedTicket) {
      setMessages([]);
      return;
    }

    async function fetchMessages() {
      try {
        setMessagesLoading(true);
        // Handle selectedTicket null check early to satisfy TypeScript
        if (!selectedTicket) {
          return;
        }

        const response = await fetch(
          `/api/tickets/${selectedTicket.id}/messages`
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

  const handleCreateTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) {
      toast.error("Please enter both subject and message");
      return;
    }

    try {
      setSubmittingTicket(true);
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: newTicketSubject,
          message: newTicketMessage,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Support ticket created successfully");
        setTickets([data.ticket, ...tickets]);
        setNewTicketSubject("");
        setNewTicketMessage("");
        setCreateTicketOpen(false);
      } else {
        toast.error(data.message || "Failed to create ticket");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating the ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !newMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setSubmittingReply(true);
      const response = await fetch(
        `/api/tickets/${selectedTicket.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newMessage,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
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
          status: "customer-reply",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">
          Your Support Tickets
        </h2>
        <Dialog open={createTicketOpen} onOpenChange={setCreateTicketOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Create New Support Ticket
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newTicketSubject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewTicketSubject(e.target.value)
                  }
                  placeholder="Enter ticket subject"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newTicketMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewTicketMessage(e.target.value)
                  }
                  placeholder="Describe your issue"
                  rows={5}
                  className="bg-gray-800 border-gray-700 text-white resize-none"
                />
              </div>
              <Button
                onClick={handleCreateTicket}
                disabled={submittingTicket}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {submittingTicket ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
          <h3 className="text-xl font-medium text-white mb-2">
            No Tickets Found
          </h3>
          <p className="text-gray-400 mb-6">
            You haven&apos;t created any support tickets yet.
          </p>
          <Button
            onClick={() => setCreateTicketOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create Your First Ticket
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1 border-r border-gray-800 pr-4 max-h-[600px] overflow-y-auto">
            <h3 className="text-lg font-medium text-white mb-4">
              Your Tickets
            </h3>
            <div className="space-y-3">
              {tickets.map((ticket) => (
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
                  <p className="text-xs text-gray-400 mb-1">
                    Created: {formatDate(ticket.createdAt)}
                  </p>
                  <p
                    className="text-sm text-gray-300 truncate"
                    title={ticket.lastMessage?.content || ""}
                  >
                    {ticket.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedTicket ? (
              <div className="space-y-4 h-full flex flex-col">
                <div className="border-b border-gray-800 pb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">
                      {selectedTicket.subject}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(
                        selectedTicket.status
                      )}`}
                    >
                      {getStatusText(selectedTicket.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Created: {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>

                <div className="flex-grow overflow-y-auto max-h-[400px] space-y-4">
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
                            ? "bg-blue-900/30 ml-4"
                            : "bg-purple-900/30 mr-4"
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
                                ? "You"
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
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => setNewMessage(e.target.value)}
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
              <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800 h-full flex flex-col justify-center items-center">
                <h3 className="text-xl font-medium text-white mb-4">
                  Select a Ticket
                </h3>
                <p className="text-gray-400">
                  Choose a ticket from the list to view its conversation
                  history.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketSystemClient;
