import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
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
      Behavioral: "bg-primary-100/80 text-primary-200",
      Mixed: "bg-light-400/20 text-light-100",
      Technical: "bg-primary-200/80 text-white",
    }[normalizedType] || "bg-light-400/20 text-light-100";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="group hover:scale-[1.02] transition-all duration-300">
      <div className="card-interview backdrop-filter backdrop-blur-sm border border-light-800/10 shadow-xl group-hover:shadow-2xl">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-3 right-3 w-fit px-4 py-1.5 rounded-full text-xs font-semibold shadow-md",
              badgeColor
            )}
          >
            <p className="badge-text">{normalizedType}</p>
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
          <h3 className="text-center capitalize text-white mb-4">
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
              <p className="text-sm">{formattedDate}</p>
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
              <p className="text-sm">{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <div className="mt-6 p-4 bg-dark-300/50 rounded-xl">
            <p className="line-clamp-2 text-sm">
              {feedback?.finalAssessment ||
                "You haven't taken this interview yet. Take it now to improve your skills."}
            </p>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center">
          <DisplayTechIcons techStack={techstack} />

          <Button
            variant={feedback ? "default" : "secondary"}
            size="sm"
            className="font-semibold"
            asChild
          >
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? "View Feedback" : "Start Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
