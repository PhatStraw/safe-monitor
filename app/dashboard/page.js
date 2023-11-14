"use client";
import React from "react";
import useSecondaryAccounts from "@/components/hooks/UseSecondaryAccounts";
import useFetchSession from "@/components/hooks/UseFetchSession";
import Link from "next/link";
import { DropDown } from "@/components/drop-down";

export default function Dashboard() {
  const session = useFetchSession();
  const { data: secondaryAccounts, isLoading } = useSecondaryAccounts({
    email: session?.user?.email,
  });

  if (isLoading) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  if (secondaryAccounts.data) {
    return (
      <div className="overflow-auto bg-primary/20 shadow p-5">
        {secondaryAccounts.data.map((account) => (
          <div key={account.account_id} className="mb-10 border-b pb-3">          
            <div className="flex flex-col lg:flex-row justify-between p-6">            
              <h3 className="text-2xl font-bold mb-2">
                YouTube Activity Summary
              </h3>
              
              <h2 className="text-2xl font-semibold mb-2">
                {account.name} ({account.email})
              </h2>
            </div>

            <DropDown title={"Content Analysis"} account={account} />

            <div className="bg-white shadow-lg border rounded-lg p-6 mb-3">           
              <h4 className="text-lg font-semibold mb-1">
                Psychological Analysis
              </h4>

              <p className="mb-3 bg-white p-1 border shadow rounded-lg text-start">
                {account.youtube_data?.email_newsletter.psych_analysis.overview}
              </p>
            </div>

            <div className="bg-white shadow-lg rounded-lg border p-6 mb-3">     
              <h5 className="text-lg font-lg font-bold mb-1">
                Topics to Discuss
              </h5>

              <ul className="list-inside mb-3">
                {account.youtube_data?.email_newsletter.psych_analysis.topics_to_discuss.map(
                  (topic, index) => (
                    <li key={index} className="text-md border-b my-1 p-1">
                      {topic}
                    </li>
                  )
                )}
              </ul>
            </div>

            <p className="bg-white border shadow-lg rounded-lg p-6 mb-1">
              {account.youtube_data?.email_newsletter.closing}
            </p>

          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full shadow-xl t-7 font-bold flex flex-col justify-center text-center">
      <h1 className="text-4xl mx-2 font-bold tracking-tighter md:text-5xl lg:text-6xl/none">
        Welcome to Safe Monitor
      </h1>

      <p className="mt-4 mx-4 text-center text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
        Thank you for joining us, and we&apos;re excited to have you on board!
      </p>
      
      <Link
        className="m-8 mx-20 inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
        href="/dashboard/profile"
      >
        Connect Account
      </Link>
    </div>
  );
}
