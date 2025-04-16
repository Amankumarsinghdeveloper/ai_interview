import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

// GET /api/admin/tickets - Get all tickets (admin only)
export async function GET() {
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

    // Get all tickets
    const ticketsSnapshot = await db.collection("tickets").get();

    const tickets = await Promise.all(
      ticketsSnapshot.docs.map(async (doc) => {
        const ticketData = doc.data();

        // Get user info
        let userName = "";
        let userEmail = "";
        if (ticketData.userId) {
          try {
            const userDoc = await db
              .collection("users")
              .doc(ticketData.userId)
              .get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              userName = userData?.name || "";
              userEmail = userData?.email || "";
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }

        // Get the last message for this ticket
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
          userName,
          userEmail,
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
