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
  },
  {
    href: "/dashboard/profile",
    title: "Profile",
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
      className="max-w-7xl  xl:rounded mx-auto flex  h-[92vh] "
    >
      <Sidebar items={items} />
      {session !== null
        ? React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { session });
            }
            return child;
          })
        : redirect("/api/auth/signin")}
      <MobileNav />
    </div>
  );
}
