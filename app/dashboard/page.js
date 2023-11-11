"use client";
import React, { useState } from "react";

export default function Dashboard({session}) {
  const [parentEmail, setParentEmail] = useState("");
  
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