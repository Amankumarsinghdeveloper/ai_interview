import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-10 px-4 flex flex-col gap-8 max-w-6xl">
      <header className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Privacy Policy
        </h1>
        <div className="bg-gray-800/50 px-4 py-2 rounded-full text-gray-300 text-sm font-medium">
          Last Updated: {new Date().toLocaleDateString()}
        </div>
      </header>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-800/50 transition-all duration-300 hover:shadow-purple-900/10 hover:shadow-xl">
        <div className="border-b border-gray-800/50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Our Commitment to Privacy
          </h2>
          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="p-6 prose prose-invert max-w-none">
          <div className="text-gray-300 space-y-6">
            <p className="leading-relaxed">
              Welcome to Prep Pilot. We respect your privacy and are committed
              to protecting your personal data. This privacy policy will inform
              you about how we look after your personal data when you visit our
              website and tell you about your privacy rights and how the law
              protects you.
            </p>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
              <h2 className="text-xl font-semibold mb-4 text-white">
                The Data We Collect About You
              </h2>
              <p className="mb-4">
                Personal data, or personal information, means any information
                about an individual from which that person can be identified. We
                may collect, use, store and transfer different kinds of personal
                data about you which we have grouped together as follows:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-gray-300">
                <li>
                  <span className="text-purple-400 font-medium">
                    Identity Data
                  </span>{" "}
                  - includes first name, last name, username or similar
                  identifier.
                </li>
                <li>
                  <span className="text-purple-400 font-medium">
                    Contact Data
                  </span>{" "}
                  - includes email address.
                </li>
                <li>
                  <span className="text-purple-400 font-medium">
                    Technical Data
                  </span>{" "}
                  - includes internet protocol (IP) address, browser type and
                  version, time zone setting and location, browser plug-in types
                  and versions, operating system and platform, and other
                  technology on the devices you use to access this website.
                </li>
                <li>
                  <span className="text-purple-400 font-medium">
                    Usage Data
                  </span>{" "}
                  - includes information about how you use our website and
                  services.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                How We Use Your Personal Data
              </h2>
              <p className="mb-4">
                We will only use your personal data when the law allows us to.
                Most commonly, we will use your personal data in the following
                circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-gray-300">
                <li>
                  Where we need to perform the contract we are about to enter
                  into or have entered into with you.
                </li>
                <li>
                  Where it is necessary for our legitimate interests (or those
                  of a third party) and your interests and fundamental rights do
                  not override those interests.
                </li>
                <li>Where we need to comply with a legal obligation.</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Data Security
              </h2>
              <p>
                We have put in place appropriate security measures to prevent
                your personal data from being accidentally lost, used or
                accessed in an unauthorized way, altered or disclosed. In
                addition, we limit access to your personal data to those
                employees, agents, contractors and other third parties who have
                a business need to know.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                Data Retention
              </h2>
              <p>
                We will only retain your personal data for as long as reasonably
                necessary to fulfill the purposes we collected it for, including
                for the purposes of satisfying any legal, regulatory, tax,
                accounting or reporting requirements.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Your Legal Rights
              </h2>
              <p className="mb-4">
                Under certain circumstances, you have rights under data
                protection laws in relation to your personal data, including the
                right to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-green-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Request access to your personal data.
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-green-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Request correction of your personal data.
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-green-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Request erasure of your personal data.
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-green-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Object to processing of your personal data.
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-green-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Request restriction of processing your personal data.
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-green-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Request transfer of your personal data.
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-green-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Right to withdraw consent.
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about this privacy policy or our
                privacy practices, please contact us at:
              </p>
              <div className="flex items-center gap-3 bg-blue-500/10 text-blue-300 px-4 py-3 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                <span className="font-medium">support@prep-pilot.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
