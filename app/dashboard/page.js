"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
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
    <div className="m-7 font-bold">
      Welcome! If you haven't already, please navigate to your profile and
      complete the Parent Email field. Once you hit save, you&apos;ll receive an
      email notification whenever your content is linked. Thank you for joining
      us, and we&apos;re excited to have you on board!
    </div>
  );
}