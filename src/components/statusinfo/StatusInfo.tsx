import { Button, Flex, Text } from "@radix-ui/themes";
import { signOut, useSession } from "next-auth/react";
import React from "react";

function StatusInfo() {
  const { data: session, status } = useSession();

  return (
    <div className="p-4">

      <Flex direction="column" gap="2">
        <Text>Hello from Radix Themes </Text>
        <Button>Let's go</Button>
      </Flex>


      <button
        onClick={() => signOut()}
        className="bg-blue-500  text-xs text-white px-4 my-2 py-2 rounded"
      >
        Go to Login
      </button>
      <p>Session Status: {status}</p>
      {session?.user && (
        <div>
          <p>Logged in as: {session.user.name}</p>
          <p>Email: {session.user.email}</p>
          <p>Role: {session.user.role}</p>
          <p>Company ID: {session.user.companyId}</p>
          <p>Permissions: {session.user.permissions?.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default StatusInfo;
