"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { hasEnoughCredits, deductCredits } from "@/lib/actions/credit.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);

  // Track interview duration for credit deduction
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  // Add timer to check credits during call
  const creditCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxCallDurationInMinutes = useRef<number>(0);
  // Track last credit deduction timestamp
  const lastDeductionTimeRef = useRef<number | null>(null);
  // Track whether a deduction is currently in progress
  const isDeductingRef = useRef<boolean>(false);
  // Session ID to track the current interview session
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${userId}`);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      // Record start time when call begins
      startTimeRef.current = Date.now();
      // Initialize last deduction time to start time
      lastDeductionTimeRef.current = Date.now();

      // Set up periodic credit check and deduction during the call - every 60 seconds
      if (userId && availableCredits > 0) {
        creditCheckIntervalRef.current = setInterval(async () => {
          // If deduction is already in progress, skip this cycle
          if (isDeductingRef.current) return;

          // Calculate elapsed time since last deduction in minutes
          const currentTime = Date.now();
          const elapsedSinceLastDeduction =
            (currentTime - (lastDeductionTimeRef.current || currentTime)) /
            (1000 * 60);

          // Deduct credits every minute (or when elapsed time exceeds 1 minute)
          if (elapsedSinceLastDeduction >= 1) {
            isDeductingRef.current = true;

            try {
              // Deduct 1 credit (1 minute worth)
              const result = await deductCredits(userId, 1);

              if (result.success) {
                // Update available credits
                setAvailableCredits((prev) => Math.max(prev - 1, 0));
                // Update last deduction time
                lastDeductionTimeRef.current = currentTime;

                // Save session info to localStorage to handle page refresh
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "interviewSessionId",
                    sessionIdRef.current
                  );
                  localStorage.setItem(
                    "interviewStartTime",
                    String(startTimeRef.current)
                  );
                  localStorage.setItem(
                    "lastDeductionTime",
                    String(lastDeductionTimeRef.current)
                  );
                  localStorage.setItem("interviewId", interviewId || "");
                }

                // If credits reach 0, end the call
                if ((result.newTotal ?? 0) <= 0) {
                  toast.error(
                    "You've run out of credits. The call will now end."
                  );
                  handleDisconnect();
                }
              } else {
                // Handle deduction failure
                console.error("Failed to deduct credits:", result.message);
                if (result.message === "Insufficient credits") {
                  toast.error(
                    "You've run out of credits. The call will now end."
                  );
                  handleDisconnect();
                }
              }
            } finally {
              isDeductingRef.current = false;
            }
          }
        }, 10000); // Check every 10 seconds to ensure we don't miss the minute mark
      }
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      // Record end time when call ends
      endTimeRef.current = Date.now();

      // Clear credit check interval if it exists
      if (creditCheckIntervalRef.current) {
        clearInterval(creditCheckIntervalRef.current);
        creditCheckIntervalRef.current = null;
      }
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    const handleSessionEnd = async () => {
      if (!userId || !startTimeRef.current || !endTimeRef.current) return;

      // With the new per-minute credit deduction system, we only need to calculate
      // and deduct any remaining time since the last deduction
      if (lastDeductionTimeRef.current) {
        const remainingTime = endTimeRef.current - lastDeductionTimeRef.current;
        // Only deduct if there's at least 30 seconds remaining (half a minute)
        if (remainingTime >= 30000) {
          const result = await deductCredits(userId, 1); // Deduct 1 final credit
          if (result.success) {
            toast.info("Deducted 1 credit for final partial minute");
          }
        }
      }

      // Clean up session data from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("interviewSessionId");
        localStorage.removeItem("interviewStartTime");
        localStorage.removeItem("lastDeductionTime");
        localStorage.removeItem("interviewId");
      }

      if (type === "generate") {
        router.push("/");
      } else {
        await handleGenerateFeedback(messages);
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      handleSessionEnd();
    }

    // Clean up interval on component unmount
    return () => {
      if (creditCheckIntervalRef.current) {
        clearInterval(creditCheckIntervalRef.current);
      }
    };
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  // Check for unfinished sessions on component mount (handles page refresh)
  useEffect(() => {
    const checkForUnfinishedSession = async () => {
      if (!userId || typeof window === "undefined") return;

      // Get session data from localStorage
      const savedSessionId = localStorage.getItem("interviewSessionId");
      const savedStartTime = localStorage.getItem("interviewStartTime");
      const savedLastDeductionTime = localStorage.getItem("lastDeductionTime");
      const savedInterviewId = localStorage.getItem("interviewId");

      // Verify this is for the correct interview and user
      if (
        savedSessionId &&
        savedStartTime &&
        savedLastDeductionTime &&
        savedInterviewId === interviewId
      ) {
        const lastDeductionTime = parseInt(savedLastDeductionTime);

        // Calculate minutes passed since last deduction
        const minutesPassed = Math.floor(
          (Date.now() - lastDeductionTime) / (1000 * 60)
        );

        // Only deduct if at least 1 minute has passed
        if (minutesPassed >= 1) {
          // Deduct credits for time passed during page refresh
          const result = await deductCredits(userId, minutesPassed);

          if (result.success) {
            toast.info(
              `Deducted ${minutesPassed} credit${
                minutesPassed > 1 ? "s" : ""
              } for your previous session`
            );

            // Update session data or clear if starting a new session
            if (callStatus === CallStatus.INACTIVE) {
              // Clean up as we're starting fresh
              localStorage.removeItem("interviewSessionId");
              localStorage.removeItem("interviewStartTime");
              localStorage.removeItem("lastDeductionTime");
              localStorage.removeItem("interviewId");
            }
          }
        }
      }
    };

    checkForUnfinishedSession();
  }, [userId, interviewId, callStatus]);

  // Add new useEffect for cleanup on component unmount
  useEffect(() => {
    // Cleanup function for component unmount
    return () => {
      // Only proceed if we have an active call
      if (
        callStatus === CallStatus.ACTIVE &&
        userId &&
        startTimeRef.current &&
        lastDeductionTimeRef.current
      ) {
        const currentTime = Date.now();

        // Calculate time since last deduction in minutes
        const minutesSinceLastDeduction = Math.floor(
          (currentTime - lastDeductionTimeRef.current) / (1000 * 60)
        );

        // Only deduct if there's at least one minute elapsed since last deduction
        if (minutesSinceLastDeduction >= 1) {
          // Fire and forget - we can't await in the cleanup function
          deductCredits(userId, minutesSinceLastDeduction)
            .then(() => {
              // We can't show toasts here as the component is unmounting
              console.log(
                `Unmount: Deducted ${minutesSinceLastDeduction} credits`
              );
            })
            .catch((err) => {
              console.error("Error deducting credits on unmount:", err);
            });
        }

        // Clear session data from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("interviewSessionId");
          localStorage.removeItem("interviewStartTime");
          localStorage.removeItem("lastDeductionTime");
          localStorage.removeItem("interviewId");
        }
      }

      // Clear interval if it exists
      if (creditCheckIntervalRef.current) {
        clearInterval(creditCheckIntervalRef.current);
        creditCheckIntervalRef.current = null;
      }
    };
  }, [userId, callStatus]);

  const checkCredits = async () => {
    if (!userId) {
      toast.error("You need to be signed in to use this feature");
      router.push("/sign-in");
      return false;
    }

    setIsChecking(true);

    try {
      // Check for minimum 5 credits to start a call
      // This assumes a reasonable minimum interview length
      const minimumCreditsRequired = 5;
      const { hasEnough, availableCredits: credits } = await hasEnoughCredits(
        userId,
        minimumCreditsRequired
      );
      setAvailableCredits(credits);

      // Set the maximum call duration based on available credits
      maxCallDurationInMinutes.current = credits;

      if (!hasEnough) {
        toast.error(
          `You need at least ${minimumCreditsRequired} credits to start an interview. Please purchase more.`
        );
        router.push("/profile");
        return false;
      }

      // Warn if they have less than 10 credits
      if (credits < 10) {
        toast.warning(
          `You have ${credits} credits. This may limit your interview time.`
        );
      }

      return true;
    } catch (error) {
      console.error("Error checking credits:", error);
      toast.error("Error checking credits. Please try again.");
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const handleCall = async () => {
    // Check if user has enough credits before starting call
    const hasCredits = await checkCredits();
    if (!hasCredits) return;

    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = () => {
    // Clear any active timers
    if (creditCheckIntervalRef.current) {
      clearInterval(creditCheckIntervalRef.current);
      creditCheckIntervalRef.current = null;
    }

    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
            {availableCredits > 0 && (
              <p className="text-sm text-gray-400">
                {availableCredits} credits available
              </p>
            )}
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="mb-8 bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-800/50 transition-all duration-300 p-6">
          <div className="text-center">
            <p
              key={lastMessage}
              className={cn(
                "text-lg text-white transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center mt-8">
        {callStatus !== "ACTIVE" ? (
          <button
            className={`relative flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-white shadow-lg transition-all duration-300 cursor-pointer ${
              callStatus !== "CONNECTING" && !isChecking
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-900/30"
                : "bg-gray-700 cursor-wait"
            }`}
            onClick={() => handleCall()}
            disabled={isChecking || callStatus === "CONNECTING"}
          >
            {callStatus !== "CONNECTING" && !isChecking && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
                  clipRule="evenodd"
                />
              </svg>
            )}

            {(callStatus === "CONNECTING" || isChecking) && (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              </div>
            )}

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? isChecking
                  ? "Checking credits..."
                  : "Start Interview"
                : "Connecting..."}
            </span>
          </button>
        ) : (
          <button
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-red-900/30 transition-all duration-300"
            onClick={() => handleDisconnect()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M10.5 1.875a1.125 1.125 0 0 1 2.25 0v8.219c.517.162 1.02.382 1.5.659V3.375a1.125 1.125 0 0 1 2.25 0v10.937a1.125 1.125 0 0 1-2.25 0V6.75c-.48-.277-.983-.497-1.5-.659v10.784a1.125 1.125 0 0 1-2.25 0V6c-.584.084-1.157.223-1.5.413v9.462a1.125 1.125 0 0 1-2.25 0V7.875c0-1.248 1.008-2.256 2.256-2.256.693 0 1.337.334 1.744.895.19-.087.392-.158.6-.213Z" />
              <path d="M21 12a.75.75 0 0 1-.75.75H4.75a.75.75 0 0 1 0-1.5h15.5A.75.75 0 0 1 21 12Z" />
            </svg>
            End Interview
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
