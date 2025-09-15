"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Flex, Heading, Text } from "@radix-ui/themes";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <Flex align="center" justify="center" style={{ height: "100vh" }}>
        <Text>Loading...</Text>
      </Flex>
    );
  }

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <Flex align="center" justify="center" direction="column" gap="4" style={{ height: "100vh" }}>
      <Heading size="7">ඔබගේ ගිණුමට පිවිසෙන්න</Heading>
      <LoginForm />
    </Flex>
  );
}
