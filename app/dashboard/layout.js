"use client";
import { Sidebar } from "../../components/SideBar";
import MobileNav from "../../components/MobileNav";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import useFetchSession from "@/components/hooks/UseFetchSession";
const items = [
  {
    href: "/dashboard",
    title: "Home",
    icon: (
      <svg
        className=" h-6 w-6 text-gray-500"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    href: "/dashboard/profile",
    title: "Profile",
    icon: (
      <svg
      className=" h-6 w-6 text-gray-500"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
    )
  },
  // {
  //   href: "/dashboard/overview",
  //   title: "Overview",
  // },
  // {
  //   href: "/dashboard/subscriptions",
  //   title: "Subscriptions",
  // },
  // {
  //   href: "/dashboard/likes",
  //   title: "Likes",
  // },
  // {
  //   href: "/dashboard/comments",
  //   title: "Comments",
  // },
];

export default function DashboardLayout({ children }) {
  const session = useFetchSession();
  return (
    <div
      id="home"
      className="max-w-7xl rounded-xl shadow-2xl xl:rounded mx-auto flex  h-[92vh]"
    >
      <Sidebar items={items} />
      {session !== null
        ? children
        : redirect("/api/auth/signin")}
      <MobileNav />
    </div>
  );
}
