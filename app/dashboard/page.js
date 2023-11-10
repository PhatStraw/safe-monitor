"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { Sidebar } from "../../components/SideBar";
const items = [
  {
    href: "/hey",
    title: "Overview",
  },
  {
    href: "/hey",
    title: "Profile",
  },
  {
    href: "/hey",
    title: "Subscriptions",
  },
  {
    href: "/hey",
    title: "Likes",
  },
  {
    href: "/hey",
    title: "Comments",
  },
];
export default function Dashboard() {
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
    <div id="home" className="max-w-7xl mx-auto flex pt-[75px] h-[100vh]">
      <Sidebar items={items} />
      <div className="m-7 font-bold">
        Welcome! If you havent already, please navigate to your profile and
        complete the Parent Email field. Once you hit save, you’ll receive an
        email notification whenever your content is linked. Thank you for
        joining us, and we're excited to have you on board!
      </div>
    </div>
  );
}
