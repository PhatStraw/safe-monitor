"use client";
import { Sidebar } from "../../components/SideBar";
import MobileNav from "../../components/MobileNav";
import React from "react";
import { redirect } from "next/navigation";
import useFetchSession from "@/components/hooks/UseFetchSession";

export default function DashboardLayout({ children }) {
  const session = useFetchSession();
  return (
    <div
      id="home"
      className="max-w-7xl xl:rounded-xl shadow-2xl xl:rounded mx-auto flex border h-[92vh]"
    >
      <Sidebar />
      {session !== null
        ? children
        : redirect("/api/auth/signin")}
      <MobileNav />
    </div>
  );
}
