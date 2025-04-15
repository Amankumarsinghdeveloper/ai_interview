import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { userId, credits, operation } = body;

    if (!userId || credits === undefined || credits === null || !operation) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the user
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const currentCredits = userData?.credits || 0;
    let newCredits = currentCredits;
    let transactionAmount = 0;
    let transactionType = "";

    // Calculate new credits based on operation
    if (operation === "add") {
      newCredits = currentCredits + credits;
      transactionAmount = credits;
      transactionType = "admin_add";
    } else if (operation === "subtract") {
      newCredits = Math.max(0, currentCredits - credits); // Ensure credits don't go below 0
      transactionAmount = -credits;
      transactionType = "admin_deduct";
    } else if (operation === "set") {
      transactionAmount = credits - currentCredits;
      newCredits = Math.max(0, credits); // Ensure credits don't go below 0
      transactionType = "admin_set";
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid operation" },
        { status: 400 }
      );
    }

    // Update user's credits
    await db.collection("users").doc(userId).update({
      credits: newCredits,
    });

    // Record the transaction (only if there was a change in credits)
    if (transactionAmount !== 0) {
      await db.collection("creditTransactions").add({
        userId,
        amount: transactionAmount,
        type: transactionType,
        timestamp: new Date(),
        adminId: currentUser.id,
        adminEmail: currentUser.email,
        note: `Credits ${
          operation === "set"
            ? "set"
            : operation === "add"
            ? "added"
            : "deducted"
        } by admin.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `User credits ${
        operation === "set"
          ? "set"
          : operation === "add"
          ? "increased"
          : "decreased"
      } successfully`,
      newCredits,
    });
  } catch (error) {
    console.error("Error updating user credits:", error);
    return NextResponse.json(
      { success: false, message: "Error updating user credits" },
      { status: 500 }
    );
  }
}
