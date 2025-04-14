"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { auth, googleProvider } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { signIn, signUp } from "@/lib/actions/auth.action";

// Define a schema for authentication
const AuthSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormType = "sign-in" | "sign-up";

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const isSignIn = type === "sign-in";
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const form = useForm<z.infer<typeof AuthSchema>>({
    resolver: zodResolver(AuthSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof AuthSchema>) => {
    setIsLoading(true);
    setFormError("");

    try {
      if (isSignIn) {
        const { email, password } = values;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      } else {
        const { name, email, password } = values;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

      // For sign up, create the user in our database
      if (!isSignIn) {
        await signUp({
          uid: user.uid,
          name: user.displayName || user.email.split("@")[0],
          email: user.email,
          password: "", // Not needed for Google auth
        });
      }

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
          width={60}
          height={60}
          className="mb-3"
        />
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary-100 to-primary-200 text-transparent bg-clip-text">
          {isSignIn ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-light-400 text-center mt-2 max-w-xs">
          {isSignIn
            ? "Sign in to continue practicing interviews"
            : "Join PrepWise to prepare for your interviews"}
        </p>
      </div>

      <div className="bg-gradient-to-br from-dark-200 to-dark-300 p-6 sm:p-8 rounded-2xl shadow-xl border border-light-800/10 backdrop-blur-sm">
        {formError && (
          <div className="bg-destructive-100/10 border border-destructive-100/30 text-destructive-100 px-4 py-3 rounded-xl mb-6 text-sm">
            {formError}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading || googleLoading}
              className="w-full font-semibold"
            >
              {isLoading
                ? "Processing..."
                : isSignIn
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-light-800/20"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 text-light-400">OR CONTINUE WITH</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading || googleLoading}
          className="w-full font-medium flex gap-2 items-center justify-center"
        >
          {googleLoading ? (
            "Connecting..."
          ) : (
            <>
              <Image src="/google.svg" alt="Google" width={18} height={18} />
              <span>Google</span>
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
