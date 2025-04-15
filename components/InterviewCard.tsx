import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import DisplayTechIcons from "./DisplayTechIcons";
import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-blue-600/80 text-white",
      Mixed: "bg-purple-600/80 text-white",
      Technical: "bg-indigo-600/80 text-white",
    }[normalizedType] || "bg-gray-600/80 text-white";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="group hover:scale-[1.02] transition-all duration-300">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-gray-800/50 p-6 hover:shadow-blue-900/20 transition-all duration-300 flex flex-col justify-between h-full gap-5">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-3 right-3 w-fit px-4 py-1 rounded-full text-xs font-semibold shadow-md",
              badgeColor
            )}
          >
            <p className="font-medium">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <div className="flex items-center justify-center mb-6">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={90}
              height={90}
              className="rounded-full object-cover size-24 shadow-lg border-2 border-primary-200/20"
            />
          </div>

          {/* Interview Role */}
          <h3 className="text-center capitalize text-white mb-4 text-xl">
            {role} Interview
          </h3>

          {/* Date & Score */}
          <div className="flex flex-row justify-center gap-6 mt-3">
            <div className="flex flex-row gap-2 items-center">
              <div className="bg-dark-300 p-2 rounded-full">
                <Image
                  src="/calendar.svg"
                  width={18}
                  height={18}
                  alt="calendar"
                  className="opacity-80"
                />
              </div>
              <p className="text-sm text-gray-300">{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <div className="bg-dark-300 p-2 rounded-full">
                <Image
                  src="/star.svg"
                  width={18}
                  height={18}
                  alt="star"
                  className="opacity-80"
                />
              </div>
              <p className="text-sm text-gray-300">
                {feedback?.totalScore || "---"}/100
              </p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <div className="mt-6 p-4 bg-dark-300/50 rounded-xl">
            <p className="line-clamp-2 text-sm text-gray-300">
              {feedback?.finalAssessment ||
                "You haven't taken this interview yet. Take it now to improve your skills."}
            </p>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center">
          <DisplayTechIcons techStack={techstack} />

          <Link
            href={
              feedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium text-white shadow-lg transition-all duration-300",
              feedback
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            )}
          >
            {feedback ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M11.625 16.5a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75Z" />
                  <path
                    fillRule="evenodd"
                    d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm6 16.5c.66 0 1.277-.19 1.797-.518l1.048 1.048a.75.75 0 0 0 1.06-1.06l-1.047-1.048A3.375 3.375 0 1 0 11.625 18Z"
                    clipRule="evenodd"
                  />
                  <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
                </svg>
                View Feedback
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                Start Interview
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
