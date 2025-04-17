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

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  userPhoto,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  // Add flag to track if feedback has been generated
  const [feedbackGenerated, setFeedbackGenerated] = useState(false);

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
      // Check if feedback has already been generated
      if (feedbackGenerated) return;

      console.log("handleGenerateFeedback");
      setFeedbackGenerated(true);

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        toast.success("Interview feedback generated");
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        toast.error("Failed to generate feedback");
        router.push("/interviewslist");
      }
    };

    const handleSessionEnd = async () => {
      if (!userId || !startTimeRef.current || !endTimeRef.current) return;

      // With the new per-minute credit deduction system, we only need to calculate
      // and deduct any remaining time since the last deduction
      if (lastDeductionTimeRef.current) {
        const remainingTimeMs =
          endTimeRef.current - lastDeductionTimeRef.current;
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
        localStorage.removeItem("interviewSessionId");
        localStorage.removeItem("interviewStartTime");
        localStorage.removeItem("lastDeductionTime");
        localStorage.removeItem("interviewId");
      }

      if (type === "generate") {
        router.push("/interviewslist");
      } else {
        await handleGenerateFeedback(messages);
      }
    };

    if (callStatus === CallStatus.FINISHED && !feedbackGenerated) {
      handleSessionEnd();
    }

    // Clean up interval on component unmount
    return () => {
      if (creditCheckIntervalRef.current) {
        clearInterval(creditCheckIntervalRef.current);
      }
    };
  }, [
    messages,
    callStatus,
    feedbackId,
    interviewId,
    router,
    type,
    userId,
    feedbackGenerated,
  ]);

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

        // Calculate minutes passed since last deduction with 2 decimal precision
        const minutesPassed = parseFloat(
          ((Date.now() - lastDeductionTime) / 60000).toFixed(2)
        );

        // Only deduct if at least 0.1 minutes (6 seconds) has passed
        if (minutesPassed >= 0.1) {
          try {
            // Deduct credits for time passed during page refresh with decimal precision
            const result = await deductCredits(userId, minutesPassed);

            if (result.success) {
              setAvailableCredits((prev) =>
                parseFloat(Math.max((prev || 0) - minutesPassed, 0).toFixed(2))
              );

              toast.info(
                `Deducted ${minutesPassed.toFixed(2)} credit${
                  minutesPassed !== 1 ? "s" : ""
                } for your previous session`
              );

              // Update the last deduction time to now
              if (callStatus === CallStatus.ACTIVE) {
                lastDeductionTimeRef.current = Date.now();
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "lastDeductionTime",
                    String(lastDeductionTimeRef.current)
                  );
                }
              } else if (callStatus === CallStatus.INACTIVE) {
                // Clean up as we're starting fresh
                localStorage.removeItem("interviewSessionId");
                localStorage.removeItem("interviewStartTime");
                localStorage.removeItem("lastDeductionTime");
                localStorage.removeItem("interviewId");
              }
            }
          } catch (error) {
            console.error(
              "Error deducting credits for unfinished session:",
              error
            );
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

        // Calculate time since last deduction in minutes with 2 decimal precision
        const minutesSinceLastDeduction = parseFloat(
          ((currentTime - lastDeductionTimeRef.current) / 60000).toFixed(2)
        );

        // Only deduct if there's at least 0.1 minute elapsed since last deduction
        if (minutesSinceLastDeduction >= 0.1) {
          // Fire and forget - we can't await in the cleanup function
          deductCredits(userId, minutesSinceLastDeduction)
            .then(() => {
              // We can't show toasts here as the component is unmounting
              console.log(
                `Unmount: Deducted ${minutesSinceLastDeduction.toFixed(
                  2
                )} credits`
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

  const handleDisconnect = async () => {
    // Check if feedback has already been generated
    if (feedbackGenerated) {
      toast.info("Already processing your feedback...");
      return;
    }

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
      localStorage.removeItem("interviewSessionId");
      localStorage.removeItem("interviewStartTime");
      localStorage.removeItem("lastDeductionTime");
      localStorage.removeItem("interviewId");
    }

    setCallStatus(CallStatus.FINISHED);
    vapi.stop();

    // Handle feedback generation directly if needed
    if (type !== "generate" && interviewId && userId && messages.length > 0) {
      console.log("Generating feedback after manual disconnect");
      setFeedbackGenerated(true);

      try {
        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewId,
          userId: userId,
          transcript: messages,
          feedbackId,
        });

        if (success && id) {
          toast.success("Interview feedback generated");
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          console.error("Error saving feedback");
          toast.error("Failed to generate feedback");
          router.push("/interviewslist");
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
        toast.error("Failed to generate feedback");
        router.push("/interviewslist");
      }
    } else if (type === "generate") {
      router.push("/interviewslist");
    }
  };

  return (
    <>
      {/* Main content container with fixed minimum height to prevent shifting */}
      <div className="min-h-[500px] flex flex-col justify-between mt-4">
        <div>
          {/* Show user cards only when call is active or after messages start appearing */}
          {(callStatus === CallStatus.ACTIVE ||
            (messages.length > 0 &&
              !(
                callStatus === CallStatus.FINISHED &&
                feedbackGenerated &&
                type !== "generate"
              ))) && (
            <div className="call-view">
              {/* AI Interviewer Card */}
              <div className="card-interviewer">
                <div className="avatar">
                  <Image
                    src="/ai-face.svg"
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
                    src={userPhoto || "/user-avatar.png"}
                    alt="profile-image"
                    width={539}
                    height={539}
                    className="rounded-full object-cover size-[120px]"
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

          {/* Show message transcript only when not in feedback generation mode */}
          {messages.length > 0 &&
            !(
              callStatus === CallStatus.FINISHED &&
              feedbackGenerated &&
              type !== "generate"
            ) && (
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

          {/* Show instruction card when the call is inactive and not finished */}
          {callStatus === CallStatus.INACTIVE && (
            <div className="max-w-3xl mx-auto mb-8 px-4">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  Ready for your AI Interview
                </h1>
                <p className="mt-2 text-gray-300">
                  Follow these tips for the best experience
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-gradient-to-br from-blue-900/5 to-gray-900/90 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-2 text-blue-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">AI Interviewer</span>
                  </div>
                  <p className="text-gray-300 ml-7">
                    This is an interview conducted by our advanced AI
                    interviewer.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/5 to-gray-900/90 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-2 text-purple-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Microphone Check</span>
                  </div>
                  <p className="text-gray-300 ml-7">
                    Please ensure your microphone is working properly before
                    starting.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-900/5 to-gray-900/90 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-2 text-green-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Speak Clearly</span>
                  </div>
                  <p className="text-gray-300 ml-7">
                    Answer questions as naturally as you would in a real
                    interview.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-900/5 to-gray-900/90 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-2 text-red-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Quiet Environment</span>
                  </div>
                  <p className="text-gray-300 ml-7">
                    Find a quiet place free from distractions for the best
                    experience.
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-yellow-500/5 to-gray-800/70 rounded-xl p-4 text-center">
                <p className="text-gray-200">
                  When finished, click{" "}
                  <span className="font-semibold text-yellow-400">
                    End Interview
                  </span>{" "}
                  to receive your personalized feedback
                </p>
              </div>
            </div>
          )}

          {/* Modern loading UI for interview preparation */}
          {callStatus === CallStatus.CONNECTING && (
            <div className="max-w-3xl mx-auto mb-8 px-4 flex items-center justify-center min-h-[300px]">
              <div className="w-full bg-gradient-to-br from-blue-900/20 to-indigo-900/10 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 shadow-lg">
                <div className="flex flex-col items-center justify-center text-center">
                  {/* Animated icon */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse"></div>
                    <div className="relative size-20 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Loading indicator */}
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Preparing your interview...
                  </h2>
                  <p className="text-blue-200 mb-5">
                    Setting up your AI interviewer for the best experience
                  </p>

                  {/* Progress bar */}
                  <div className="w-full max-w-md h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-loadingBar"></div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center mt-2">
                    <span className="px-3 py-1 bg-blue-900/40 text-blue-200 text-sm rounded-full">
                      Configuring AI
                    </span>
                    <span className="px-3 py-1 bg-indigo-900/40 text-indigo-200 text-sm rounded-full">
                      Setting up voice recognition
                    </span>
                    <span className="px-3 py-1 bg-purple-900/40 text-purple-200 text-sm rounded-full">
                      Preparing questions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modern UI for generating feedback report - only show when needed */}
          {callStatus === CallStatus.FINISHED &&
            feedbackGenerated &&
            type !== "generate" && (
              <div className="max-w-3xl mx-auto px-4 flex items-center justify-center min-h-[350px]">
                <div className="w-full bg-gradient-to-br from-purple-900/20 to-pink-900/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
                  <div className="flex flex-col items-center justify-center text-center">
                    {/* Animated icon */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full animate-pulse"></div>
                      <div className="relative size-20 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Loading indicator */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Generating your feedback report...
                    </h2>
                    <p className="text-purple-200 mb-5">
                      Analyzing your responses and preparing personalized
                      insights
                    </p>

                    {/* Progress bar */}
                    <div className="w-full max-w-md h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-loadingBar"></div>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                      <span className="px-3 py-1 bg-purple-900/40 text-purple-200 text-sm rounded-full">
                        Analyzing responses
                      </span>
                      <span className="px-3 py-1 bg-pink-900/40 text-pink-200 text-sm rounded-full">
                        Identifying strengths
                      </span>
                      <span className="px-3 py-1 bg-fuchsia-900/40 text-fuchsia-200 text-sm rounded-full">
                        Creating recommendations
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        <div className="mt-auto">
          {/* Button container with fixed position at bottom */}
          <div className="w-full flex justify-center my-8">
            {callStatus !== "ACTIVE" ? (
              <button
                className={`relative flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-white shadow-lg transition-all duration-300 cursor-pointer ${
                  callStatus !== "CONNECTING" &&
                  !isChecking &&
                  !feedbackGenerated
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-900/30"
                    : "bg-gray-700 cursor-wait"
                }`}
                onClick={() => handleCall()}
                disabled={
                  isChecking || callStatus === "CONNECTING" || feedbackGenerated
                }
              >
                {callStatus !== "CONNECTING" &&
                  !isChecking &&
                  !feedbackGenerated && (
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

                {(callStatus === "CONNECTING" ||
                  isChecking ||
                  feedbackGenerated) && (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  </div>
                )}

                <span className="relative">
                  {callStatus === "INACTIVE" || callStatus === "FINISHED"
                    ? isChecking
                      ? "Checking credits..."
                      : feedbackGenerated
                      ? "Processing..."
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

          {/* Warning message with consistent placement - only show during active interview */}
          <div className="w-full flex justify-center mb-4">
            {callStatus === CallStatus.ACTIVE && type !== "generate" && (
              <p className="text-center text-xl bg-red-500/10 px-4 py-2 rounded-lg">
                After Interview End the Interview
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Agent;
