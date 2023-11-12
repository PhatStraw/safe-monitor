"use client";
import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [parentEmail, setParentEmail] = useState("");
  const [user, setUser] = useState(null);
  const [secondaryAccounts, setSecondaryAccounts] = useState([]);
  console.log(secondaryAccounts, user);
  useEffect(() => {
    const fetchSecondaryAccounts = async () => {
      const user_id = "1"; // replace with actual user_id
      const response = await fetch(`/api/secondary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id }), // send the user_id in the request body
      });
      const fetchedSecondaryAccounts = await response.json();
      setSecondaryAccounts(fetchedSecondaryAccounts);
    };
    fetchSecondaryAccounts();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const email = "kevindsimsjr@gmail.com"; // replace with actual email
      const response = await fetch(`/api/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // send the email in the request body
      });
      const fetchedUser = await response.json();
      setUser(fetchedUser);
    };

    fetchUser();
  }, []);

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
  if (!secondaryAccounts.data) {
    return (
      <div className="m-7 font-bold">
        Welcome! If you haven't already, please navigate to your profile and
        complete the{" "}
        <span className="border-b border-b-2 border-b-black">
          Connect With Google
        </span>{" "}
        Field. Once you hit save, you&apos;ll receive an email notification
        whenever your content is linked and ready to be viewed. Thank you for
        joining us, and we&apos;re excited to have you on board!
      </div>
    );
  }
  return (
    <div className="px-5 bg-gray-100 overflow-auto">
      {secondaryAccounts.data.map((account) => (
        <div key={account.account_id} className="mb-10 bg-white rounded shadow p-5">
          <h2 className="text-2xl font-bold mb-2">{account.name} ({account.email})</h2>
          <h3 className="text-xl font-semibold mb-2">YouTube Activity Summary</h3>
          <h4 className="text-lg font-semibold mb-1">{account.youtube_data.email_newsletter.subject}</h4>
          <p className="mb-3">{account.youtube_data.email_newsletter.introduction}</p>
          <h4 className="text-lg font-semibold mb-1">Content Analysis</h4>
          {account.youtube_data.email_newsletter.content_analysis.map((analysis, index) => (
            <div key={index} className="mb-2">
              <h5 className="font-medium mb-1">{analysis.topic}</h5>
              <p className="text-sm">{analysis.content}</p>
            </div>
          ))}
          <h4 className="text-lg font-semibold mb-1">Psychological Analysis</h4>
          <p className="mb-3">{account.youtube_data.email_newsletter.psych_analysis.overview}</p>
          <h5 className="font-medium mb-1">Topics to Discuss</h5>
          <ul className="list-disc list-inside mb-3">
            {account.youtube_data.email_newsletter.psych_analysis.topics_to_discuss.map((topic, index) => (
              <li key={index} className="text-sm">{topic}</li>
            ))}
          </ul>
          <p className="mb-1">{account.youtube_data.email_newsletter.closing}</p>
          <p>{account.youtube_data.email_newsletter.sign_off}</p>
        </div>
      ))}
    </div>
  );
}
