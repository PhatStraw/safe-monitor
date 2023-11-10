"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { UserSettings } from "@/components/user-settings";

export default function Page() {
  const [parentEmail, setParentEmail] = useState("");
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin");
    },
  });

  const handleData = async () => {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: session?.accessToken,
        refresh_token: session?.refreshToken,
        parent_email: parentEmail,
      }),
    });
    const data = await response.json();
    console.log(data);
  };

  console.log(session);

  return (
   <UserSettings />
  );
}
