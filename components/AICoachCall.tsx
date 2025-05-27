"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface AICoachCallProps {
  interview: {
    id: string;
    role: string;
    type: string;
    techstack: string[];
  };
  feedback: {
    id: string;
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
}

const AICoachCall = ({ interview, feedback }: AICoachCallProps) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Predefined coach insights based on feedback
  const coachInsights = [
    {
      title: "Performance Overview",
      message: `Your overall interview score was ${feedback.totalScore}/100. ${feedback.finalAssessment}`,
    },
    {
      title: "Key Strengths",
      message: `Here are your key strengths I noticed during the interview: ${feedback.strengths
        .map((s, i) => `\n${i + 1}. ${s}`)
        .join("")}`,
    },
    {
      title: "Areas for Growth",
      message: `Let's focus on these areas for improvement: ${feedback.areasForImprovement
        .map((a, i) => `\n${i + 1}. ${a}`)
        .join("")}`,
    },
    {
      title: "Technical Skills",
      message: `For the ${
        interview.role
      } position, you'll need to strengthen your knowledge in ${interview.techstack.join(
        ", "
      )}. Based on your performance, I recommend focusing on practical applications and more hands-on projects.`,
    },
    {
      title: "Communication Skills",
      message:
        feedback.categoryScores.find((c) => c.name.includes("Communication"))
          ?.comment ||
        "Work on your communication skills by practicing clear, concise answers and using the STAR method for behavioral questions.",
    },
    {
      title: "Next Steps",
      message: `To improve for your next ${interview.role} interview, I recommend:\n1. Practice coding challenges on platforms like LeetCode\n2. Study system design concepts\n3. Prepare better examples of your past work\n4. Practice mock interviews regularly\n5. Focus on explaining your thought process clearly`,
    },
  ];

  // Simulate call connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCallActive(true);

      // Initial greeting after call connects
      setTimeout(() => {
        addMessage(
          "coach",
          `Hello! I'm your AI Interview Coach. I've analyzed your ${interview.role} interview performance and I'm here to help you improve. What specific aspect of your interview would you like to discuss first?`
        );
      }, 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [interview.role]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (sender: string, text: string) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const simulateTyping = async (message: string) => {
    setIsTyping(true);
    // Simulate AI thinking/typing (delay based on message length)
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(1500, message.length * 10))
    );
    setIsTyping(false);
    addMessage("coach", message);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    addMessage("user", inputMessage);
    const userQuery = inputMessage.toLowerCase();
    setInputMessage("");

    // Find relevant coaching insight based on user query
    let responded = false;

    // Look for keywords in the user's message to determine the appropriate response
    if (
      userQuery.includes("strength") ||
      userQuery.includes("good") ||
      userQuery.includes("well")
    ) {
      await simulateTyping(coachInsights[1].message);
      responded = true;
    } else if (
      userQuery.includes("improve") ||
      userQuery.includes("weak") ||
      userQuery.includes("better")
    ) {
      await simulateTyping(coachInsights[2].message);
      responded = true;
    } else if (
      userQuery.includes("technical") ||
      userQuery.includes("skill") ||
      userQuery.includes("knowledge")
    ) {
      await simulateTyping(coachInsights[3].message);
      responded = true;
    } else if (
      userQuery.includes("communicat") ||
      userQuery.includes("speak") ||
      userQuery.includes("explain")
    ) {
      await simulateTyping(coachInsights[4].message);
      responded = true;
    } else if (
      userQuery.includes("next") ||
      userQuery.includes("plan") ||
      userQuery.includes("practice")
    ) {
      await simulateTyping(coachInsights[5].message);
      responded = true;
    } else if (
      userQuery.includes("overview") ||
      userQuery.includes("summary") ||
      userQuery.includes("score")
    ) {
      await simulateTyping(coachInsights[0].message);
      responded = true;
    }

    // If no relevant keywords were found, give a general response
    if (!responded) {
      await simulateTyping(
        `Based on your ${
          interview.role
        } interview, I'd recommend focusing on strengthening your ${feedback.areasForImprovement[0].toLowerCase()}. Is there a specific aspect of this you'd like me to elaborate on?`
      );
    }
  };

  // Call control functions
  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const endCall = () => setIsCallActive(false);

  return (
    <div className="flex flex-col">
      {/* Call header with controls */}
      <div className="flex justify-center gap-6 mb-8">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${
            isMuted ? "bg-red-500" : "bg-dark-300 hover:bg-dark-200"
          } transition-colors`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          <Image
            src={isMuted ? "/muted.svg" : "/microphone.svg"}
            width={24}
            height={24}
            alt="Mute"
          />
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            !isVideoOn ? "bg-red-500" : "bg-dark-300 hover:bg-dark-200"
          } transition-colors`}
          aria-label={isVideoOn ? "Turn off camera" : "Turn on camera"}
        >
          <Image
            src={isVideoOn ? "/video.svg" : "/video-off.svg"}
            width={24}
            height={24}
            alt="Video"
          />
        </button>

        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          aria-label="End call"
        >
          <Image src="/phone.svg" width={24} height={24} alt="End call" />
        </button>
      </div>

      {/* Call status indicator */}
      <div className="text-center mb-4">
        {!isCallActive ? (
          <p className="text-gray-400">
            Connecting to your AI Interview Coach...
          </p>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            <p className="text-gray-300">Call in progress</p>
          </div>
        )}
      </div>

      {/* Coach profile */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Image
            src="/ai-coach-avatar.png"
            width={64}
            height={64}
            alt="AI Coach"
            className="rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://ui-avatars.com/api/?name=AI+Coach&background=0062ff&color=fff";
            }}
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></span>
        </div>
        <div>
          <h3 className="font-semibold text-white">AI Interview Coach</h3>
          <p className="text-gray-400 text-sm">Professional Career Advisor</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="bg-dark-300/30 rounded-lg p-4 mb-6 h-96 overflow-y-auto">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 mb-4 ${
                message.sender === "user" ? "justify-end" : ""
              }`}
            >
              {message.sender === "coach" && (
                <div className="w-8 h-8 rounded-full bg-teal-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                  A
                </div>
              )}
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-dark-300 text-gray-200"
                }`}
              >
                <p className="whitespace-pre-line">{message.text}</p>
              </div>
              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                  U
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mb-4"
            >
              <div className="w-8 h-8 rounded-full bg-teal-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="p-3 rounded-lg bg-dark-300 text-gray-200">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="relative">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask your AI coach about your interview performance..."
          className="w-full bg-dark-300 text-white rounded-full py-3 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={!isCallActive}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isCallActive || !inputMessage.trim()}
        >
          <Image src="/send.svg" width={20} height={20} alt="Send" />
        </button>
      </form>
    </div>
  );
};

export default AICoachCall;
