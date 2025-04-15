"use server";

import { db } from "@/firebase/admin";

// Constants for credits (used internally)
const DEFAULT_INITIAL_CREDITS = 15; // 15 minutes
const CREDIT_COST_PER_MINUTE = 1; // 1 credit = 1 minute
const CREDIT_PRICE_IN_RS = 4; // Rs. 4 per credit

// Async functions to return constants for client components
export async function getDefaultInitialCredits() {
  return DEFAULT_INITIAL_CREDITS;
}

export async function getCreditCostPerMinute() {
  return CREDIT_COST_PER_MINUTE;
}

export async function getCreditPriceInRs() {
  return CREDIT_PRICE_IN_RS;
}

// Initialize credits for a new user
export async function initializeUserCredits(userId: string) {
  try {
    await db.collection("users").doc(userId).update({
      credits: DEFAULT_INITIAL_CREDITS,
    });

    return {
      success: true,
      message: "Credits initialized successfully",
    };
  } catch (error) {
    console.error("Error initializing credits:", error);
    return {
      success: false,
      message: "Failed to initialize credits",
    };
  }
}

// Get user credits
export async function getUserCredits(userId: string) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: "User not found",
        credits: 0,
      };
    }

    const userData = userDoc.data();
    return {
      success: true,
      credits: userData?.credits || 0,
    };
  } catch (error) {
    console.error("Error getting user credits:", error);
    return {
      success: false,
      message: "Failed to get user credits",
      credits: 0,
    };
  }
}

// Add credits to user account
export async function addCredits(userId: string, amount: number) {
  try {
    // Get current credits
    const { credits, success } = await getUserCredits(userId);

    if (!success) {
      return {
        success: false,
        message: "Failed to get current credits",
      };
    }

    // Update with new credit amount
    await db
      .collection("users")
      .doc(userId)
      .update({
        credits: credits + amount,
      });

    // Record the transaction
    await db.collection("creditTransactions").add({
      userId,
      amount,
      type: "purchase",
      timestamp: new Date(),
    });

    return {
      success: true,
      message: `${amount} credits added successfully`,
      newTotal: credits + amount,
    };
  } catch (error) {
    console.error("Error adding credits:", error);
    return {
      success: false,
      message: "Failed to add credits",
    };
  }
}

// Deduct credits from user account
export async function deductCredits(userId: string, amount: number) {
  try {
    // Get current credits
    const { credits, success } = await getUserCredits(userId);

    if (!success) {
      return {
        success: false,
        message: "Failed to get current credits",
      };
    }

    // Check if user has enough credits
    if (credits < amount) {
      return {
        success: false,
        message: "Insufficient credits",
      };
    }

    // Update with new credit amount
    await db
      .collection("users")
      .doc(userId)
      .update({
        credits: credits - amount,
      });

    // Record the transaction
    await db.collection("creditTransactions").add({
      userId,
      amount: -amount,
      type: "usage",
      timestamp: new Date(),
    });

    return {
      success: true,
      message: `${amount} credits deducted successfully`,
      newTotal: credits - amount,
    };
  } catch (error) {
    console.error("Error deducting credits:", error);
    return {
      success: false,
      message: "Failed to deduct credits",
    };
  }
}

// Check if user has enough credits for a specific operation
export async function hasEnoughCredits(userId: string, requiredAmount: number) {
  try {
    const { credits, success } = await getUserCredits(userId);

    if (!success) {
      return {
        success: false,
        hasEnough: false,
        message: "Failed to get current credits",
      };
    }

    return {
      success: true,
      hasEnough: credits >= requiredAmount,
      availableCredits: credits,
    };
  } catch (error) {
    console.error("Error checking credits:", error);
    return {
      success: false,
      hasEnough: false,
      message: "Failed to check credits",
    };
  }
}

// Get credit transaction history
export async function getCreditTransactionHistory(userId: string) {
  try {
    const transactionsSnapshot = await db
      .collection("creditTransactions")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .get();

    const transactions = transactionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString(),
    }));

    return {
      success: true,
      transactions,
    };
  } catch (error) {
    console.error("Error getting transaction history:", error);
    return {
      success: false,
      message: "Failed to get transaction history",
      transactions: [],
    };
  }
}
