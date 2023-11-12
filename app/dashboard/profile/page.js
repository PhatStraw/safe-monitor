'use client'
import React from "react";
import { UserSettings } from "@/components/user-settings";
import { useSession } from "next-auth/react";
export default function Page() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  if(loading) return <p>Loading...</p>
  
  return (
   <UserSettings session={session}/>
  );
}
