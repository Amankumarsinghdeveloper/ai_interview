"use client";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/utl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const InterviewsFilter = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = searchParams.get("tab") || "your";
  const query = searchParams.get("query") || "";

  const [activeTabs, setActiveTabs] = useState(activeTab);
  const [searchQuery, setSearchQuery] = useState(query);

  const handleTabChange = (tab: string) => {
    setActiveTabs(tab);
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "tab",
      value: tab,
    });

    router.push(newUrl);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });

        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === "/interviewslist") {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, searchParams, pathname]);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div className="tabs-container">
        <button
          onClick={() => handleTabChange("your")}
          className={`tab-button cursor-pointer ${
            activeTabs === "your"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          } px-6 py-3 rounded-l-lg font-medium transition-all duration-200`}
        >
          Your Interviews
        </button>
        <button
          onClick={() => handleTabChange("available")}
          className={`tab-button cursor-pointer ${
            activeTabs === "available"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          } px-6 py-3 rounded-r-lg font-medium transition-all duration-200`}
        >
          Available Interviews
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container w-full sm:w-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search interviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default InterviewsFilter;
