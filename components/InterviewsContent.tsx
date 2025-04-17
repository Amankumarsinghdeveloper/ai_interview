import Link from "next/link";
import Image from "next/image";

import InterviewCard from "@/components/InterviewCard";
import InterviewsFilter from "@/components/InterviewsFilter";

import { InterviewResult } from "@/lib/actions/general.action";

// Local type definitions
interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  photoURL?: string;
}

// Component props type definition
interface InterviewsContentProps {
  user: User;
  initialTab: string;
  initialUserInterviews: InterviewResult | null;
  initialAvailableInterviews: InterviewResult | null;
}

const InterviewsContent = ({
  user,
  initialTab,
  initialUserInterviews,
  initialAvailableInterviews,
}: InterviewsContentProps) => {
  const currentInterviews =
    initialTab === "your" ? initialUserInterviews : initialAvailableInterviews;

  return (
    <>
      <InterviewsFilter />

      {/* Section Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white">
          {initialTab === "your" ? "Your Interviews" : "Available Interviews"}
        </h2>
      </div>

      {currentInterviews?.interviews.length != 0 ? (
        <div className="space-y-8">
          {/* Interviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentInterviews?.interviews.map((interview) => (
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

          {/* <InterviewsPagination
            hasMore={hasMoreInterviews}
            onLoadMore={loadMoreInterviews}
            isLoading={isLoading}
          /> */}
        </div>
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 shadow-lg transition-all duration-300">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-xl"></div>
            <Image
              src="/robot.png"
              alt="No interviews"
              width={120}
              height={120}
              className="relative z-10 opacity-80"
            />
          </div>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            {initialTab === "your"
              ? "You haven't created any interviews yet. Create a new interview to practice your skills."
              : "There are no interviews available right now. Create a new interview to practice your skills."}
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
    </>
  );
};

export default InterviewsContent;
