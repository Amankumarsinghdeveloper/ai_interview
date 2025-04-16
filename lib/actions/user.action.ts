"use server";

import { db } from "@/firebase/admin";

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    if (!email) {
      return null;
    }

    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const userData = snapshot.docs[0].data();

    return {
      id: snapshot.docs[0].id,
      name: userData.name,
      email: userData.email,
      credits: userData.credits,
      phone: userData.phone || "",
      referralCode: userData.referralCode,
      referralCount: userData.referralCount,
      createdAt: userData.createdAt,
    };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    if (!userId) {
      return null;
    }

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();

    return {
      id: userDoc.id,
      name: userData?.name,
      email: userData?.email,
      credits: userData?.credits,
      phone: userData?.phone || "",
      referralCode: userData?.referralCode,
      referralCount: userData?.referralCount,
      createdAt: userData?.createdAt,
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}
