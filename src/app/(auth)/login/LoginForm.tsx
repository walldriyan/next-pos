"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Flex,
  Checkbox,
  Text,
  TextField,
} from "@radix-ui/themes";
import { EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";

const getErrorMessage = (error: string | null) => {
  if (!error) return "";
  switch (error) {
    case "CredentialsSignin":
      return "ඊමේල් හෝ මුරපදය වැරදියි.";
    case "Configuration":
      return "Server configuration issue එකක් තියෙනවා.";
    default:
      return "Login වීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.";
  }
};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        rememberMe,
        redirect: false,
      });

      if (result?.error) {
        // signIn function එකෙන් එන error එක state එකට දානවා
        setError(result.error);
      } else if (result?.ok) {
        // සාර්ථක නම්, home page එකට redirect කරනවා
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Login catch error:", err);
      setError("Network error එකක් ඇති වුණා.");
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || urlError;

  return (
    <div className="w-96 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold mb-1 block" htmlFor="email">
              ඊමේල් ලිපිනය
            </label>
            <TextField.Root
              size="2"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            > 
              <TextField.Slot>
                <EnvelopeClosedIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
          </div>
          <div>
            <label className="text-sm font-bold mb-1 block" htmlFor="password">
              මුරපදය
            </label>
            <TextField.Root
              size="2"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            >
              <TextField.Slot>
                <LockClosedIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
          </div>

       <Flex align="center" gap="2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <label htmlFor="remember-me" className="text-sm">මාව මතක තබාගන්න</label>
          </Flex>
          
          {displayError && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md text-sm">
              <p>
                {getErrorMessage(displayError)}
              </p>
            </div>
          )}
          <Button size="2" type="submit" disabled={isLoading} highContrast>
            {isLoading ? "Login වෙනවා..." : "Login"}
          </Button>

          {process.env.NODE_ENV === "development" && (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-gray-600">
                  Test Accounts:
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Admin:</strong> admin@test.com / 123456
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Manager:</strong> manager@test.com / 123456
                </p>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}