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

    // Parse the request body to get parameters
    const { email, creditAmount, customCode } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!customCode || !customCode.trim()) {
      return NextResponse.json(
        { success: false, message: "Custom referral code is required" },
        { status: 400 }
      );
    }

    // Check if the user exists
    const userQuery = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userQuery.empty) {
      return NextResponse.json(
        { success: false, message: "User with this email does not exist" },
        { status: 400 }
      );
    }

    // Check if custom code already exists in standalone referrals
    const existingCodeQuery = await db
      .collection("standalone_referrals")
      .where("code", "==", customCode)
      .limit(1)
      .get();

    if (!existingCodeQuery.empty) {
      return NextResponse.json(
        { success: false, message: "This referral code already exists" },
        { status: 400 }
      );
    }

    // Check if custom code already exists in user referrals
    const existingUserCodeQuery = await db
      .collection("users")
      .where("referralCode", "==", customCode)
      .limit(1)
      .get();

    if (!existingUserCodeQuery.empty) {
      return NextResponse.json(
        {
          success: false,
          message: "This referral code is already used by a user",
        },
        { status: 400 }
      );
    }

    const ownerUser = userQuery.docs[0];
    const ownerId = ownerUser.id;
    const ownerName = ownerUser.data().name || email;

    // Use the provided custom code
    const referralCode = customCode;

    // Add to standalone_referrals collection
    await db.collection("standalone_referrals").add({
      code: referralCode,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      ownerId: ownerId,
      ownerEmail: email,
      ownerName: ownerName,
      used: false,
      usedCount: 0,
      usedBy: [],
      creditAmount: parseInt(creditAmount) || 10, // Default bonus amount is 10 if not specified
    });

    // Generate the full referral link
    const baseUrl = request.headers.get("origin") || "http://localhost:3000";
    const referralLink = `${baseUrl}/api/referral?code=${referralCode}`;

    return NextResponse.json({
      success: true,
      data: {
        code: referralCode,
        link: referralLink,
        ownerEmail: email,
        ownerName: ownerName,
        creditAmount: parseInt(creditAmount) || 10,
      },
    });
  } catch (error) {
    console.error("Error generating referral code:", error);
    return NextResponse.json(
      { success: false, message: "Error generating referral code" },
      { status: 500 }
    );
  }
}
