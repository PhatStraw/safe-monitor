import { useState, useEffect } from "react";

export default function useSecondaryAccounts(user_id) {
  const [secondaryAccounts, setSecondaryAccounts] = useState([]);

  useEffect(() => {
    const fetchSecondaryAccounts = async () => {
      const response = await fetch(`/api/secondary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id }),
      });
      const fetchedSecondaryAccounts = await response.json();
      setSecondaryAccounts(fetchedSecondaryAccounts);
    };
    fetchSecondaryAccounts();
  }, [user_id]);

  return secondaryAccounts;
}