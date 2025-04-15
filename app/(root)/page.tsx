import Link from "next/link";
import Image from "next/image";

import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";
import { getUserCredits } from "@/lib/actions/credit.action";

async function Home() {
  const user = await getCurrentUser();

  // If no user is found, redirect to sign-in page (should not happen due to middleware)
  if (!user) {
    return (
      <div className="text-center p-8">
        <p>No user found. Please sign in again.</p>
      </div>
    );
  }

  const [userInterviews, allInterview, userCredits] = await Promise.all([
    getInterviewsByUserId(user.id || ""),
    getLatestInterviews({ userId: user.id || "" }),
    getUserCredits(user.id || ""),
  ]);

  const hasPastInterviews = (userInterviews?.length || 0) > 0;
  const hasUpcomingInterviews = (allInterview?.length || 0) > 0;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl border border-gray-800/50 p-8 sm:p-10 mb-16 transition-all duration-300 hover:shadow-blue-900/10">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <radialGradient
                id="radial"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#111827" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#radial)" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="flex flex-col gap-6 max-w-lg">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text leading-tight">
              Get Interview-Ready with AI
            </h1>
            <p className="text-lg text-gray-300">
              Practice with realistic mock interviews and receive instant
              AI-powered feedback to boost your confidence and success rate.
            </p>

            <div className="flex items-center justify-between gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 mb-4">
              <div>
                <p className="text-sm text-gray-400">Available Credits</p>
                <p className="text-xl font-semibold text-white">
                  {userCredits.credits || 0}
                </p>
              </div>
              <Link
                href="/profile#credits"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Credits
              </Link>
            </div>

            <Link
              href="/interview"
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-900/30 w-fit"
            >
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
              Create an Interview
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>

          <div className="relative md:flex-1 w-full md:w-auto">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-64 bg-blue-600/20 rounded-full blur-3xl"></div>
            <Image
              src="/robot.png"
              alt="AI Interview Assistant"
              width={400}
              height={400}
              className="relative z-10 mx-auto md:ml-auto"
            />
          </div>
        </div>
      </section>

      {/* Your Recent Interviews Section */}
      {hasPastInterviews && (
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">
                Your Recent Interviews
              </h2>
            </div>

            {(userInterviews?.length || 0) > 3 && (
              <Link
                href="/interviews"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-1"
              >
                View All
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            )}
          </div>

          <div className="interviews-section">
            {userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))}
          </div>
        </section>
      )}

      {/* Available Interviews Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">
              Available Interviews
            </h2>
          </div>
        </div>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 shadow-lg transition-all duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-xl"></div>
                <Image
                  src="/empty.png"
                  alt="No interviews"
                  width={120}
                  height={120}
                  className="relative z-10 opacity-80"
                />
              </div>
              <p className="text-gray-400 text-center mb-6 max-w-md">
                There are no interviews available right now. Create a new
                interview to practice your skills.
              </p>
              <Link
                href="/interview"
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-900/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                Create Interview
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
