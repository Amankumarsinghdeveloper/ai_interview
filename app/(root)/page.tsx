import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id || ""),
    getLatestInterviews({ userId: user?.id || "" }),
  ]);

  const hasPastInterviews = (userInterviews?.length || 0) > 0;
  const hasUpcomingInterviews = (allInterview?.length || 0) > 0;

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-200 to-dark-300 shadow-xl border border-light-800/10 p-8 sm:p-10 mb-16">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex flex-col gap-6 max-w-lg z-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary-100 to-primary-200 text-transparent bg-clip-text leading-tight">
              Get Interview-Ready with AI
            </h1>
            <p className="text-lg text-light-100">
              Practice with realistic mock interviews and receive instant
              AI-powered feedback to boost your confidence and success rate.
            </p>

            <Button asChild size="lg" className="w-fit group">
              <Link href="/interview" className="flex items-center gap-2">
                Start an Interview
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
            </Button>
          </div>

          <div className="relative md:flex-1 w-full md:w-auto">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-64 bg-primary-200/20 rounded-full blur-3xl"></div>
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

      {hasPastInterviews && (
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-light-100">
              Your Recent Interviews
            </h2>
            {(userInterviews?.length || 0) > 3 && (
              <Button variant="ghost" asChild size="sm">
                <Link href="/interviews">View All</Link>
              </Button>
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

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-light-100">
            Available Interviews
          </h2>
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
            <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-2xl bg-dark-200/50 border border-light-800/10">
              <Image
                src="/empty.png"
                alt="No interviews"
                width={120}
                height={120}
                className="mb-4 opacity-70"
              />
              <p className="text-light-400 text-center mb-6">
                There are no interviews available right now
              </p>
              <Button asChild>
                <Link href="/interview">Create Interview</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
