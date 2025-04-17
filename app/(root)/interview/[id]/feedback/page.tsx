import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Interview Feedback
        </h1>
        <p className="text-gray-400 text-lg capitalize">
          {interview.role} Position
        </p>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-gray-800/50 p-6 mb-8 hover:shadow-blue-900/10 transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-3 rounded-full">
              <Image
                src="/star.svg"
                width={24}
                height={24}
                alt="star"
                className="opacity-90"
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Overall Score</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                {feedback?.totalScore || 0}/100
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-purple-600/20 p-3 rounded-full">
              <Image
                src="/calendar.svg"
                width={24}
                height={24}
                alt="calendar"
                className="opacity-90"
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Interview Date</p>
              <p className="text-lg font-medium text-white">
                {feedback?.createdAt
                  ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/30">
          <h3 className="text-lg font-medium text-white mb-3">
            Final Assessment
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {feedback?.finalAssessment}
          </p>
        </div>
      </div>

      {/* Category Scores */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-gray-800/50 p-6 mb-8 hover:shadow-blue-900/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">
            Performance Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedback?.categoryScores?.map((category, index) => (
            <div
              key={index}
              className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{category.name}</h3>
                <div className="bg-blue-600/20 px-3 py-1 rounded-full">
                  <span className="font-bold text-blue-400">
                    {category.score}
                  </span>
                  <span className="text-gray-400 text-sm">/100</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{category.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Strengths */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-gray-800/50 p-6 hover:shadow-green-900/10 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-white">Strengths</h2>
          </div>

          <ul className="space-y-3">
            {feedback?.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-gray-800/50 p-6 hover:shadow-red-900/10 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-white">
              Areas for Improvement
            </h2>
          </div>

          <ul className="space-y-3">
            {feedback?.areasForImprovement?.map((area, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 flex-1 max-w-64"
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
          Back to Dashboard
        </Link>

        <Link
          href={`/interview/${id}`}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-900/30 flex-1 max-w-64"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"
              clipRule="evenodd"
            />
            <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
          </svg>
          Retake Interview
        </Link>
      </div>
    </div>
  );
};

export default Feedback;
