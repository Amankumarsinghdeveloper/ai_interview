"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { auth, googleProvider } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/actions/auth.action";

type FormType = "sign-in" | "sign-up";

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const isSignIn = type === "sign-in";
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setFormError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get the Google credential
      const idToken = await user.getIdToken();

      if (!user.email) {
        toast.error("Could not get email from Google account");
        return;
      }

      // Always create the user in our database regardless of sign-in or sign-up
      // This ensures a user document exists when logging in with Google
      await signUp({
        uid: user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        password: "", // Not needed for Google auth
      });

      // Sign in the user with our app
      await signIn({
        email: user.email,
        idToken,
      });

      toast.success(
        isSignIn
          ? "Signed in successfully."
          : "Account created and signed in successfully."
      );
      router.push("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred with Google Sign In. Please try again.";
      setFormError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/logo.svg"
          alt="PrepWise"
          width={72}
          height={72}
          className="mb-4"
        />
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary-100 to-primary-200 text-transparent bg-clip-text">
          {isSignIn ? "Welcome Back" : "Join PrepWise"}
        </h2>
        <p className="text-light-400 text-center mt-3 max-w-xs">
          {isSignIn
            ? "Sign in to continue practicing interviews"
            : "Get started with your interview preparation"}
        </p>
      </div>

      <div className="bg-gradient-to-br from-dark-200 to-dark-300 p-8 rounded-2xl shadow-xl border border-light-800/10 backdrop-blur-sm">
        {formError && (
          <div className="bg-destructive-100/10 border border-destructive-100/30 text-destructive-100 px-4 py-3 rounded-xl mb-6 text-sm">
            {formError}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-6 font-medium flex gap-3 items-center justify-center text-base rounded-xl transition-all hover:bg-light-800/10"
        >
          {googleLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary-100"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            <>
              <Image src="/google.svg" alt="Google" width={22} height={22} />
              <span>
                {isSignIn ? "Sign in with Google" : "Sign up with Google"}
              </span>
            </>
          )}
        </Button>

        <div className="mt-6 text-center">
          <p className="text-light-400 text-sm">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
            <Button
              type="button"
              variant="link"
              onClick={() => router.push(isSignIn ? "/sign-up" : "/sign-in")}
              className="font-medium px-2 py-0 h-auto"
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
