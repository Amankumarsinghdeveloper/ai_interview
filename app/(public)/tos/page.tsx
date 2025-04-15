import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-10 px-4 flex flex-col gap-8 max-w-6xl">
      <header className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Terms of Service
        </h1>
        <div className="bg-gray-800/50 px-4 py-2 rounded-full text-gray-300 text-sm font-medium">
          Last Updated: {new Date().toLocaleDateString()}
        </div>
      </header>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-800/50 transition-all duration-300 hover:shadow-purple-900/10 hover:shadow-xl">
        <div className="border-b border-gray-800/50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Terms & Conditions
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
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="p-6 prose prose-invert max-w-none">
          <div className="text-gray-300 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                Welcome to Prep Pilot. These Terms of Service
                (&quot;Terms&quot;) govern your access to and use of our
                website, services, and applications (collectively, the
                &quot;Services&quot;). By accessing or using our Services, you
                agree to be bound by these Terms.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
              <h2 className="text-xl font-semibold mb-4 text-white">
                2. Your Account
              </h2>
              <p className="leading-relaxed">
                To access certain features of our Services, you may need to
                create an account. You are responsible for maintaining the
                confidentiality of your account credentials and for all
                activities that occur under your account. You agree to notify us
                immediately of any unauthorized use of your account.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                3. User Content
              </h2>
              <p className="leading-relaxed">
                Our Services may allow you to post, upload, or submit content.
                You retain ownership of any intellectual property rights that
                you hold in that content. By posting content, you grant us a
                worldwide, royalty-free license to use, reproduce, modify,
                adapt, publish, translate, create derivative works from,
                distribute, and display such content in connection with
                providing our Services.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
              <h2 className="text-xl font-semibold mb-4 text-white">
                4. Service Usage
              </h2>
              <p className="mb-4 leading-relaxed">
                You agree to use our Services only for purposes that are legal,
                proper, and in accordance with these Terms. You agree not to use
                our Services:
              </p>
              <ul className="grid grid-cols-1 gap-3 pl-6">
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    In any way that violates any applicable law or regulation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    To impersonate or attempt to impersonate our company, an
                    employee, or any other person.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    To engage in any conduct that restricts or inhibits
                    anyone&apos;s use or enjoyment of the Services.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    To attempt to gain unauthorized access to any part of our
                    Services.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                5. Referral Program
              </h2>
              <p className="mb-4 leading-relaxed">
                Our Service includes a referral program where users can earn
                additional credits by referring new users. By participating in
                the referral program, you agree to the following:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-900/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                      </svg>
                    </div>
                    <h3 className="text-purple-300 font-medium">
                      Personal Use
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Referral codes are intended for personal use and should not
                    be published or distributed on public coupon sites.
                  </p>
                </div>

                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
                        <path
                          fillRule="evenodd"
                          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a3.833 3.833 0 0 0 1.719-.756c.712-.566 1.112-1.35 1.112-2.178 0-.829-.4-1.612-1.113-2.178a3.833 3.833 0 0 0-1.718-.756V8.334c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-blue-300 font-medium">
                      Program Changes
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    We reserve the right to modify or terminate the referral
                    program at any time.
                  </p>
                </div>

                <div className="bg-red-900/20 p-4 rounded-lg border border-red-900/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-300">
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
                    <h3 className="text-red-300 font-medium">
                      Fraud Prevention
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    We may revoke referral credits if we detect any fraudulent,
                    abusive, or illegal activity.
                  </p>
                </div>

                <div className="bg-green-900/20 p-4 rounded-lg border border-green-900/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
                          clipRule="evenodd"
                        />
                        <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
                      </svg>
                    </div>
                    <h3 className="text-green-300 font-medium">
                      Multiple Accounts
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    You cannot create multiple accounts to benefit from your own
                    referral code.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
              <h2 className="text-xl font-semibold mb-4 text-white">
                6. Credits System
              </h2>
              <p className="mb-4 leading-relaxed">
                Our platform uses a credits system for accessing certain
                features:
              </p>
              <ul className="space-y-3 pl-6">
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-blue-400 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Credits can be earned through our referral program or
                    purchased directly.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-blue-400 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Credits have no monetary value and cannot be transferred or
                    redeemed for cash.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-blue-400 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    We reserve the right to modify the credit pricing,
                    expiration, or usage policies at any time.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-blue-400 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Unused credits may expire after a certain period of account
                    inactivity.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                7. Intellectual Property
              </h2>
              <p className="leading-relaxed">
                The Services and all content and materials included on the
                Services, including but not limited to text, graphics, logos,
                images, and software, are the property of Prep Pilot or our
                licensors and are protected by copyright, trademark, and other
                intellectual property laws.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  8. Disclaimer of Warranties
                </h2>
                <p className="leading-relaxed">
                  Our Services are provided &quot;as is&quot; and &quot;as
                  available,&quot; without any warranties of any kind, either
                  express or implied. We disclaim all warranties, including but
                  not limited to implied warranties of merchantability, fitness
                  for a particular purpose, and non-infringement.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/30">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  9. Limitation of Liability
                </h2>
                <p className="leading-relaxed">
                  In no event will Prep Pilot, its affiliates, or their
                  licensors, service providers, employees, agents, officers, or
                  directors be liable for damages of any kind, including but not
                  limited to direct, indirect, special, incidental,
                  consequential, or punitive damages, arising out of or in
                  connection with your use of our Services.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                10. Changes to These Terms
              </h2>
              <p className="leading-relaxed">
                We may revise these Terms from time to time. The most current
                version will always be posted on our website. By continuing to
                access or use our Services after revisions become effective, you
                agree to be bound by the revised Terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                11. Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us
                at:
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
