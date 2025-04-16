"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import * as firebaseAdmin from "firebase-admin";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email, photoURL } = params;
  const cookieStore = await cookies();
  const referralCode = cookieStore.get("referralCode")?.value;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      // If user already exists, just return success without an error
      return {
        success: true,
        message: "User already exists.",
      };
    }

    // Generate a unique referral code for this user
    const newReferralCode = uuidv4().substring(0, 8);

    // Default credit amount
    let credits = 15;
    let referredBy = null;
    let bonusAmount = 0;

    // If referred by someone, find the referrer
    if (referralCode) {
      // First check if it's a user's referral code
      const referrersQuery = await db
        .collection("users")
        .where("referralCode", "==", referralCode)
        .limit(1)
        .get();

      if (!referrersQuery.empty) {
        // It's a user referral
        const referrer = referrersQuery.docs[0];
        const referrerId = referrer.id;

        // Update the referrer's count
        await db
          .collection("users")
          .doc(referrerId)
          .update({
            referralCount: (referrer.data().referralCount || 0) + 1,
          });

        // Add bonus credits to the new user for being referred
        bonusAmount = 10;
        credits = 15 + bonusAmount; // 15 default + 10 bonus
        referredBy = referrerId;
      } else {
        // Check if it's a standalone referral code
        const standaloneQuery = await db
          .collection("standalone_referrals")
          .where("code", "==", referralCode)
          .where("used", "==", false)
          .limit(1)
          .get();

        if (!standaloneQuery.empty) {
          // It's a standalone referral code
          const standaloneRef = standaloneQuery.docs[0];
          const standaloneId = standaloneRef.id;
          const creditAmount = standaloneRef.data().creditAmount || 10;
          const ownerId = standaloneRef.data().ownerId;

          // Record data about the user who used this code
          const userInfo = {
            userId: uid,
            name,
            email,
            usedAt: new Date().toISOString(),
          };

          // Mark the standalone referral with user information and increment used count
          await db
            .collection("standalone_referrals")
            .doc(standaloneId)
            .update({
              usedCount: (standaloneRef.data().usedCount || 0) + 1,
              usedBy: [...(standaloneRef.data().usedBy || []), userInfo],
            });

          // If this is owned by a user, update their referral count
          if (ownerId) {
            await db
              .collection("users")
              .doc(ownerId)
              .update({
                referralCount: firebaseAdmin.firestore.FieldValue.increment(1),
              });
          }

          // Add bonus credits
          bonusAmount = creditAmount;
          credits = 15 + bonusAmount;
          referredBy = "standalone";
        }
      }
    }

    // Ensure credits are stored with 2 decimal places
    credits = parseFloat(credits.toFixed(2));

    // save user to db
    await db
      .collection("users")
      .doc(uid)
      .set({
        name,
        email,
        credits,
        referralCode: newReferralCode,
        referredBy,
        referralCount: 0,
        photoURL: photoURL || null,
        createdAt: new Date().toISOString(),
      });

    // Record initial credits as transaction
    await db.collection("creditTransactions").add({
      userId: uid,
      amount: parseFloat((15).toFixed(2)),
      type: "initial",
      timestamp: new Date(),
    });

    // Record referral bonus as a separate transaction if there was a bonus
    if (bonusAmount > 0) {
      await db.collection("creditTransactions").add({
        userId: uid,
        amount: parseFloat(bonusAmount.toFixed(2)),
        type: "referral_bonus",
        timestamp: new Date(),
        referralCode: referralCode,
      });
    }

    // Clear the referral cookie after use
    if (referralCode) {
      cookieStore.delete("referralCode");
    }

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    // Handle Firebase specific errors
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken, displayName, photoURL } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    // Update user profile information if it has changed
    if (displayName || photoURL !== undefined) {
      const userDoc = await db.collection("users").doc(userRecord.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData) {
          const updates: Record<string, string | null> = {};

          // Update name if provided and different
          if (displayName && displayName !== userData.name) {
            updates.name = displayName;
          }

          // Update photoURL if provided or if currently null/undefined
          if (photoURL !== undefined && photoURL !== userData.photoURL) {
            updates.photoURL = photoURL;
          }

          // Only update if we have changes
          if (Object.keys(updates).length > 0) {
            await db.collection("users").doc(userRecord.uid).update(updates);
          }
        }
      }
    }

    await setSessionCookie(idToken);

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error: unknown) {
    console.log("Sign in error:", error);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    const userData = userRecord.data();
    return {
      ...userData,
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
