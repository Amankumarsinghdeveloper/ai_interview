import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { v4 as uuidv4 } from "uuid";

// GET /api/tickets/:id/messages - Get all messages for a ticket
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params to fix Next.js warning
    const { id } = await params;
    const ticketId = id;

    // Check if the ticket exists and belongs to the user
    const ticketDoc = await db.collection("tickets").doc(ticketId).get();

    if (!ticketDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    const ticketData = ticketDoc.data();

    // Only allow access to tickets owned by the user or admin
    if (
      ticketData?.userId !== currentUser.id &&
      currentUser.email !== "amankumarsing956@gmail.com"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all messages for this ticket
    const messagesSnapshot = await db
      .collection("ticket_messages")
      .where("ticketId", "==", ticketId)
      .get();

    // Get the messages and sort them manually
    const messages = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        ticketId: data.ticketId,
        content: data.content,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        senderRole: data.senderRole,
        timestamp: data.timestamp,
      };
    });

    // Sort messages by timestamp in ascending order
    messages.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching messages" },
      { status: 500 }
    );
  }
}

// POST /api/tickets/:id/messages - Add a message to a ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params to fix Next.js warning
    const { id } = await params;
    const ticketId = id;

    // Check if the ticket exists and belongs to the user
    const ticketDoc = await db.collection("tickets").doc(ticketId).get();

    if (!ticketDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    const ticketData = ticketDoc.data();

    // Only allow access to tickets owned by the user or admin
    const isAdmin = currentUser.email === "amankumarsing956@gmail.com";
    if (ticketData?.userId !== currentUser.id && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Message content is required" },
        { status: 400 }
      );
    }

    // Determine the sender role
    const senderRole = isAdmin ? "support" : "customer";

    // Create a new message
    const now = new Date().toISOString();
    const messageId = uuidv4();

    await db.collection("ticket_messages").add({
      id: messageId,
      ticketId,
      content,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderRole,
      timestamp: now,
    });

    // Update the ticket status and updatedAt
    const newStatus =
      senderRole === "customer" ? "customer-reply" : "support-reply";
    await db.collection("tickets").doc(ticketId).update({
      status: newStatus,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: {
        id: messageId,
        ticketId,
        content,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        senderRole,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { success: false, message: "Error adding message" },
      { status: 500 }
    );
  }
}
