import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function GET(request: NextRequest) {
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

    // Get all users with referral information
    const usersSnapshot = await db.collection("users").get();

    // Format the data
    const referralData = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        referralCode: data.referralCode || "",
        referredBy: data.referredBy || "",
        referralCount: data.referralCount || 0,
        credits: data.credits || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: referralData,
    });
  } catch (error) {
    console.error("Error fetching referral data:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching referral data" },
      { status: 500 }
    );
  }
}
