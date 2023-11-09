"use client";

import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [parentEmail, setParentEmail] = useState("");
  const userEmail = session?.user?.email;
  const handleData = async () => {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: session?.token.token.token.token.account.access_token,
        refresh_token: session?.token.token.token.token.account.refresh_token,
        parent_email: parentEmail,
      }),
    });
    const data = await response.json();
    console.log(data);
  };

  if (status === "loading") {
    return <p>Hang on there...</p>;
  }

  if (status === "authenticated") {
    return (
      <>
        <p>Signed in as {userEmail}</p>
        <button onClick={() => signOut()}>Sign out</button>
        <button onClick={handleData}>fetch data</button>
        {/* Add an input field for the parent email */}
        <input
          type="email"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          placeholder="Parent Email"
        />
        <img src="https://cdn.pixabay.com/photo/2017/08/11/19/36/vw-2632486_1280.png" />
      </>
    );
  }

  return (
    <>
      <p>Not signed in.</p>
      <button onClick={() => signIn("google")}>Sign in</button>
    </>
  );
}
