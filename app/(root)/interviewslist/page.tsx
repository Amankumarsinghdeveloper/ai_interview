import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserIdList,
  getLatestInterviewsList,
} from "@/lib/actions/general.action";
import InterviewsContent from "@/components/InterviewsContent";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const InterviewsListPage = async ({ searchParams }: SearchParams) => {
  // Get query parameters
  const { tab = "your", query = "" } = await searchParams;

  // Fetch user data on the server
  const user = await getCurrentUser();

  // If no user is found, show a message (should not happen due to middleware)
  if (!user) {
    return (
      <div className="text-center p-8">
        <p>No user found. Please sign in again.</p>
      </div>
    );
  }

  // Pre-fetch the initial interview data based on the active tab
  const initialUserInterviews = await getInterviewsByUserIdList(user.id, {
    limit: 9,
    searchQuery: query,
  });

  const initialAvailableInterviews = await getLatestInterviewsList(user.id, {
    limit: 9,
    searchQuery: query,
  });

  // Convert to specific type to avoid type issues
  return (
    <InterviewsContent
      user={user}
      initialTab={tab}
      initialUserInterviews={initialUserInterviews}
      initialAvailableInterviews={initialAvailableInterviews}
    />
  );
};

export default InterviewsListPage;
