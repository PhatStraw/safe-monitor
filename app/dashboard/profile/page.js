"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useSecondaryAccounts from "@/components/hooks/UseSecondaryAccounts";
import { toast } from "react-hot-toast";
import Link from "next/link";
import useActiveUser from "@/components/hooks/UseActiveUser";

function handleGoogleSignIn() {
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI; // Replace with your redirect URI
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ID; // Replace with your client ID
  const scope =
    "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly"; // Adjust scope as needed

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline&prompt=consent`;

  // Redirect the user to the auth URL
  window.location.href = authUrl;
}

export default function Page() {
  const { data: session, status } = useSession();
  const email = session?.user.email; // replace with actual user_id
  const {user: activeUser, loadingUser} = useActiveUser(email);
  const { data: secondaryAccounts, isLoading } = useSecondaryAccounts({
    email,
  });
  const [newAccount, setNewAccount] = useState();
  const loading = status === "loading";
  console.log(activeUser);
  useEffect(() => {
    const createSecondaryFromCode = async (code) => {
      // Create a loading toast
      const toastId = toast.loading("Adding Account...");

      try {
        const response = await fetch("/api/link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: code, email: session.user.email }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setNewAccount(data);

        // Dismiss the loading toast and show a success toast
        toast.dismiss(toastId);
        toast.success("Successfully added account!");
console.log("DATASECONDARY", data.data.secondary_row)
        //upload Youtube Data
        const uploadDataResponse = await fetch(
          `${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}/api/fetch_youtube`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              secondary_row: data.data.secondary_row,
              email
            }),
          }
        );
        console.log("uploadedDataRes", await uploadDataResponse.json());
      } catch (error) {
        console.error("Error exchanging code for tokens:", error);

        // Dismiss the loading toast and show an error toast
        toast.dismiss(toastId);
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && session?.user.email && session.user.email.endsWith(".com")) {
      createSecondaryFromCode(code);
    }
  }, [session?.user.email]);

  const tailStr = (str) => {
    let newStr;
    if (str.length > 14) {
      newStr = str.slice(0, 10);
      return newStr + "...";
    }
    return str;
  };

  const handleBilling = async () => {
    console.log("========ID=======", activeUser?.stripe_id);
    const response = await fetch("/api/portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: activeUser?.stripe_id, // replace with the customer's ID
      }),
    });

    const { url } = await response.json();

    window.location.assign(url);
  };

  if (loading) return <p>Loading...</p>;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full h-full flex bg-white rounded shadow-xl p-5 overflow-y-auto">
      <main className="w-2/3 h-full p-6 ">
        <section className="mb-8" id="parent-email">
          <h2 className="text-xl font-semibold mb-2">Accounts</h2>
          <div className="flex flex-col md:flex-row mb-1">
            {secondaryAccounts &&
              secondaryAccounts.data?.map((account, index) => (
                <div
                  key={index}
                  className="bg-primary/60 text-center text-white mb-1 md:mr-1 py-2 px-4 rounded"
                >
                  {tailStr(account.email)}
                </div>
              ))}
          </div>
          {newAccount && (
            <h3 className="text-md font-semibold mb-2">
              adding account for {newAccount.data.name}, we will send you an
              email when your analysis is ready.
            </h3>
          )}
          <Button
            id="google-signin"
            className="text-white hover:bg-primary/60 transition duration-200"
            onClick={handleGoogleSignIn}
          >
            Connect Child
          </Button>
        </section>
        <section className="mb-8 " id="parent-email">
          <h2 className="text-xl font-semibold mb-4">Billing</h2>
          <div className="flex flex-col w-44">
            <Link
              className="bg-primary font-semibold text-sm rounded text-center  p-2 text-white hover:bg-primary/60 transition duration-200 mb-1"
              href={"/billing"}
            >
              Connect Card
            </Link>
            {activeUser?.stripe_id && (
              <Button
                id="google-signin"
                className="text-white font-semibold hover:bg-primary/60 transition duration-200"
                onClick={handleBilling}
              >
                Update Account
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
