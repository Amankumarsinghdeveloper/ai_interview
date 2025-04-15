import Link from "next/link";
import React from "react";

export default function ContactPage() {
  return (
    <div className="container mx-auto py-10 px-4 flex flex-col max-w-6xl">
      <header className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-800 mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Contact Us
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We're here to help with any questions you have about Prep Pilot.
              Fill out the form or reach out via email, and our team will get
              back to you as soon as possible.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-800/50 transition-all duration-300 hover:shadow-purple-900/10">
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-300 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Email</h3>
                  <a
                    href="mailto:support@prep-pilot.com"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    support@prep-pilot.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Location</h3>
                  <p className="text-gray-400">
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-green-600/20 flex items-center justify-center text-green-300 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Phone</h3>
                  <p className="text-gray-400">+91 7474747474</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Helpful Resources
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tos"
                className="px-4 py-2 bg-gray-800/50 rounded-full text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy-policy"
                className="px-4 py-2 bg-gray-800/50 rounded-full text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-800/50 rounded-full text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-800/50 transition-all duration-300 hover:shadow-purple-900/10">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Send Us a Message
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="Your email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Subject of your message"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white resize-none"
                  placeholder="Your message"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-md transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
