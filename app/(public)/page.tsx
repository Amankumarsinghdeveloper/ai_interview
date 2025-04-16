import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/actions/auth.action";

export default async function HomePage() {
  const isUserAuthenticated = await isAuthenticated();

  return (
    <div className="container max-w-7xl mx-auto px-5 sm:px-10 py-12">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text leading-tight">
              Master Your Interview Skills with AI
            </h1>
            <p className="text-xl text-light-300">
              PrepPilot uses advanced AI to simulate realistic interview
              scenarios, providing personalized feedback to help you land your
              dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {isUserAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-900/30"
                >
                  Go to Dashboard
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
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-900/30"
                  >
                    Get Started Free
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
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                  <Link
                    href="/sign-in"
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium border border-light-800 text-light-200 hover:text-white hover:border-light-700 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-64 bg-blue-600/20 rounded-full blur-3xl"></div>
            <Image
              src="/robot.png"
              alt="AI Interview Assistant"
              width={500}
              height={500}
              className="relative z-10 mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text inline-block mb-4">
            Why Choose Prep Pilot?
          </h2>
          <p className="text-xl text-light-300 max-w-3xl mx-auto">
            Our platform provides everything you need to excel in your next
            interview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 shadow-lg transition-all duration-300 hover:shadow-blue-900/10">
            <div className="size-14 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-blue-400"
              >
                <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Realistic Interviews
            </h3>
            <p className="text-light-400">
              Practice with AI that simulates real interviewer behaviors,
              questions, and conversation flows.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 shadow-lg transition-all duration-300 hover:shadow-blue-900/10">
            <div className="size-14 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-purple-400"
              >
                <path
                  fillRule="evenodd"
                  d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5zm6.61 10.936a.75.75 0 10-1.22.872l1.5 2.1a.75.75 0 001.164.114l3.75-4.5a.75.75 0 00-1.147-.967l-3.066 3.68-.981-1.3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Instant Feedback
            </h3>
            <p className="text-light-400">
              Receive detailed analysis and improvement suggestions immediately
              after each practice session.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 shadow-lg transition-all duration-300 hover:shadow-blue-900/10">
            <div className="size-14 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-green-400"
              >
                <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Specialized Focus
            </h3>
            <p className="text-light-400">
              Choose from various interview types and roles, tailored to your
              specific career goals.
            </p>
          </div>
        </div>
      </section>

      {/* Image Access Example Section */}
      {/* <section className="py-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Public Images Access
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-light-400 mb-4">
                All public images are easily accessible without authentication:
              </p>
              <ul className="space-y-2 text-light-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Direct access via /logo.svg
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Optimized images via /images/logo.svg
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  All assets in public directory
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Image
                  src="/images/logo.svg"
                  alt="Public Image Example"
                  width={120}
                  height={120}
                  className="bg-gray-800 p-4 rounded-lg"
                />
                <span className="text-sm text-light-400">
                  Access public images without authentication
                </span>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* How It Works Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text inline-block mb-4">
            How Prep Pilot Works
          </h2>
          <p className="text-xl text-light-300 max-w-3xl mx-auto">
            Three simple steps to improve your interview performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative">
            <div className="absolute -top-4 -left-4 size-12 rounded-full bg-blue-600/80 text-white font-bold flex items-center justify-center z-10">
              1
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 shadow-lg transition-all duration-300 hover:shadow-blue-900/10 h-full">
              <h3 className="text-xl font-semibold text-white mb-4 mt-2">
                Create your profile
              </h3>
              <p className="text-light-400">
                Sign up and tell us about your target role, experience level,
                and areas you want to improve.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -left-4 size-12 rounded-full bg-purple-600/80 text-white font-bold flex items-center justify-center z-10">
              2
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 shadow-lg transition-all duration-300 hover:shadow-blue-900/10 h-full">
              <h3 className="text-xl font-semibold text-white mb-4 mt-2">
                Practice with AI
              </h3>
              <p className="text-light-400">
                Participate in realistic AI-driven interviews tailored to your
                specific needs and industry.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -left-4 size-12 rounded-full bg-green-600/80 text-white font-bold flex items-center justify-center z-10">
              3
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 shadow-lg transition-all duration-300 hover:shadow-blue-900/10 h-full">
              <h3 className="text-xl font-semibold text-white mb-4 mt-2">
                Get better, fast
              </h3>
              <p className="text-light-400">
                Review detailed feedback, track your progress, and continually
                improve your interview skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="p-12 rounded-2xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-800/30 shadow-xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to ace your next interview?
          </h2>
          <p className="text-xl text-light-300 max-w-2xl mx-auto mb-8">
            Join thousands of job seekers who have improved their interview
            skills with Prep Pilot.
          </p>
          {isUserAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-900/30"
            >
              Go to Dashboard
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
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          ) : (
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-900/30"
            >
              Start Practicing Now
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
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
