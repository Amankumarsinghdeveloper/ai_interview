import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { v4 as uuidv4 } from "uuid";

// GET /api/tickets - Get all tickets for the current user
export async function GET() {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find all tickets for this user - modified to avoid needing a composite index
    const ticketsSnapshot = await db
      .collection("tickets")
      .where("userId", "==", currentUser.id)
      .get();

    // Process tickets and manually sort by updatedAt
    const tickets = await Promise.all(
      ticketsSnapshot.docs.map(async (doc) => {
        const ticketData = doc.data();

        // Get the last message for this ticket if it exists
        let lastMessage = null;
        try {
          const messagesSnapshot = await db
            .collection("ticket_messages")
            .where("ticketId", "==", doc.id)
            .get();

          // Manually sort the results since we can't use orderBy without the index
          if (!messagesSnapshot.empty) {
            const messages = messagesSnapshot.docs.map((doc) => doc.data());
            // Sort by timestamp in descending order
            messages.sort((a, b) => {
              return (
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
              );
            });

            // Get the first message (most recent)
            const messageData = messages[0];
            lastMessage = {
              content: messageData.content,
              senderName: messageData.senderName,
              senderEmail: messageData.senderEmail,
              timestamp: messageData.timestamp,
            };
          }
        } catch (error) {
          console.error("Error fetching messages for ticket:", doc.id, error);
          // Continue with the ticket, even if we couldn't fetch messages
        }

        return {
          id: doc.id,
          userId: ticketData.userId,
          subject: ticketData.subject,
          status: ticketData.status,
          createdAt: ticketData.createdAt,
          updatedAt: ticketData.updatedAt,
          lastMessage,
        };
      })
    );

    // Sort tickets by updatedAt date in descending order
    tickets.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return NextResponse.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching tickets" },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, message: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Create a new ticket
    const now = new Date().toISOString();
    const ticketRef = await db.collection("tickets").add({
      userId: currentUser.id,
      subject,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    // Add the first message
    const messageId = uuidv4();
    await db.collection("ticket_messages").add({
      id: messageId,
      ticketId: ticketRef.id,
      content: message,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderRole: "customer",
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticketRef.id,
        userId: currentUser.id,
        subject,
        status: "open",
        createdAt: now,
        updatedAt: now,
        lastMessage: {
          content: message,
          senderName: currentUser.name,
          senderEmail: currentUser.email,
          timestamp: now,
        },
      },
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { success: false, message: "Error creating ticket" },
      { status: 500 }
    );
  }
}
