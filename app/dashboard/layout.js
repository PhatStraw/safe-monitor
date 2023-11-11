'use client'
import { Sidebar } from "../../components/SideBar";
import MobileNav from '../../components/MobileNav'
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const items = [
    {
        href: "/dashboard",
        title: "Dashboard",
      },
    {
      href: "/dashboard/overview",
      title: "Overview",
    },
    {
      href: "/dashboard/profile",
      title: "Profile",
    },
    {
      href: "/dashboard/subscriptions",
      title: "Subscriptions",
    },
    {
      href: "/dashboard/likes",
      title: "Likes",
    },
    {
      href: "/dashboard/comments",
      title: "Comments",
    },
  ];

export default function DashboardLayout({
  children, // will be a page or nested layout
}) {
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
          redirect("/api/auth/signin");
        },
      });
      
    if(!session) redirect("/")

    return (
        <div id="home" className="max-w-7xl xl:border xl:rounded mx-auto flex mt-5 h-[100vh]">
          <Sidebar items={items}/>
          {children}
          <MobileNav/>
        </div>
      );
    }

