import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

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

    // Get all standalone referral codes
    const referralsSnapshot = await db.collection("standalone_referrals").get();

    // Format the data
    const referrals = referralsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        code: data.code,
        createdAt: data.createdAt,
        ownerId: data.ownerId || null,
        ownerEmail: data.ownerEmail || null,
        ownerName: data.ownerName || null,
        usedCount: data.usedCount || 0,
        usedBy: data.usedBy || [],
        creditAmount: data.creditAmount || 10,
      };
    });

    return NextResponse.json({
      success: true,
      data: referrals,
    });
  } catch (error) {
    console.error("Error fetching standalone referral codes:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching standalone referral codes" },
      { status: 500 }
    );
  }
}
