'use client'
import { useState, useEffect } from 'react';

const useActiveUser = (email) => {
  const [user, setUser] = useState();
    const [loadingUser, setLoadingUser] = useState(true)
  useEffect(() => {
    const activeUser = async () => {
      setLoadingUser(true);
      const res = await fetch('/api/user', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      setUser(data.user);
      setLoadingUser(false)
    };

    activeUser();
  }, [email]);
  return {user, loadingUser};
};

export default useActiveUser