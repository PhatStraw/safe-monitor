"use client";
import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [parentEmail, setParentEmail] = useState("");
  const [user, setUser] = useState(null);
  const [secondaryAccounts, setSecondaryAccounts] = useState([]);
console.log(secondaryAccounts, user)
  useEffect(() => {
    const fetchSecondaryAccounts = async () => {
      const user_id = '2'; // replace with actual user_id
      const response = await fetch(`/api/secondary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const email = 'kevindsimsjr@gmail.com'; // replace with actual email
      const response = await fetch(`/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
