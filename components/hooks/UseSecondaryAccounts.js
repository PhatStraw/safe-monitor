import { useState, useEffect } from "react";

export default function useSecondaryAccounts({user_id, email}) {
  const [secondaryAccounts, setSecondaryAccounts] = useState([]);

  useEffect(() => {
    const fetchSecondaryAccounts = async () => {
      console.log("fetch",email, user_id)
      const response = await fetch(`/api/secondary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, email }),
      });
      const fetchedSecondaryAccounts = await response.json();
      setSecondaryAccounts(fetchedSecondaryAccounts);
    };
    fetchSecondaryAccounts();
  }, [user_id, email]);

  return secondaryAccounts;
}