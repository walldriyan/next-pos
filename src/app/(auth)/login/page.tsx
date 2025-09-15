"use client";

import { useState } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";


export default function LoginPage() {
  const {status } = useSession();



  console.log("status : ", status);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL එකේ error parameter එක check කරන්න
  const urlError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("Login attempt for:", email);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("Full Login error object:", result);
        // Error පිටුවට redirect කරනකොට error එක pass කරනවා
        router.push(`/error?error=${result.error}`);
        return; // Redirect එකෙන් පස්සේ function එක නවත්වනවා
      }

      if (result?.ok) {
        console.log("Login successful, checking session...");
        // Session එක manually refresh කරන්න
        const session = await getSession();
        console.log("Updated session:", session);

        if (session?.user) {
          console.log("Redirecting to home...");
          router.push("/");
          router.refresh(); // Page එක refresh කරන්න
        } else {
          setError("Session එක හදාගන්න බැරි වුණා");
        }
      }
    } catch (error) {
      console.error("Login catch error:", error);
      setError("Network error එකක් ඇති වුණා");
    } finally {
      setIsLoading(false);
    }
  };

  // URL error handle කරන්න
  const getErrorMessage = () => {
    if (error) return error;

    switch (urlError) {
      case "CredentialsSignin":
        return "ඊමේල් හෝ මුරපදය වැරදියි";
      case "Configuration":
        return "Server configuration issue එකක් තියෙනවා";
      default:
        return urlError ? "Login කරන්න බැරි වුණා" : "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ඔයාගේ Account එකට Login වෙන්න
          </h2>
          {process.env.NODE_ENV === "development" && (
            <p className="text-sm text-center text-gray-500 mt-2">
              Development Mode: Debug logs console එකේ පෙන්නෙනවා
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                ඊමේල්
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="ඊමේල් ලිපිනය"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                මුරපදය
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="මුරපදය"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {(getErrorMessage() || error) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error || getErrorMessage()}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Login වෙනවා...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </div>

          <div>
            {" "}
          {status}
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-center text-sm text-gray-600 font-semibold mb-2">
              Test Accounts:
            </p>
            <div className="space-y-1 text-xs text-gray-700">
              <p>
                <strong>Admin:</strong> admin@test.com / 123456
              </p>
              <p>
                <strong>Manager:</strong> manager@test.com / 123456
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
