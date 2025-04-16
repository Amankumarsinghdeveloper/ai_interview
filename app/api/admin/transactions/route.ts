import { NextResponse } from "next/server";
import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Get the session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Only allow specific admin email(s)
    if (decodedClaims.email !== "amankumarsing956@gmail.com") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get all transactions from Firebase Firestore
    const transactionsSnapshot = await db
      .collection("transactions")
      .orderBy("createdAt", "desc")
      .get();

    // Transform the snapshot into a usable array
    const transactions = transactionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      // Convert Firestore Timestamps to ISO strings for JSON serialization
      const formattedData = {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt?.toDate?.()
          ? data.updatedAt.toDate().toISOString()
          : null,
        creditsAddedAt: data.creditsAddedAt?.toDate?.()
          ? data.creditsAddedAt.toDate().toISOString()
          : null,
        lastWebhookAt: data.lastWebhookAt?.toDate?.()
          ? data.lastWebhookAt.toDate().toISOString()
          : null,
      };
      return formattedData;
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transactions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
