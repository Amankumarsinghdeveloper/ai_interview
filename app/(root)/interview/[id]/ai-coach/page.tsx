import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import AICoachVapi from "@/components/AICoachVapi";

const AICoach = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  if (!feedback) redirect(`/interview/${id}`);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-emerald-500 text-transparent bg-clip-text">
          AI Interview Coach
        </h1>
        <p className="text-gray-400 text-lg capitalize">
          Get personalized guidance on your {interview.role} interview
          performance
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-gray-800/50 p-6 mb-8 hover:shadow-teal-900/10 transition-all duration-300">
        <AICoachVapi
          userName={user.name || "User"}
          userId={user.id}
          interviewId={id}
          interview={interview}
          feedback={feedback}
          userPhoto={user.photoURL || undefined}
        />
      </div>
    </div>
  );
};

export default AICoach;
