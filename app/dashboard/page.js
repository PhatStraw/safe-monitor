"use client";
import React, { useState, useEffect } from "react";
import useSecondaryAccounts from "@/components/hooks/UseSecondaryAccounts";
import useFetchSession from "@/components/hooks/UseFetchSession";
import Link from "next/link";
export default function Dashboard() {
  const session = useFetchSession();
  console.log("======SESSION=====",session);
  const secondaryAccounts = useSecondaryAccounts({ email: session?.user?.email });

  if (!secondaryAccounts.data) {
    return (
      <div className="w-full shadow-xl t-7 font-bold flex flex-col justify-center text-center">
        <h1 className="text-4xl mx-2 font-bold tracking-tighter md:text-5xl lg:text-6xl/none">
          Welcome to Safe Monitor
        </h1>
        <p className="mt-4 mx-4 text-center text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
          Thank you for joining us, and we&apos;re excited to have you on board!
        </p>
        <Link
          className="mt-8 mx-20 inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
          href="/dashboard/profile"
        >
          Continue
        </Link>
      </div>
    );
  }
  return (
    <div className="overflow-auto bg-white shadow p-5">
      {secondaryAccounts.data.map((account) => (
        <div key={account.account_id} className="">
          <h2 className="text-2xl font-bold mb-2">
            {account.name} ({account.email})
          </h2>
          <h3 className="text-xl font-semibold mb-2">
            YouTube Activity Summary
          </h3>
          <h4 className="text-lg font-semibold mb-1">
            {account.youtube_data.email_newsletter.subject}
          </h4>
          <p className="mb-3">
            {account.youtube_data.email_newsletter.introduction}
          </p>
          <h4 className="text-lg font-semibold mb-1">Content Analysis</h4>
          {account.youtube_data.email_newsletter.content_analysis.map(
            (analysis, index) => (
              <div key={index} className="mb-2">
                <h5 className="font-medium mb-1">{analysis.topic}</h5>
                <p className="text-sm">{analysis.content}</p>
              </div>
            )
          )}
          <h4 className="text-lg font-semibold mb-1">Psychological Analysis</h4>
          <p className="mb-3">
            {account.youtube_data.email_newsletter.psych_analysis.overview}
          </p>
          <h5 className="font-medium mb-1">Topics to Discuss</h5>
          <ul className="list-disc list-inside mb-3">
            {account.youtube_data.email_newsletter.psych_analysis.topics_to_discuss.map(
              (topic, index) => (
                <li key={index} className="text-sm">
                  {topic}
                </li>
              )
            )}
          </ul>
          <p className="mb-1">
            {account.youtube_data.email_newsletter.closing}
          </p>
          <p>{account.youtube_data.email_newsletter.sign_off}</p>
        </div>
      ))}
    </div>
  );
}
