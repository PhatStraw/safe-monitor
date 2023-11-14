/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/0M462Ng5a0Q
 */
import { Input } from "@/components/ui/input";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import useSecondaryAccounts from "@/components/hooks/UseSecondaryAccounts";
import { toast } from 'react-hot-toast';
function handleGoogleSignIn() {
  const redirectUri = "http://localhost:3000"; // Replace with your redirect URI
  const clientId =
   process.env.NEXT_PUBLIC_GOOGLE_ID; // Replace with your client ID
  const scope =
    "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly"; // Adjust scope as needed

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline&prompt=consent`;

  // Redirect the user to the auth URL
  window.location.href = authUrl;
}

export function UserSettings({ session }) {
  const [newAccount, setNewAccount] = useState();
  const email = session?.user.email; // replace with actual user_id
  const secondaryAccounts = useSecondaryAccounts({email});

  useEffect(() => {
    const createSecondaryFromCode = async (code) => {
      // Create a loading toast
      const toastId = toast.loading('Adding Account...');
  
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
        toast.success('Successfully added account!');
      } catch (error) {
        console.error("Error exchanging code for tokens:", error);
  
        // Dismiss the loading toast and show an error toast
        toast.dismiss(toastId);
        toast.error('Error creating account');
      }
    };
  
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && session?.user.email && session.user.email.endsWith('.com')) {
      createSecondaryFromCode(code);
    }
  }, [session?.user.email]);

  const tailStr = (str) => {
    let newStr;
    if(str.length > 14){
      newStr = str.slice(0,10)
      return(newStr + "...")
    }
    return str
  }

  return (
    <div className="w-full h-full flex bg-white rounded shadow-xl p-5 overflow-y-auto">
      <main className="w-2/3 h-full p-6 ">
        {/* <section className="mb-8" id="avatar">
          <h2 className="text-xl font-semibold mb-2">Avatar</h2>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage alt="User's Avatar" src="/placeholder-avatar.jpg" />
              <AvatarFallback>NA</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Avatar</Button>
          </div>
        </section> */}
        {/* <section className="mb-8" id="name">
          <h2 className="text-xl font-semibold mb-2">Name</h2>
          <Input id="user-name" placeholder="Enter your name" />
        </section> */}
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
              adding account for {newAccount.data.name} please check back
              in an hour
            </h3>
          )}
            <Button
              id="google-signin"
              className="text-white hover:bg-primary/60 transition duration-200"
              onClick={handleGoogleSignIn}
            >
              Connect with Google
            </Button>
        </section>
        {/* <section className="mb-8" id="bio">
          <h2 className="text-xl font-semibold mb-2">Bio</h2>
          <Textarea
            className="min-h-[100px]"
            id="bio"
            placeholder="Enter your bio"
          />
        </section>
        <Button className="ml-auto text-white">Save</Button> */}
      </main>
    </div>
  );
}
