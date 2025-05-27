"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { hasEnoughCredits, deductCredits } from "@/lib/actions/credit.action";
import { Message } from "@/types/vapi";

// Add CSS animation keyframes for loading bar
import "./agent.css";

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

interface AICoachVapiProps {
  userName: string;
  userId: string;
  interviewId: string;
  interview: {
    role: string;
    type: string;
    techstack: string[];
  };
  feedback: {
    totalScore: number;
    finalAssessment: string;
    strengths: string[];
    areasForImprovement: string[];
    categoryScores: {
      name: string;
      score: number;
      comment: string;
    }[];
  };
  userPhoto?: string;
}

const AICoachVapi = ({
  userName,
  userId,
  interviewId,
  interview,
  feedback,
  userPhoto,
}: AICoachVapiProps) => {
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
  const sessionIdRef = useRef<string>(`coach_session_${Date.now()}_${userId}`);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      // Record start time when call begins
      startTimeRef.current = Date.now();
      // Initialize last deduction time to start time
      lastDeductionTimeRef.current = Date.now();

      // Set up periodic credit check and deduction during the call - every 10 seconds
      if (userId && availableCredits > 0) {
        creditCheckIntervalRef.current = setInterval(async () => {
          // If deduction is already in progress, skip this cycle
          if (isDeductingRef.current) return;

          // Calculate elapsed time since last deduction in milliseconds
          const currentTime = Date.now();
          const elapsedSinceLastDeduction =
            currentTime - (lastDeductionTimeRef.current || currentTime);

          // Convert to minutes with 2 decimal places precision (60000ms = 1 minute)
          const elapsedMinutes = parseFloat(
            (elapsedSinceLastDeduction / 60000).toFixed(2)
          );

          // Deduct credits if at least 0.1 minutes (6 seconds) has passed
          if (elapsedMinutes >= 0.1) {
            isDeductingRef.current = true;

            try {
              // Deduct credits with decimal precision
              const result = await deductCredits(userId, elapsedMinutes);

              if (result.success) {
                // Update available credits with decimal precision
                setAvailableCredits((prev) =>
                  parseFloat(Math.max(prev - elapsedMinutes, 0).toFixed(2))
                );
                // Update last deduction time precisely
                lastDeductionTimeRef.current = currentTime;

                // Save session info to localStorage to handle page refresh
                if (typeof window !== "undefined") {
                  localStorage.setItem("coachSessionId", sessionIdRef.current);
                  localStorage.setItem(
                    "coachStartTime",
                    String(startTimeRef.current)
                  );
                  localStorage.setItem(
                    "coachLastDeductionTime",
                    String(lastDeductionTimeRef.current)
                  );
                }

                console.log(
                  `Deducted ${elapsedMinutes.toFixed(
                    2
                  )} credit(s). Remaining: ${(result.newTotal || 0).toFixed(2)}`
                );

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
        }, 10000); // Check every 10 seconds for more granular credit tracking
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
      console.error("VAPI error:", error);
      // Just log the error but don't show a toast - this is what the Agent component does
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup listeners when component unmounts
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [userId, availableCredits]);

  // Update the last message whenever messages array changes
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  // Check credits when component mounts
  useEffect(() => {
    const checkInitialCredits = async () => {
      await checkCredits();
    };

    checkInitialCredits();
  }, [userId]);

  const checkCredits = async () => {
    if (!userId || isChecking) return false;

    setIsChecking(true);
    try {
      // Use 0.1 as the required amount for minimal call duration
      const {
        hasEnough,
        availableCredits: credits,
        success,
      } = await hasEnoughCredits(userId, 0.1);

      if (!success) {
        toast.error("Failed to check credits. Please try again.");
        return false;
      }

      setAvailableCredits(credits || 0);

      if (!hasEnough) {
        toast.error("You don't have enough credits for this call.");
        return false;
      }

      // Estimate maximum call duration based on credits
      // 1 credit = 1 minute
      maxCallDurationInMinutes.current = credits;

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
    console.log("Starting AI Coach call...");

    try {
      // Import the interviewer config from constants
      const { aiCoach } = await import("@/constants");

      // Start the call using the modified interviewer template
      await vapi.start(aiCoach, {
        variableValues: {
          role: interview.role,
          type: interview.type,
          techstack: interview.techstack.join(", "),
          totalScore: feedback.totalScore,
          strengths: feedback.strengths.join("\n"),
          areasForImprovement: feedback.areasForImprovement.join("\n"),
          finalAssessment: feedback.finalAssessment,
          categoryScores: feedback.categoryScores
            .map((c) => `${c.name}: ${c.score}/100 - ${c.comment}`)
            .join("\n"),
        },
      });

      console.log("VAPI call started successfully");
    } catch (error) {
      console.error("VAPI call error:", error);
      toast.error(
        `Call error: ${
          error instanceof Error ? error.message : "An unknown error occurred"
        }`
      );
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = async () => {
    // Record end time when manually disconnecting
    endTimeRef.current = Date.now();

    // Clear any active timers
    if (creditCheckIntervalRef.current) {
      clearInterval(creditCheckIntervalRef.current);
      creditCheckIntervalRef.current = null;
    }

    // Handle final credit deduction before stopping the call
    if (userId && startTimeRef.current && lastDeductionTimeRef.current) {
      const remainingTimeMs = endTimeRef.current - lastDeductionTimeRef.current;
      // Convert to minutes with 2 decimal precision
      const remainingTimeMinutes = parseFloat(
        (remainingTimeMs / 60000).toFixed(2)
      );

      // Only deduct if there's at least 0.1 minutes (6 seconds) remaining
      if (remainingTimeMinutes >= 0.1) {
        try {
          const result = await deductCredits(userId, remainingTimeMinutes);
          if (result.success) {
            setAvailableCredits((prev) =>
              parseFloat(Math.max(prev - remainingTimeMinutes, 0).toFixed(2))
            );
            toast.info(
              `Deducted ${remainingTimeMinutes.toFixed(
                2
              )} credits for final partial minute`
            );
          }
        } catch (error) {
          console.error("Error deducting final credit:", error);
        }
      }
    }

    // Clean up session data from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("coachSessionId");
      localStorage.removeItem("coachStartTime");
      localStorage.removeItem("coachLastDeductionTime");
    }

    setCallStatus(CallStatus.FINISHED);
    vapi.stop();

    // Return to feedback page after call ends
    router.push(`/interview/${interviewId}/feedback`);
  };

  return (
    <>
      {/* Main content container with fixed minimum height to prevent shifting */}
      <div className="min-h-[500px] flex flex-col justify-between mt-4">
        <div>
          {/* Show user cards only when call is active or after messages start appearing */}
          {(callStatus === CallStatus.ACTIVE || messages.length > 0) && (
            <div className="call-view">
              {/* AI Coach Card */}
              <div className="card-interviewer">
                <div className="avatar">
                  <Image
                    src="/logo.svg"
                    alt="AI Coach"
                    width={65}
                    height={65}
                    className="object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://ui-avatars.com/api/?name=AI+Coach&background=0062ff&color=fff";
                    }}
                  />
                  {isSpeaking && <span className="animate-speak" />}
                </div>
                <h3>AI Interview Coach</h3>
              </div>

              {/* User Profile Card */}
              <div className="card-border">
                <div className="card-content">
                  <Image
                    src={userPhoto || "/user-avatar.png"}
                    alt="profile-image"
                    width={120}
                    height={120}
                    className={`rounded-full object-cover size-[120px] ${
                      userPhoto ? "bg-gray-900" : ""
                    }`}
                  />
                  <h3>{userName}</h3>
                  {availableCredits > 0 && (
                    <p className="text-sm text-gray-400">
                      {availableCredits.toFixed(2)} credits available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Show message transcript */}
          {messages.length > 0 && (
            <div className="mt-4 mb-8 bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-800/50 transition-all duration-300 p-6">
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

          {/* Show instruction card when the call is inactive */}
          {callStatus === CallStatus.INACTIVE && (
            <div className="text-center my-8 max-w-xl mx-auto">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-gray-800/50 p-6 hover:shadow-green-900/10 transition-all duration-300">
                <div className="bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
                  <h2 className="text-2xl font-bold mb-2">AI Coach Call</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Connect with your AI Interview Coach to get personalized
                  guidance and feedback on your {interview.role} interview
                  performance.
                </p>
                <div className="space-y-2 text-left mb-6">
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Analyze your
                    strengths and weaknesses
                  </p>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Get actionable
                    tips for improvement
                  </p>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Personalized
                    guidance for your career path
                  </p>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  This call costs 1 credit per minute. You currently have{" "}
                  <span className="font-medium text-white">
                    {availableCredits.toFixed(2)}
                  </span>{" "}
                  credits.
                </p>
                <button
                  onClick={handleCall}
                  disabled={isChecking || availableCredits <= 0}
                  className={cn(
                    "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 w-full",
                    (isChecking || availableCredits <= 0) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isChecking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-white border-white/20"></div>
                      Checking credits...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Start Coaching Call
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Show connecting message */}
          {callStatus === CallStatus.CONNECTING && (
            <div className="text-center my-8">
              <div className="animate-pulse">
                <div className="bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
                  <h2 className="text-2xl font-bold">
                    Connecting to AI Coach...
                  </h2>
                </div>
                <p className="text-gray-400 mt-2">
                  Please wait while we establish your coaching call
                </p>
              </div>
              <div className="w-full max-w-sm mx-auto mt-6 h-2 bg-dark-300 rounded-full overflow-hidden">
                <div className="moving-gradient h-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Call Action Button */}
        <div className="mt-8 flex justify-center">
          {callStatus === CallStatus.ACTIVE && (
            <button
              onClick={handleDisconnect}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                <path
                  className="stroke-white stroke-2"
                  d="M16 3L4 15M4 3L16 15"
                  strokeLinecap="round"
                />
              </svg>
              End Call
            </button>
          )}

          {callStatus === CallStatus.FINISHED && (
            <button
              onClick={() => router.push(`/interview/${interviewId}/feedback`)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Feedback
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AICoachVapi;
