import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getCurrentUser, isAuthenticated } from "@/lib/actions/auth.action";
import LogoutButton from "@/components/LogoutButton";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-light-800/10 backdrop-blur-sm sticky top-0 z-50 bg-dark-100/80">
        <div className="container max-w-7xl mx-auto px-5 sm:px-10 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="prepwise logo"
              width={30}
              height={30}
              className="size-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-100 to-primary-200 text-transparent bg-clip-text">
              PrepWise
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-full bg-primary-200 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-light-100 hidden sm:inline-block">
                    {user.name || user.email?.split("@")[0]}
                  </span>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="text-primary-200 font-medium hover:text-primary-100 transition-colors text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="root-layout">{children}</main>

      <footer className="border-t border-light-800/10 py-6 text-center text-sm text-light-400">
        <div className="container max-w-7xl mx-auto px-5 sm:px-10">
          <p>© {new Date().getFullYear()} PrepWise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
