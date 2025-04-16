import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function GET() {
  try {
    // Test if we can access Firebase collections
    const collectionsSnapshot = await db.listCollections();
    const collections = collectionsSnapshot.map((collection) => collection.id);

    return NextResponse.json({
      success: true,
      message: "Firebase connection successful",
      collections,
    });
  } catch (error) {
    console.error("Firebase connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error connecting to Firebase",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
