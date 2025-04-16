import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { v4 as uuidv4 } from "uuid";

// GET /api/admin/tickets/:id/messages - Get all messages for a ticket (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user to check if they are an admin
    const currentUser = await getCurrentUser();

    // Check if the user is authorized (admin)
    if (!currentUser || currentUser.email !== "amankumarsing956@gmail.com") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params to fix Next.js warning
    const { id } = await params;
    const ticketId = id;

    // Check if the ticket exists
    const ticketDoc = await db.collection("tickets").doc(ticketId).get();

    if (!ticketDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
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

// POST /api/admin/tickets/:id/messages - Add a message to a ticket (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user to check if they are an admin
    const currentUser = await getCurrentUser();

    // Check if the user is authorized (admin)
    if (!currentUser || currentUser.email !== "amankumarsing956@gmail.com") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params to fix Next.js warning
    const { id } = await params;
    const ticketId = id;

    // Check if the ticket exists
    const ticketDoc = await db.collection("tickets").doc(ticketId).get();

    if (!ticketDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
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

    // Create a new message
    const now = new Date().toISOString();
    const messageId = uuidv4();

    await db.collection("ticket_messages").add({
      id: messageId,
      ticketId,
      content,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderRole: "support",
      timestamp: now,
    });

    // Update the ticket status and updatedAt
    await db.collection("tickets").doc(ticketId).update({
      status: "support-reply",
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
        senderRole: "support",
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
