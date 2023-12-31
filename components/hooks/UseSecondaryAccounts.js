'use client';
import { useState, useEffect } from "react";

export default function useSecondaryAccounts({user_id, email}) {
  const [secondaryAccounts, setSecondaryAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSecondaryAccounts = async () => {
      setIsLoading(true);
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
    setIsLoading(false);
  }, [user_id, email]);
  
  return { data: secondaryAccounts, isLoading };
}