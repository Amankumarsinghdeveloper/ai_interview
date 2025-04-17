"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 4 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
  page?: number;
  searchQuery?: string;
}

export interface InterviewResult {
  interviews: Interview[];
  hasMore: boolean;
  nextCursor?: string;
}

export async function getInterviewsByUserIdList(
  userId: string,
  options?: {
    limit?: number;
    searchQuery?: string;
    startAfterId?: string;
  }
): Promise<InterviewResult | null> {
  try {
    const { limit = 10, searchQuery = "", startAfterId } = options || {};
    const fetchLimit = limit + 1;

    // 1) Base query
    let queryRef: FirebaseFirestore.Query = db
      .collection("interviews")
      .where("userId", "==", userId);

    // 2) Optional text filter on role & techstack
    if (searchQuery) {
      queryRef = queryRef
        .where("role", "==", searchQuery)
        .where("techstack", "array-contains", searchQuery);
    }

    // 3) Order and (optional) cursor
    queryRef = queryRef.orderBy("createdAt", "desc");
    if (startAfterId) {
      const lastSnap = await db
        .collection("interviews")
        .doc(startAfterId)
        .get();
      if (lastSnap.exists) {
        queryRef = queryRef.startAfter(lastSnap);
      }
    }

    // 4) Fetch one extra to detect “hasMore”
    const snapshot = await queryRef.limit(fetchLimit).get();

    // 5) Map to your Interview type
    const allDocs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];

    // 6) Determine if there’s another page
    const hasMore = allDocs.length > limit;
    const interviews = hasMore ? allDocs.slice(0, limit) : allDocs;

    // 7) Compute nextCursor (the last doc id of this batch)
    const nextCursor = hasMore ? snapshot.docs[limit].id : undefined;

    return { interviews, hasMore, nextCursor };
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return null;
  }
}

export async function getLatestInterviewsList(
  userId: string,
  options?: {
    limit?: number;
    searchQuery?: string;
    startAfterId?: string;
  }
): Promise<InterviewResult | null> {
  try {
    const { limit = 10, searchQuery = "", startAfterId } = options || {};
    const fetchLimit = limit + 1;

    // 1) Base Firestore query (no role/techstack filters here)
    let queryRef = db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .where("finalized", "==", true)
      .where("userId", "!=", userId);

    // 2) Cursor for pagination
    if (startAfterId) {
      const lastSnap = await db
        .collection("interviews")
        .doc(startAfterId)
        .get();
      if (lastSnap.exists) {
        queryRef = queryRef.startAfter(lastSnap);
      }
    }

    // 3) Fetch (one extra to detect hasMore)
    const snapshot = await queryRef.limit(fetchLimit).get();
    const all = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];

    // 4) Client‑side substring filter
    let filtered = all;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = all.filter((intr) => {
        const roleMatch =
          typeof intr.role === "string" && intr.role.toLowerCase().includes(q);

        const techMatch =
          Array.isArray(intr.techstack) &&
          intr.techstack.some(
            (t) => typeof t === "string" && t.toLowerCase().includes(q)
          );

        return roleMatch || techMatch;
      });
    }

    // 5) Determine pagination results
    const hasMore = filtered.length > limit;
    const interviews = hasMore ? filtered.slice(0, limit) : filtered;
    const nextCursor = hasMore ? snapshot.docs[limit].id : undefined;

    return { interviews, hasMore, nextCursor };
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return null;
  }
}
