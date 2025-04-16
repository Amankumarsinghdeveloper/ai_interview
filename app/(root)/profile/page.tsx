import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getUserCredits,
  getCreditTransactionHistory,
  getCreditPriceInRs,
  getCreditCostPerMinute,
} from "@/lib/actions/credit.action";
import CreditStatus from "@/components/CreditStatus";
import TransactionHistory from "@/components/TransactionHistory";
import BuyCreditsForm from "@/components/BuyCreditsForm";
import Offer from "@/components/offer";
// import { ReferralShare } from "@/components/ReferralShare";

const ProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { credits } = await getUserCredits(user.id);
  const { transactions } = await getCreditTransactionHistory(user.id);
  const creditPrice = await getCreditPriceInRs();
  const minuteCost = await getCreditCostPerMinute();

  return (
    <div className="container mx-auto py-10 px-4 flex flex-col gap-8 max-w-6xl">
      <Offer />

      <header className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Your Profile
        </h1>
        <div className="bg-gray-800/50 px-4 py-2 rounded-full text-gray-300 text-sm font-medium">
          Member since today
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden transition-all duration-300 hover:shadow-indigo-900/20 hover:shadow-2xl border border-gray-800/50 group">
          <div className="border-b border-gray-800/50 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              User Information
            </h2>
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-1">Full Name</span>
              <span className="text-white font-medium text-lg">
                {user.name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-1">Email Address</span>
              <span className="text-white font-medium text-lg break-all">
                {user.email}
              </span>
            </div>
          </div>
        </div>

        <CreditStatus
          credits={credits}
          minuteCost={minuteCost}
          id="credit-status"
        />
      </div>

      {/* {user.referralCode && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-800/50 transition-all duration-300 hover:shadow-indigo-900/20 hover:shadow-2xl">
          <div className="border-b border-gray-800/50 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Refer & Earn</h2>
            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-6 leading-relaxed">
              Share your unique referral code with friends and earn bonus
              credits.
              <span className="text-purple-400 ml-1 font-medium">
                Each successful referral gives you additional interview time!
              </span>
            </p>
            <ReferralShare referralCode={user.referralCode} />
          </div>
        </div>
      )} */}

      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-800/50 transition-all duration-300 hover:shadow-indigo-900/20 hover:shadow-2xl"
        id="credits"
      >
        <div className="border-b border-gray-800/50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Buy Credits</h2>
          <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
              <path
                fillRule="evenodd"
                d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-xl border border-purple-500/30 shadow-lg flex-1 w-full">
              <p className="text-gray-300 mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Each credit equals 1 minute of interview time</span>
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Regular price:</span>
                  <span className="text-gray-400 line-through">
                    $
                    {(Number(creditPrice) + Number(creditPrice) * 0.3).toFixed(
                      2
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-500/20 px-3 py-1 rounded-l-lg border-l-4 border-green-500">
                    <span className="text-green-400 font-bold text-lg">
                      30% OFF
                    </span>
                  </div>
                  <div className="bg-purple-900/40 px-3 py-1 rounded-r-lg">
                    <span className="text-white font-bold text-xl">
                      ${creditPrice}
                    </span>
                    <span className="text-gray-400 ml-1 text-xs">/credit</span>
                  </div>
                </div>
                <div className="mt-3 text-sm text-purple-300">
                  <p>
                    Use code{" "}
                    <span className="font-mono font-bold bg-white/10 px-2 py-0.5 rounded">
                      LAUNCHOFF
                    </span>{" "}
                    for additional 30% OFF
                  </p>
                </div>
              </div>
            </div>
          </div>

          <BuyCreditsForm userId={user.id} creditPrice={creditPrice} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-800/50 transition-all duration-300 hover:shadow-indigo-900/20 hover:shadow-2xl">
        <div className="border-b border-gray-800/50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Transaction History
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
                d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM9.75 17.25a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0v-.75Zm2.25-3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0v-5.25Z"
                clipRule="evenodd"
              />
              <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
            </svg>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-300 mb-6 leading-relaxed">
            Your complete transaction history showing credit purchases and
            usage.
          </p>

          <TransactionHistory
            transactions={transactions as unknown as Transaction[]}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
