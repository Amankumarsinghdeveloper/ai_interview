import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    // Get the referral code from the URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { success: false, message: "No referral code provided" },
        { status: 400 }
      );
    }

    // First, check if this is a user's referral code
    const referrersQuery = await db
      .collection("users")
      .where("referralCode", "==", code)
      .limit(1)
      .get();

    let isValidCode = !referrersQuery.empty;

    // If not found in users, check standalone referral codes
    if (!isValidCode) {
      const standaloneQuery = await db
        .collection("standalone_referrals")
        .where("code", "==", code)
        .where("used", "==", false)
        .limit(1)
        .get();

      isValidCode = !standaloneQuery.empty;
    }

    if (!isValidCode) {
      return NextResponse.json(
        { success: false, message: "Invalid referral code" },
        { status: 400 }
      );
    }

    // Create a response that redirects to the sign-up page
    const response = NextResponse.redirect(new URL("/sign-up", request.url));

    // Set the referral code in cookies for 24 hours (86400 seconds)
    response.cookies.set("referralCode", code, {
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error processing referral:", error);
    return NextResponse.json(
      { success: false, message: "Error processing referral" },
      { status: 500 }
    );
  }
}
