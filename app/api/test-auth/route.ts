import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    // Get all cookies
    const cookiesList = await cookies();

    // Check for session cookie
    const sessionCookie = cookiesList.get("session")?.value;
    const altSessionCookie = cookiesList.get("__session")?.value;

    // List all cookies for debugging
    const allCookies = {};
    for (const cookie of cookiesList.getAll()) {
      allCookies[cookie.name] = cookie.value;
    }

    if (!sessionCookie && !altSessionCookie) {
      return NextResponse.json({
        status: "error",
        message: "No session cookie found",
        cookies: allCookies,
      });
    }

    // Try to verify the session
    try {
      // Try the primary cookie first
      if (sessionCookie) {
        const decodedClaims = await auth.verifySessionCookie(
          sessionCookie,
          true
        );
        return NextResponse.json({
          status: "success",
          message: "Successfully authenticated with 'session' cookie",
          user: {
            uid: decodedClaims.uid,
            email: decodedClaims.email,
            authenticated: true,
          },
        });
      }

      // Try the alternative cookie if primary wasn't found
      if (altSessionCookie) {
        const decodedClaims = await auth.verifySessionCookie(
          altSessionCookie,
          true
        );
        return NextResponse.json({
          status: "success",
          message: "Successfully authenticated with '__session' cookie",
          user: {
            uid: decodedClaims.uid,
            email: decodedClaims.email,
            authenticated: true,
          },
        });
      }
    } catch (verifyError) {
      return NextResponse.json({
        status: "error",
        message: "Invalid session cookie",
        error: (verifyError as Error).message,
        cookies: allCookies,
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Server error during authentication",
      error: (error as Error).message,
    });
  }
}
