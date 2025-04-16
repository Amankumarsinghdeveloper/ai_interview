import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

// PATCH /api/admin/tickets/:id/status - Update ticket status (admin only)
export async function PATCH(
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
    const { status } = body;

    if (
      !status ||
      !["open", "closed", "customer-reply", "support-reply"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update the ticket status and updatedAt
    const now = new Date().toISOString();
    await db.collection("tickets").doc(ticketId).update({
      status,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Ticket status updated successfully",
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return NextResponse.json(
      { success: false, message: "Error updating ticket status" },
      { status: 500 }
    );
  }
}
