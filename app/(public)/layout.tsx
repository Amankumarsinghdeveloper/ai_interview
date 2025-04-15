import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/actions/auth.action";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isUserAuthenticated = await isAuthenticated();

  return (
    <div className="min-h-screen">
      <header className="border-b border-light-800/10 backdrop-blur-sm sticky top-0 z-50 bg-dark-100/80">
        <div className="container max-w-7xl mx-auto px-5 sm:px-10 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Prep Pilot logo"
              width={30}
              height={30}
              className="size-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-100 to-primary-200 text-transparent bg-clip-text">
              Prep Pilot
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isUserAuthenticated ? (
              <Link
                href="/dashboard"
                className="text-primary-200 font-medium hover:text-primary-100 transition-colors text-sm"
              >
                Dashboard
              </Link>
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

      <main className="public-layout">{children}</main>

      <footer className="border-t border-light-800/10 py-6">
        <div className="container max-w-7xl mx-auto px-5 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Prep Pilot logo"
                  width={24}
                  height={24}
                  className="size-6"
                />
                <span className="text-lg font-bold bg-gradient-to-r from-primary-100 to-primary-200 text-transparent bg-clip-text">
                  Prep Pilot
                </span>
              </Link>
              <p className="text-light-400 text-sm">
                Your AI-powered interview preparation assistant. Practice with
                realistic mock interviews and receive instant feedback.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-light-100 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-light-400 hover:text-primary-200 transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tos"
                    className="text-sm text-light-400 hover:text-primary-200 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-sm text-light-400 hover:text-primary-200 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-light-100 mb-4">Get Started</h3>
              <ul className="space-y-2">
                {isUserAuthenticated ? (
                  <li>
                    <Link
                      href="/dashboard"
                      className="text-sm text-light-400 hover:text-primary-200 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/sign-in"
                        className="text-sm text-light-400 hover:text-primary-200 transition-colors"
                      >
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/sign-up"
                        className="text-sm text-light-400 hover:text-primary-200 transition-colors"
                      >
                        Create Account
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-light-800/10 text-center text-sm text-light-400">
            <p>© {new Date().getFullYear()} PrepPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
